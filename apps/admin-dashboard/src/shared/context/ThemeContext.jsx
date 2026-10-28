import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext(null);
const LIGHT_THEME = { theme: "light" };

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.dataset.theme = "light";
  }, []);

  return (
    <ThemeContext.Provider value={LIGHT_THEME}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
};
