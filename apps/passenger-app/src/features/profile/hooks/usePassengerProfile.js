import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAuthSession } from "../../auth/context/AuthSessionContext";
import { getCurrentPassengerProfile, updateCurrentPassengerProfile, profileErrorMessage } from "../services/passenger-profile.api";
import { getVerification } from "../../verification/services/verification.api";
import { notifications, safeFeedbackMessage } from "../../../notifications/notification-store";

const sameOwner = (a, b) => !!a && !!b && a.user.id === b.user.id && a.accessToken === b.accessToken;

// Shared by Profile and its protected Emergency Contact detail. The existing
// API's expected-value conflict checks and session ownership remain authoritative.
export default function usePassengerProfile({ includeIdentity = false } = {}) {
  const { session, updatePassengerName } = useAuthSession();
  const [state, setState] = useState({ loading: true });
  const [identity, setIdentity] = useState({ loading: true });
  const [editing, setEditing] = useState(null), [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(""), [fieldErrors, setFieldErrors] = useState({});
  const focused = useRef(false), generation = useRef(0), readLock = useRef(null), writeLock = useRef(false);
  const current = useRef(session); current.current = session;
  const load = useCallback(async () => {
    if (readLock.current || writeLock.current || !current.current) return;
    const owner = current.current, attempt = ++generation.current, lock = {};
    readLock.current = lock;
    const valid = () => focused.current && generation.current === attempt && sameOwner(current.current, owner);
    setState(previous => ({ ...(sameOwner(previous.owner, owner) ? previous : {}), owner, loading: true, error: "" }));
    if (includeIdentity) setIdentity(previous => ({ ...(sameOwner(previous.owner, owner) ? previous : {}), owner, loading: true, error: false }));
    const profileRead = getCurrentPassengerProfile(owner.user.id).then(profile => {
      if (valid()) setState({ owner: current.current, profile, loading: false });
    }).catch(error => {
      if (valid()) setState(previous => ({ ...previous, loading: false, error: profileErrorMessage(error), status: error.status }));
    });
    const identityRead = includeIdentity ? getVerification(owner).then(verification => {
      if (valid()) setIdentity({ owner, status: verification.status, loading: false });
    }).catch(() => {
      if (valid()) setIdentity(previous => ({ ...previous, owner, loading: false, error: true }));
    }) : Promise.resolve();
    await Promise.all([profileRead, identityRead]);
    if (readLock.current === lock) readLock.current = null;
  }, [session?.user?.id, session?.accessToken, includeIdentity]);
  useFocusEffect(useCallback(() => {
    focused.current = true; writeLock.current = false; setSaving(false); setEditing(null); void load();
    return () => { focused.current = false; generation.current++; readLock.current = null; writeLock.current = false; };
  }, [load]));
  const beginEdit = mode => { setEditing({ mode, base: state.profile }); setFieldErrors({}); setSaveError(""); };
  const cancelEdit = () => { setEditing(null); setSaveError(""); };
  const saveChanges = async (mode, draft, baseline) => {
    if (writeLock.current || readLock.current) return false;
    writeLock.current = true;
    const owner = current.current, attempt = ++generation.current;
    const valid = () => focused.current && generation.current === attempt && sameOwner(current.current, owner);
    setSaving(true); setSaveError(""); setFieldErrors({});
    const changes = mode === "name" ? { fullName: draft.fullName, expectedFullName: baseline.fullName }
      : { emergencyContact: draft, expectedEmergencyContact: baseline.emergencyContact };
    try {
      const saved = await updateCurrentPassengerProfile(owner, changes);
      if (!valid()) return false;
      const savedOwner = mode === "name" ? updatePassengerName(owner, saved.fullName) : owner;
      if (!savedOwner) return false;
      setState(previous => ({
        ...previous, owner: savedOwner, profile: {
          ...previous.profile,
          ...(mode === "name" ? { fullName: saved.fullName } : { emergencyContact: saved.emergencyContact }),
        }
      }));
      setEditing(null);
      notifications.notify({
        type: "success", title: mode === "name" ? "Profile Updated" : "Emergency Contact Updated",
        message: mode === "name" ? "Profile saved." : draft ? "Emergency contact saved." : "Emergency contact removed."
      });
      return true;
    } catch (error) {
      if (!valid()) return false;
      setSaveError(safeFeedbackMessage(profileErrorMessage(error)));
      setFieldErrors(Object.fromEntries((error.details || []).map(detail => [detail.field.split(".").pop(), detail.message])));
      notifications.notify({ type: "error", title: "Unable to Save", message: profileErrorMessage(error) });
      return false;
    } finally { if (valid()) { writeLock.current = false; setSaving(false); } }
  };
  const owned = sameOwner(state.owner, session);
  return {
    session, state: owned ? state : { loading: true }, profile: owned ? state.profile : null,
    identity: sameOwner(identity.owner, session) ? identity : { loading: true },
    editing, saving, saveError, fieldErrors, load, beginEdit, cancelEdit, saveChanges
  };
}
