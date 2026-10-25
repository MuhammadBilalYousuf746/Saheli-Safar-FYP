
import React, { useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { showAlert } from "../../../utils/alert";

import Svg, {
  Circle,
  Path,
  Rect,
} from "react-native-svg";

import ScreenContainer from "../../../components/ScreenContainer";
import { typography } from "../../../theme/typography";

const C = {
  plum: "#552D50",
  dark: "#382039",
  lavender: "#9473AE",
  rose: "#C98291",
  background: "#FCF9F6",
  white: "#FFFFFF",
  ink: "#25232A",
  muted: "#827982",
  border: "#E9E1E5",
  softPurple: "#F1E9F3",
  softPink: "#F8EDF0",
};

function RideIcon({ color = C.plum, size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect
        x="5"
        y="8"
        width="22"
        height="16"
        rx="5"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />

      <Path
        d="M5 15H27M10 19H13M19 19H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <Circle cx="10" cy="25" r="2" fill={color} />
      <Circle cx="22" cy="25" r="2" fill={color} />
    </Svg>
  );
}

function TabIcon({ name, active }) {
  const color = active ? C.plum : "#A69BA7";

  if (name === "Home") {
    return (
      <Svg width={23} height={23} viewBox="0 0 24 24">
        <Path
          d="M3 11L12 4L21 11V20H15V14H9V20H3Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === "Explore") {
    return (
      <Svg width={23} height={23} viewBox="0 0 24 24">
        <Circle
          cx="10.5"
          cy="10.5"
          r="6.5"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <Path
          d="M15.5 15.5L21 21"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === "Bookings") {
    return (
      <Svg width={23} height={23} viewBox="0 0 24 24">
        <Rect
          x="4"
          y="4"
          width="16"
          height="17"
          rx="3"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <Path
          d="M8 9H16M8 13H16M8 17H13"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={23} height={23} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="8"
        r="3.5"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path
        d="M5 20C5 16.5 8 14.5 12 14.5
           C16 14.5 19 16.5 19 20"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function HomeDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Home");

  // Placeholder until authentication backend provides
  // the currently logged-in passenger's actual details.
  const passengerName = "Saheli";

  const showComingSoon = (feature) => {
    showAlert(
      feature,
      "This feature will be connected after the backend integration."
    );
  };

  const handleTabPress = (tab) => {
    if (tab === "Home") {
      setActiveTab("Home");
      return;
    }

    showComingSoon(tab);
  };

  return (
    <ScreenContainer padded={false}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SAHELI SAFAR</Text>

            <Text style={styles.greeting}>
              Hello, {passengerName}!
            </Text>

            <Text style={styles.subtitle}>
              Where would you like to go today?
            </Text>
          </View>

          <Pressable
            style={styles.avatar}
            onPress={() => showComingSoon("My Profile")}
            accessibilityRole="button"
            accessibilityLabel="My profile"
          >
            <Text style={styles.avatarText}>S</Text>
          </Pressable>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Find a ride */}
          <View style={styles.findRideCard}>
            <View style={styles.cardTop}>
              <View style={styles.rideIconWrap}>
                <RideIcon color={C.plum} size={28} />
              </View>

              <View style={styles.cardTag}>
                <Text style={styles.cardTagText}>
                  SCHEDULED RIDES
                </Text>
              </View>
            </View>

            <Text style={styles.findRideTitle}>
              Your next journey{"\n"}starts here.
            </Text>

            <Text style={styles.findRideDescription}>
              Explore scheduled routes and plan
              your commute with Saheli Safar.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.findRideButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => showComingSoon("Find a Ride")}
              accessibilityRole="button"
            >
              <Text style={styles.findRideButtonText}>
                Find a Ride
              </Text>

              <Text style={styles.findRideArrow}>→</Text>
            </Pressable>
          </View>

          {/* Upcoming trip */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Upcoming Trip
            </Text>
          </View>

          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <RideIcon color={C.lavender} size={23} />
            </View>

            <View style={styles.emptyTextWrap}>
              <Text style={styles.emptyTitle}>
                No upcoming trips
              </Text>

              <Text style={styles.emptyDescription}>
                Your next booked journey will appear here.
              </Text>
            </View>
          </View>

          {/* My Bookings */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              My Bookings
            </Text>

            <Pressable
              onPress={() => showComingSoon("My Bookings")}
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.bookingCard,
              pressed && styles.bookingPressed,
            ]}
            onPress={() => showComingSoon("Booking History")}
            accessibilityRole="button"
          >
            <View style={styles.bookingIconWrap}>
              <TabIcon name="Bookings" active />
            </View>

            <View style={styles.bookingTextWrap}>
              <Text style={styles.bookingTitle}>
                Your journeys
              </Text>

              <Text style={styles.bookingSubtitle}>
                View bookings and travel history
              </Text>
            </View>

            <Text style={styles.bookingArrow}>›</Text>
          </Pressable>
        </View>

        {/* Bottom navigation */}
        <View style={styles.bottomNav}>
          {["Home", "Explore", "Bookings", "Profile"].map(
            (tab) => {
              const active = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  style={styles.tabButton}
                  onPress={() => handleTabPress(tab)}
                  accessibilityRole="button"
                  accessibilityLabel={tab}
                >
                  <TabIcon name={tab} active={active} />

                  <Text
                    style={[
                      styles.tabText,
                      active && styles.tabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>

                  {active && <View style={styles.activeDot} />}
                </Pressable>
              );
            }
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: C.rose,
    marginBottom: 12,
  },

  greeting: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 29,
    lineHeight: 37,
    color: C.dark,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: C.muted,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: C.softPurple,
    borderWidth: 1,
    borderColor: "#E2D2E5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  avatarText: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 22,
    color: C.plum,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  findRideCard: {
    backgroundColor: C.softPurple,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9DCEB",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  rideIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTag: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  cardTagText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: C.plum,
  },

  findRideTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 26,
    lineHeight: 34,
    color: C.dark,
  },

  findRideDescription: {
    marginTop: 9,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 19,
    color: "#716477",
  },

  findRideButton: {
    marginTop: 20,
    height: 47,
    borderRadius: 15,
    backgroundColor: C.plum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },

  findRideButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: C.white,
  },

  findRideArrow: {
    fontSize: 20,
    color: C.white,
    marginTop: -2,
  },

  buttonPressed: {
    backgroundColor: C.dark,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    color: C.ink,
  },

  seeAll: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
  },

  emptyCard: {
    minHeight: 90,
    backgroundColor: C.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  emptyIconWrap: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: C.softPurple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  emptyTextWrap: {
    flex: 1,
  },

  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: C.ink,
  },

  emptyDescription: {
    marginTop: 5,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 17,
    color: C.muted,
  },

  bookingCard: {
    minHeight: 75,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  bookingPressed: {
    backgroundColor: C.softPink,
  },

  bookingIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.softPink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  bookingTextWrap: {
    flex: 1,
  },

  bookingTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: C.ink,
  },

  bookingSubtitle: {
    marginTop: 4,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: C.muted,
  },

  bookingArrow: {
    fontSize: 26,
    color: C.lavender,
    marginLeft: 8,
  },

  bottomNav: {
    height: 72,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },

  tabButton: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    marginTop: 5,
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    color: "#A69BA7",
  },

  tabTextActive: {
    color: C.plum,
  },

  activeDot: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.rose,
  },
});
