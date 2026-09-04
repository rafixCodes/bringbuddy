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

import { OrderCreation } from "./components/orders/OrderCreation";
import { OrderHistory } from "./components/orders/OrderHistory";

import { PostTrip } from "./components/trips/PostTrip";
import { MyTrips } from "./components/trips/MyTrips";

import { BookingCenter } from "./components/booking/BookingCenter";
import { DirectBooking } from "./components/booking/DirectBooking";
import { Marketplace } from "./components/booking/Marketplace";

import {
  ProtectedRoute,
  OnboardingRoute,
  PublicOnlyRoute,
} from "./context/RouteGuards";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <ModeSelection />
          </OnboardingRoute>
        }
      />

      <Route
        path="/sender-onboarding"
        element={
          <OnboardingRoute>
            <SenderOnboarding />
          </OnboardingRoute>
        }
      />

      <Route
        path="/traveler-onboarding"
        element={
          <OnboardingRoute>
            <TravelerOnboarding />
          </OnboardingRoute>
        }
      />

      <Route
        path="/sender-dashboard"
        element={
          <ProtectedRoute>
            <SenderDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/traveler-dashboard"
        element={
          <ProtectedRoute>
            <TravelerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/new"
        element={
          <ProtectedRoute>
            <OrderCreation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/order-history"
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips/new"
        element={
          <ProtectedRoute>
            <PostTrip />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips/my"
        element={
          <ProtectedRoute>
            <MyTrips />
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-center"
        element={
          <ProtectedRoute>
            <BookingCenter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/direct/:orderId"
        element={
          <ProtectedRoute>
            <DirectBooking />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;