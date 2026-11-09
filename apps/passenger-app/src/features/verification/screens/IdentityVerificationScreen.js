import React, { useCallback, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import SaheliLoader from '../../../components/SaheliLoader';
import { useFocusEffect } from "expo-router";
import ScreenContainer from "../../../components/ScreenContainer";
import BackButton from '../../../components/BackButton';
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { NavigationError, usePassengerNavigation } from "../../../navigation/PassengerBottomNavigation";
import { useAuthSession } from "../../auth/context/AuthSessionContext";
import { colors } from "../../../theme/colors";
import { getVerification, imageFieldError, submitVerification, validateSelections, VERIFICATION_LABELS } from "../services/verification.api";
import { releaseImage, selectVerificationImage } from "../services/image-selection";
import ProtectedDocument from "../components/ProtectedDocument";
import { notifications, safeFeedbackMessage } from "../../../notifications/notification-store";

const sameOwner = (a, b) => a?.user?.id === b?.user?.id && a?.accessToken === b?.accessToken;
function Action({ label, text = label, onPress, disabled = false, primary = false, busy = false, compact = false, quiet = false, destructive = false }) {
  const icon = primary ? "shield-check" : label.startsWith("Capture") ? "camera" : /^(Choose|Replace)/.test(label) ? "image" : label.startsWith("Refresh") ? "arrow-clockwise" : null;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ busy, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, primary ? styles.primaryButton : styles.secondaryButton, compact && styles.compactButton, quiet && styles.quietButton, disabled && styles.disabled, pressed && styles.pressed]}>
    {busy ? <SaheliLoader mode="inline" color={primary ? colors.textOnPrimary : colors.primary} label={label} /> : icon && <SaheliIcon name={icon} size={20} color={primary ? colors.textOnPrimary : colors.primaryLight} />}<Text style={[styles.buttonText, !primary && styles.secondaryButtonText, destructive && styles.destructiveText]}>{text}</Text>
  </Pressable>;
}
function SelectedImage({ image, label, onReplace, onRemove, onCamera, disabled }) {
  return <View style={styles.selectedImage}>
    <Image accessibilityLabel={label} source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />
    <View style={styles.controls}>
      <Action compact label={`Replace ${label.replace("Selected ", "")}`} text="Replace" disabled={disabled} onPress={onReplace} />
      {onCamera && <Action compact label="Capture selfie" text="Camera" disabled={disabled} onPress={onCamera} />}
      <Action compact destructive label={`Remove ${label.replace("Selected ", "")}`} text="Remove" disabled={disabled} onPress={onRemove} />
    </View>
  </View>;
}
export default function IdentityVerificationScreen() {
  const { session } = useAuthSession();
  const { open, error: navigationError } = usePassengerNavigation();
  const [state, setState] = useState({ loading: true });
  const [cnics, setCnics] = useState([]), [selfie, setSelfie] = useState(null);
  const [errors, setErrors] = useState({}), [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  const [picking, setPicking] = useState(false);
  const current = useRef(session), active = useRef(false), generation = useRef(0), locked = useRef(false), selection = useRef({ cnics: [], selfie: null });
  current.current = session;
  const clearSelections = () => {
    [...selection.current.cnics, selection.current.selfie].forEach(releaseImage);
    selection.current = { cnics: [], selfie: null }; setCnics([]); setSelfie(null);
  };
  const load = useCallback(async () => {
    const attempt = ++generation.current, owner = current.current;
    setState(previous => ({ ...(sameOwner(previous.owner, owner) ? previous : {}), loading: true, owner, error: undefined })); setErrors({}); setNotice("");
    try {
      const verification = await getVerification(owner);
      if (active.current && attempt === generation.current && sameOwner(owner, current.current)) {
        if (!["not_submitted", "rejected"].includes(verification.status) || verification.documentsDeleted) clearSelections();
        setState({ owner, verification });
      }
    } catch (error) {
      if (active.current && attempt === generation.current && sameOwner(owner, current.current)) setState(previous => ({ ...previous, owner, loading: false, error: error.message, refreshRequired: true }));
    }
  }, [session?.user?.id, session?.accessToken]);
  useFocusEffect(useCallback(() => {
    active.current = true; locked.current = false; setBusy(false); setPicking(false); void load();
    return () => { active.current = false; generation.current++; locked.current = false; clearSelections(); };
  }, [load]));
  const choose = async (kind, camera = false, index = -1) => {
    if (locked.current || state.loading || state.refreshRequired) return;
    locked.current = true; setBusy(true); setPicking(true); setErrors({}); setNotice("");
    const owner = current.current, attempt = generation.current;
    let image;
    try {
      image = await selectVerificationImage(kind, camera);
      if (!image) return;
      if (!active.current || attempt !== generation.current || !sameOwner(owner, current.current)) { releaseImage(image); return; }
      const error = imageFieldError(image); if (error) { releaseImage(image); setErrors({ [kind === "cnic" ? "cnics" : "selfie"]: error }); return; }
      if (kind === "selfie") { releaseImage(selection.current.selfie); selection.current.selfie = image; setSelfie(image); }
      else {
        const next = [...selection.current.cnics];
        if (index >= 0) { releaseImage(next[index]); next[index] = image; }
        else if (next.length < 2) next.push(image);
        else { releaseImage(image); return; }
        selection.current.cnics = next; setCnics(next);
      }
    } catch (error) { if (active.current && sameOwner(owner, current.current)) setErrors({ [kind === "cnic" ? "cnics" : "selfie"]: error.message?.startsWith("Camera permission was denied.") ? error.message : "Unable to select an image. Please retry or use another image." }); }
    finally { if (active.current && attempt === generation.current) { locked.current = false; setBusy(false); setPicking(false); } }
  };
  const submit = async () => {
    if (locked.current || state.loading || state.refreshRequired || !state.verification || !sameOwner(state.owner, current.current)) return;
    const validation = validateSelections(cnics, selfie); setErrors(validation); if (Object.keys(validation).length) return;
    locked.current = true; setBusy(true); setNotice("");
    const owner = current.current, attempt = ++generation.current;
    try {
      const verification = await submitVerification(owner, state.verification, cnics, selfie);
      if (active.current && attempt === generation.current && sameOwner(owner, current.current)) {
        clearSelections(); setState({ owner: current.current, verification }); setNotice(verification.status === "pending_review" ? "Documents received. Awaiting manual administrator review." : "Documents received. Current identity status refreshed.");
        notifications.notify({ type: "info", title: "Verification Submitted", message: "Documents received. Your identity status has been refreshed. Approval requires administrator review." });
      }
    } catch (error) {
      if (active.current && attempt === generation.current && sameOwner(owner, current.current)) {
        const message = safeFeedbackMessage(error.message, "Unable to submit documents. Refresh status before retrying.");
        setErrors({ submit: message });
        notifications.notify({ type: "error", title: "Submission Failed", message });
        // A 409 or lost acknowledgement may mean the server changed. Require a
        // status refresh instead of allowing a blind duplicate submission.
        setState(s => ({ ...s, refreshRequired: true }));
      }
    } finally { if (active.current && attempt === generation.current) { locked.current = false; setBusy(false); } }
  };
  const removeSelection = (kind, index = -1) => {
    if (locked.current || state.loading || state.refreshRequired) return;
    if (kind === "selfie") { releaseImage(selection.current.selfie); selection.current.selfie = null; setSelfie(null); }
    else { const next = [...selection.current.cnics]; releaseImage(next[index]); next.splice(index, 1); selection.current.cnics = next; setCnics(next); }
  };
  const owned = sameOwner(state.owner, session);
  const verification = owned && state.verification;
  const canSubmit = verification && ["not_submitted", "rejected"].includes(verification.status) && verification.submissionAvailable;
  const controlsDisabled = busy || !!state.loading || !!state.refreshRequired;
  const statusTone = verification?.status === "approved" ? colors.success : verification?.status === "rejected" ? colors.error : verification?.status === "pending_review" ? colors.warning : colors.info;
  return <ScreenContainer scrollable edges={["top"]} contentStyle={styles.content}>
    <View style={styles.header}>
      <BackButton compact label="Back to Profile" onPress={() => open("Profile")} />
      <Text accessibilityRole="header" style={styles.title}>Identity Verification</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Refresh verification status" accessibilityState={{ busy: !!state.loading, disabled: busy || !!state.loading }} disabled={busy || state.loading} onPress={load} style={({ pressed }) => [styles.headerAction, busy && styles.disabled, pressed && styles.headerPressed]}>{state.loading ? <SaheliLoader mode="inline" color={colors.primaryLight} label="Refreshing identity status" /> : <SaheliIcon name="arrow-clockwise" size={23} />}</Pressable>
    </View>
    <NavigationError message={navigationError} />
    {picking && <Action quiet label="Cancel image selection" disabled={false} onPress={() => { generation.current++; locked.current = false; setBusy(false); setPicking(false); }} />}
    {(!verification && state.loading) || !owned ? <SaheliLoader label="Loading identity status..." />
      : state.error && !verification ? <View style={styles.card}><Text accessibilityRole="alert" style={styles.error}>{state.error}</Text><Action label="Retry verification status" onPress={load} /></View>
        : verification ? <>
          {!!state.error && <View style={styles.card}><Text accessibilityRole="alert" style={styles.error}>{state.error}</Text><Action label="Retry verification status" onPress={load} /></View>}
          <View testID="verification-status-summary" style={styles.statusSummary}>
            <View style={styles.statusLine}><SaheliIcon name="shield-check" size={25} color={verification.status === "approved" ? colors.success : colors.primaryLight} /><Text style={[styles.status, { color: statusTone }]}>{VERIFICATION_LABELS[verification.status]}</Text></View>
            {verification.status === "pending_review" && <Text style={styles.body}>Awaiting manual administrator review.</Text>}
            {verification.status === "approved" && <Text style={styles.body}>An administrator has approved your identity.</Text>}
            {verification.rejectionReason && <Text style={styles.body}>Rejection reason: {verification.rejectionReason}</Text>}
            {verification.reverificationReason && <Text style={styles.body}>New documents requested: {verification.reverificationReason}</Text>}
            {verification.documentsDeleted && <Text style={styles.body}>Your identity documents have been removed under the retention policy.</Text>}
          </View>
          <Text style={styles.footnote}>Identity review is separate from email verification.</Text>
          {!!notice && <Text accessibilityRole="alert" style={styles.body}>{notice}</Text>}
          {verification.documents.map(doc => <View key={verification.submissionId + '-' + doc.key} style={styles.documentSection}><Text style={styles.section}>Submitted {doc.kind === "selfie" ? "selfie" : "CNIC"}</Text><ProtectedDocument owner={session} documentKey={doc.key} /></View>)}
          {!verification.submissionAvailable && <Text accessibilityRole="alert" style={styles.error}>Secure document submission is currently unavailable. You can refresh your status and try again later.</Text>}
          {canSubmit && <>
            <View testID="cnic-section" style={styles.documentSection}>
              <View style={styles.sectionHeader}><View style={styles.sectionTitle}><SaheliIcon name="identification-card" size={23} /><Text style={styles.section}>CNIC images</Text></View><Text style={styles.selectionCount}>{cnics.length} / 2 selected</Text></View>
              <Text style={styles.body}>One or two JPEG/PNG images. Up to 5 MiB and 12 megapixels each.</Text>
              {cnics.map((image, index) => <SelectedImage key={image.uri} image={image} label={'Selected CNIC ' + (index + 1)} disabled={controlsDisabled} onReplace={() => choose("cnic", false, index)} onRemove={() => removeSelection("cnic", index)} />)}
              {cnics.length < 2 && <View style={styles.controls}>
                <Action compact label="Choose CNIC image" text={cnics.length ? "Add image" : "Select image"} disabled={controlsDisabled} onPress={() => choose("cnic")} />
                <Action compact label="Capture CNIC image" text="Use camera" disabled={controlsDisabled} onPress={() => choose("cnic", true)} />
              </View>}
              {!!errors.cnics && <Text accessibilityRole="alert" style={styles.error}>{errors.cnics}</Text>}
            </View>
            <View testID="selfie-section" style={styles.documentSection}>
              <View style={styles.sectionHeader}><View style={styles.sectionTitle}><SaheliIcon name="user-circle" size={23} /><Text style={styles.section}>Selfie</Text></View><Text style={styles.selectionCount}>{selfie ? "Selected" : "Required"}</Text></View>
              <Text style={styles.body}>A clear photo of your face in good lighting. JPEG/PNG, up to 5 MiB.</Text>
              {selfie ? <SelectedImage image={selfie} label="Selected selfie" disabled={controlsDisabled} onReplace={() => choose("selfie")} onRemove={() => removeSelection("selfie")} onCamera={() => choose("selfie", true)} /> : <View style={styles.controls}>
                <Action compact label="Choose selfie" text="Select image" disabled={controlsDisabled} onPress={() => choose("selfie")} />
                <Action compact label="Capture selfie" text="Use camera" disabled={controlsDisabled} onPress={() => choose("selfie", true)} />
              </View>}
              {!!errors.selfie && <Text accessibilityRole="alert" style={styles.error}>{errors.selfie}</Text>}
            </View>
            <Text style={styles.footnote}>By submitting, you consent to protected storage for identity review by authorized administrators. Documents are removed on account deletion or after final FYP evaluation, whichever comes first.</Text>
            <Action primary busy={busy} label={busy ? "Processing documents..." : verification.status === "rejected" ? "Resubmit identity documents" : "Submit identity documents"}
              text={busy ? "Processing documents..." : verification.status === "rejected" ? "Resubmit for Verification" : "Submit for Verification"} disabled={controlsDisabled} onPress={submit} />
            {(cnics.length > 0 || !!selfie) && <Action quiet label="Clear selected images" text="Clear selected images" disabled={controlsDisabled} onPress={clearSelections} />}
          </>}
          {!!errors.submit && <Text accessibilityRole="alert" style={styles.error}>{errors.submit}</Text>}
          {state.refreshRequired && <Text style={styles.body}>Refresh status before selecting documents or retrying.</Text>}
        </> : null}
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingBottom: 18, gap: 12 }, header: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  headerAction: { minWidth: 44, minHeight: 48, justifyContent: "center", alignItems: "center", borderRadius: 14 },
  headerPressed: { backgroundColor: colors.accentLight },
  title: { flex: 1, color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 17, lineHeight: 24, textAlign: "center" },
  body: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 }, footnote: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 19 },
  card: { paddingVertical: 14, gap: 12 }, statusSummary: { paddingVertical: 10, gap: 8 }, statusLine: { flexDirection: "row", alignItems: "center", gap: 10 }, status: { fontFamily: "Inter_600SemiBold", fontSize: 17, lineHeight: 24 },
  documentSection: { paddingTop: 15, paddingBottom: 3, borderTopWidth: 1, borderTopColor: colors.divider, gap: 11 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, sectionTitle: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }, section: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 }, selectionCount: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, selectedImage: { gap: 8 },
  button: { minHeight: 50, padding: 13, borderRadius: 14, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" }, compactButton: { flexGrow: 1, flexBasis: 80, minHeight: 46, paddingHorizontal: 10, paddingVertical: 11 },
  quietButton: { backgroundColor: "transparent" }, primaryButton: { backgroundColor: colors.primary }, secondaryButton: { backgroundColor: colors.surfaceAlt }, secondaryButtonText: { color: colors.primaryLight }, destructiveText: { color: colors.error }, pressed: { opacity: 0.8 }, disabled: { opacity: 0.5 },
  buttonText: { color: colors.textOnPrimary, fontFamily: "Inter_600SemiBold", fontSize: 13, flexShrink: 1, textAlign: "center" }, error: { color: colors.error, fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 21 },
  preview: { width: "100%", height: 144, borderRadius: 12 },
});
