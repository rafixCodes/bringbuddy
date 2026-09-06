import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";

import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";

import { ModeSelection } from "./components/onboarding/ModeSelection";
import { SenderOnboarding } from "./components/onboarding/SenderOnboarding";
import { TravelerOnboarding } from "./components/onboarding/TravelerOnboarding";
import { TravelerProfile } from "./components/profile/TravelerProfile";
import { SenderDashboard } from "./components/dashboard/SenderDashboard";
import { TravelerDashboard } from "./components/dashboard/TravelerDashboard";
import { OrderCreation } from "./components/orders/OrderCreation";
import { OrderHistory } from "./components/orders/OrderHistory";
import { PostTrip } from "./components/trips/PostTrip";
import { MyTrips } from "./components/trips/MyTrips";
import { TripSearch } from "./components/trips/TripSearch";
import { TravelerVerification } from "./components/verification/TravelerVerification";
import { AdminVerifications } from "./components/verification/AdminVerifications";
import { AdminCenter } from "./components/admin/AdminCenter";
import { OrderTracking } from "./components/orders/OrderTracking";
import { DeliveryOtpManager } from "./components/orders/DeliveryOtpManager";
import { ReceiverDeliveryConfirmation } from "./components/orders/ReceiverDeliveryConfirmation";

import {
  ProtectedRoute,
  OnboardingRoute,
  PublicOnlyRoute,
  AdminRoute,
} from "./context/RouteGuards";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* Public-only: bounce a logged-in user away from these */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/delivery-confirmation/:id" element={<ReceiverDeliveryConfirmation />} />
      <Route path="/onboarding" element={<OnboardingRoute><ModeSelection /></OnboardingRoute>} />
      <Route path="/sender-onboarding" element={<OnboardingRoute><SenderOnboarding /></OnboardingRoute>} />
      <Route path="/traveler-onboarding" element={<OnboardingRoute><TravelerOnboarding /></OnboardingRoute>} />
      <Route path="/verification-intro" element={<TravelerVerification />} />

      {/* Authenticated */}
      <Route path="/sender-dashboard" element={<ProtectedRoute><SenderDashboard /></ProtectedRoute>} />
      <Route path="/traveler-dashboard" element={<ProtectedRoute><TravelerDashboard /></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><OrderCreation /></ProtectedRoute>} />
      <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/trips/new" element={<ProtectedRoute><PostTrip /></ProtectedRoute>} />
      <Route path="/trips/my" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
      <Route path="/trip-search" element={<ProtectedRoute><TripSearch /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><TravelerProfile /></ProtectedRoute>} />
      <Route path="/admin/verifications" element={<AdminRoute><AdminVerifications /></AdminRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminCenter /></AdminRoute>} />
      <Route path="/orders/:id/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/orders/:id/delivery-otp" element={<ProtectedRoute><DeliveryOtpManager /></ProtectedRoute>} />

      {/* Catch-all so a bad/stale path renders something instead of a blank screen */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
