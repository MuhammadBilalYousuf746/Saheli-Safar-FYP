export const PASSENGER_TABS = [
  { label: "Home", path: "/home", href: "/(passenger)/home" },
  { label: "Explore", path: "/explore", href: "/(passenger)/explore" },
  { label: "Bookings", path: "/bookings", href: "/(passenger)/bookings" },
  { label: "Profile", path: "/profile", href: "/(passenger)/profile" },
];

export const IDENTITY_VERIFICATION = {
  label: "Identity Verification", path: "/identity-verification", href: "/(passenger)/identity-verification",
};
export const EMERGENCY_CONTACT = {
  label: "Emergency Contact", path: "/emergency-contact", href: "/(passenger)/emergency-contact",
};

export const isPassengerTabActive = (pathname, tab) => pathname === tab.path ||
  (tab.label === "Profile" && [IDENTITY_VERIFICATION.path, EMERGENCY_CONTACT.path].includes(pathname));

// A public direct link may have no stack entry to pop. Callers supply the
// appropriate existing destination; authenticated guards remain authoritative.
export function backOrReplace(router, fallback) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

export function backToPassengerHome(router) {
  backOrReplace(router, "/(passenger)/home");
}

export function openPassengerScreen(router, pathname, label) {
  const destination = [...PASSENGER_TABS, IDENTITY_VERIFICATION, EMERGENCY_CONTACT].find((screen) => screen.label === label);
  if (!destination) throw new Error("Unknown Passenger screen.");
  // Keep Home as the stack anchor. From Home, open one secondary screen;
  // between secondary tabs, dismissTo reuses the target or replaces the current
  // screen. Native Back therefore returns to Home without stacking tab copies.
  if (pathname === destination.path) return;
  // A Profile detail screen keeps Profile below it for normal Back behavior.
  if (pathname === "/home" || destination === IDENTITY_VERIFICATION || destination === EMERGENCY_CONTACT) router.navigate(destination.href);
  else router.dismissTo(destination.href);
}
