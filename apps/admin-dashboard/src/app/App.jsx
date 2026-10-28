import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "../features/auth/context/AuthContext";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import Layout from "./layouts/Layout";

import LoginPage from "../features/auth/pages/LoginPage";
import OverviewRoute from "../features/overview/pages/OverviewRoute";
import DriversPage from "../features/drivers/pages/DriversPage";
import DriverDetailPage from "../features/drivers/pages/DriverDetailPage";
import UsersPage from "../features/users/pages/UsersPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import SettingsAccountPage from "../features/settings/pages/SettingsAccountPage";
import SettingsSecurityPage from "../features/settings/pages/SettingsSecurityPage";
import SettingsAdminPage from "../features/settings/pages/SettingsAdminPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import VerifyAdminEmailPage from "../features/auth/pages/VerifyAdminEmailPage";
import { ThemeProvider } from "../shared/context/ThemeContext";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-admin-email" element={<VerifyAdminEmailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<OverviewRoute />} />
              <Route path="overview" element={<OverviewRoute />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="drivers/:userId" element={<DriverDetailPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />}>
                <Route index element={<Navigate to="account" replace />} />
                <Route path="account" element={<SettingsAccountPage />} />
                <Route path="security" element={<SettingsSecurityPage />} />
                <Route path="admins" element={<SettingsAdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
