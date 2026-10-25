import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import AppButton from "../../../components/AppButton";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { radius } from "../../../theme/spacing";
import { showAlert } from "../../../utils/alert";

import { getDriverProfile } from "../../auth/services/driver-auth.api";
import {
  clearDriverSession,
  getDriverSession,
} from "../../auth/services/auth-session";

// How each admin verification status is shown to the driver.
const VERIFICATION = {
  pending: {
    label: "Under review",
    icon: "◷",
    color: colors.warning,
    background: colors.warningSoft,
    title: "Your application is being reviewed",
    body: "Our team is checking your CNIC, license and vehicle. This usually takes 1-2 working days. Pull down to refresh.",
  },
  approved: {
    label: "Verified",
    icon: "✓",
    color: colors.success,
    background: colors.successSoft,
    title: "You're verified and ready to drive",
    body: "Go online to start receiving ride requests.",
  },
  rejected: {
    label: "Not approved",
    icon: "!",
    color: colors.error,
    background: colors.errorSoft,
    title: "Your application was not approved",
    body: "Please contact Saheli Safar support to update your details.",
  },
};

const VEHICLE_ICONS = { car: "🚗", bike: "🏍️", rickshaw: "🛺" };

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export default function HomeScreen({ navigation }) {
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const goToLogin = useCallback(async () => {
    await clearDriverSession();
    navigation.reset({
      index: 1,
      routes: [{ name: "Welcome" }, { name: "Login" }],
    });
  }, [navigation]);

  const loadProfile = useCallback(async () => {
    setError("");

    const session = await getDriverSession();

    // Access tokens last 15 minutes. Ask the driver to log in again.
    if (!session) {
      showAlert("Session Expired", "Please log in again.");
      goToLogin();
      return;
    }

    try {
      const response = await getDriverProfile(session.accessToken);
      setDriver(response.user);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        showAlert("Session Ended", err.message);
        goToLogin();
        return;
      }

      setError(err.message);
    }
  }, [goToLogin]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    showAlert("Log out?", "You will need to log in again to drive.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: goToLogin },
    ]);
  };

  const handleToggleOnline = (value) => {
    setIsOnline(value);

    if (value) {
      showAlert(
        "You're online",
        "Ride requests will appear here once ride matching is connected to the backend."
      );
    }
  };

  if (!driver) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        {error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <AppButton title="Try again" onPress={loadProfile} />
          </>
        ) : (
          <ActivityIndicator color={colors.primary} size="large" />
        )}
      </ScreenContainer>
    );
  }

  const status =
    VERIFICATION[driver.verificationStatus] || VERIFICATION.pending;
  const isApproved = driver.verificationStatus === "approved";
  const { vehicle } = driver;

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name} numberOfLines={1}>
            {driver.fullName}
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          style={styles.avatar}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Text style={styles.avatarText}>
            {(driver.fullName || "?").charAt(0).toUpperCase()}
          </Text>
        </Pressable>
      </View>

      {/* Online toggle */}
      <View style={[styles.onlineCard, isOnline && styles.onlineCardActive]}>
        <View style={styles.onlineText}>
          <Text style={styles.onlineTitle}>
            {isOnline ? "You're online" : "You're offline"}
          </Text>
          <Text style={styles.onlineSub}>
            {isApproved
              ? isOnline
                ? "Waiting for ride requests…"
                : "Go online to receive rides."
              : "Available after your account is verified."}
          </Text>
        </View>

        <Switch
          value={isOnline}
          onValueChange={handleToggleOnline}
          disabled={!isApproved}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor={colors.white}
          accessibilityLabel="Go online"
        />
      </View>

      {/* Verification status */}
      <View style={[styles.statusCard, { borderColor: status.color }]}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: status.background }]}>
            <Text style={[styles.statusIconText, { color: status.color }]}>
              {status.icon}
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: status.background }]}>
            <Text style={[styles.pillText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.statusTitle}>{status.title}</Text>
        <Text style={styles.statusBody}>{status.body}</Text>

        {driver.verificationStatus === "rejected" &&
          !!driver.rejectionReason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>REASON FROM ADMIN</Text>
              <Text style={styles.reasonText}>{driver.rejectionReason}</Text>
            </View>
          )}
      </View>

      {/* Vehicle */}
      {vehicle && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR VEHICLE</Text>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleIcon}>
              {VEHICLE_ICONS[vehicle.type] || "🚗"}
            </Text>
            <View style={styles.vehicleText}>
              <Text style={styles.vehicleName}>
                {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.vehicleSub}>
                {vehicle.color} · {vehicle.year}
              </Text>
            </View>
            <View style={styles.plate}>
              <Text style={styles.plateText}>{vehicle.plateNumber}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Account details */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>ACCOUNT DETAILS</Text>
        <DetailRow label="Email" value={driver.email} />
        <DetailRow label="Phone" value={driver.phone} />
        <DetailRow label="CNIC" value={driver.cnic} />
        <DetailRow label="License" value={driver.licenseNumber} />
      </View>

      <AppButton
        title="Log out"
        variant="ghost"
        onPress={handleLogout}
        style={styles.logout}
      />
    </ScreenContainer>
  );
}

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>
      {value || "—"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
  },

  header: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerText: {
    flex: 1,
  },

  greeting: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },

  name: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 26,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  avatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.onPrimary,
  },

  onlineCard: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  onlineCardActive: {
    backgroundColor: colors.successSoft,
  },

  onlineText: {
    flex: 1,
  },

  onlineTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 18,
    color: colors.textPrimary,
  },

  onlineSub: {
    marginTop: 3,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },

  statusCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: radius.xl,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
  },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },

  pillText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
  },

  statusTitle: {
    marginTop: 14,
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    color: colors.textPrimary,
  },

  statusBody: {
    marginTop: 6,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  reasonBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.errorSoft,
  },

  reasonLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.error,
  },

  reasonText: {
    marginTop: 4,
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
  },

  card: {
    marginTop: 14,
    padding: 18,
    gap: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  cardLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.primary,
  },

  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  vehicleIcon: {
    fontSize: 30,
  },

  vehicleText: {
    flex: 1,
  },

  vehicleName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },

  vehicleSub: {
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },

  plate: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  plateText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.onPrimary,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  detailLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },

  detailValue: {
    flexShrink: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: "right",
  },

  logout: {
    marginTop: 12,
  },
});
