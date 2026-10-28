export const getGreetingPeriod = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return { text: "Good morning", icon: "sunrise" };
  if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: "sun" };
  if (hour >= 17 && hour < 21) return { text: "Good evening", icon: "sunset" };
  return { text: "Good night", icon: "moon" };
};

export const isFreshLoginWelcome = (signal, now = Date.now()) =>
  Number.isFinite(signal?.createdAt) && now >= signal.createdAt && now - signal.createdAt < 15000;
