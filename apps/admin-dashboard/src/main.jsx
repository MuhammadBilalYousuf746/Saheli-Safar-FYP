import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app/App";
import "./styles/theme.css";
import "./styles/global.css";
import "./shared/styles/common.css";
import "./app/layouts/Layout.css";
import "./features/auth/auth.css";
import "./features/overview/overview.css";
import "./features/users/users.css";
import "./features/drivers/drivers.css";
import "./features/settings/settings.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
