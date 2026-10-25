import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import DriversPage from "./pages/DriversPage";
import DriverDetailPage from "./pages/DriverDetailPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import SettingsAccountPage from "./pages/SettingsAccountPage";
import SettingsSecurityPage from "./pages/SettingsSecurityPage";
import SettingsAdminPage from "./pages/SettingsAdminPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyAdminEmailPage from "./pages/VerifyAdminEmailPage";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-admin-email" element={<VerifyAdminEmailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<OverviewPage />} />
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
);

export default App;
