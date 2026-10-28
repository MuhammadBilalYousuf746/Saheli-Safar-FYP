import { useState } from "react";

import { useAuth } from "../../features/auth/context/AuthContext";
import { isFreshLoginWelcome } from "../utils/greeting";

const PageEntrance = ({ children }) => {
  const { loginWelcome } = useAuth();
  // Capture once on this route's mount, before the greeting consumes the event.
  const [afterLogin] = useState(() => isFreshLoginWelcome(loginWelcome));
  return (
    <div className={`page-entrance${afterLogin ? " page-entrance--login" : ""}`}>
      {children}
    </div>
  );
};

export default PageEntrance;
