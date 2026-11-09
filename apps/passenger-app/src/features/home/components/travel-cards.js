export const TRAVEL_CARDS = Object.freeze([
  { id: "explore", title: "Explore Karachi", description: "Area ideas for your everyday. These are not live routes.", action: "Explore areas", label: "Explore Karachi areas", destination: "Explore", icon: "compass", kind: "explore" },
  { id: "bookings", title: "My Bookings", description: "Upcoming & history. Live booking is not connected yet.", action: "View bookings", label: "My Bookings", destination: "Bookings", icon: "ticket", kind: "bookings" },
  { id: "identity", title: "Identity review", description: "Check your CNIC and selfie review, all in one place.", action: "View verification", label: "Open identity review", destination: "Identity Verification", icon: "shield-check", kind: "identity" },
  { id: "profile", title: "Your account", description: "Your name, sign-in details and Passenger card.", action: "View profile", label: "Open Passenger account", destination: "Profile", icon: "user-circle", kind: "profile" },
  { id: "contact", title: "Someone you trust", description: "Add or update a contact for your emergency details.", action: "Manage contact", label: "Open Emergency Contact", destination: "Emergency Contact", icon: "phone", kind: "contact" },
]);

export function travelCardLayout(width, count = TRAVEL_CARDS.length) {
  const available = Math.max(1, Math.round(width));
  const cardWidth = Math.max(1, Math.round(Math.min(available * 0.86, available - 30)));
  const gap = 12, stride = cardWidth + gap;
  const maximum = Math.max(0, count * cardWidth + Math.max(0, count - 1) * gap - available);
  return { cardWidth, gap, stride, offsets: Array.from({ length: count }, (_, index) => Math.min(index * stride, maximum)) };
}

export function nearestTravelCard(offset, offsets) {
  return offsets.reduce((nearest, point, index) => Math.abs(point - offset) < Math.abs(offsets[nearest] - offset) ? index : nearest, 0);
}
