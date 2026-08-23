import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";

import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";

import { ModeSelection } from "./components/onboarding/ModeSelection";
import { SenderOnboarding } from "./components/onboarding/SenderOnboarding";
import { TravelerOnboarding } from "./components/onboarding/TravelerOnboarding";

import { SenderDashboard } from "./components/dashboard/SenderDashboard";
import { TravelerDashboard } from "./components/dashboard/TravelerDashboard";

import {
  ProtectedRoute,
  OnboardingRoute,
  PublicOnlyRoute,
} from "./context/RouteGuards";
// AdminRoute is exported from ./context/RouteGuards and ready to use — import it
// here once /admin is wired (AdminCenter.jsx conversion, next in the plan).

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* Public-only: bounce a logged-in user away from these */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

      {/* Onboarding: needs auth, blocks users who already finished it.
          hasCompletedOnboarding only becomes true at the END of
          SenderOnboarding/TravelerOnboarding (their "Continue to Dashboard"
          action) — NOT on ModeSelection or on the "switch mode" buttons on
          these pages. That's what keeps this guard correct: a user who
          hasn't finished yet can still reach both step 1 and step 2. */}
      <Route path="/onboarding" element={<OnboardingRoute><ModeSelection /></OnboardingRoute>} />
      <Route path="/sender-onboarding" element={<OnboardingRoute><SenderOnboarding /></OnboardingRoute>} />
      <Route path="/traveler-onboarding" element={<OnboardingRoute><TravelerOnboarding /></OnboardingRoute>} />

      {/* Authenticated */}
      <Route path="/sender-dashboard" element={<ProtectedRoute><SenderDashboard /></ProtectedRoute>} />
      <Route path="/traveler-dashboard" element={<ProtectedRoute><TravelerDashboard /></ProtectedRoute>} />

      {/* Catch-all so a bad/stale path renders something instead of a blank screen */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* /admin intentionally not wired yet — AdminCenter.jsx not converted yet. */}
    </Routes>
  );
}

export default App;