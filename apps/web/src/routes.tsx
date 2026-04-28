import { Navigate, Route, Routes } from "react-router-dom";

import { RequiresAuth } from "./components/RequiresAuth";
import { RequiresJourney } from "./components/RequiresJourney";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { LogoutPage } from "./pages/auth/LogoutPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ClassBookingPage } from "./pages/classes/ClassBookingPage";
import { ClassBookingSuccessPage } from "./pages/classes/ClassBookingSuccessPage";
import { ClassDetailPage } from "./pages/classes/ClassDetailPage";
import { ClassListingPage } from "./pages/classes/ClassListingPage";
import { ClassPaymentPage } from "./pages/classes/ClassPaymentPage";
import { CommunityFeedPage } from "./pages/community/CommunityFeedPage";
import { CommunityPostDetailPage } from "./pages/community/CommunityPostDetailPage";
import { CreateCommunityPostPage } from "./pages/community/CreateCommunityPostPage";
import { CheckinPage } from "./pages/mitra/CheckinPage";
import { CheckpointPage } from "./pages/mitra/CheckpointPage";
import { DashboardPage } from "./pages/mitra/DashboardPage";
import { MitraEnginePage } from "./pages/mitra/MitraEnginePage";
import { MitraHomePage } from "./pages/mitra/MitraHomePage";
import { MitraStartPage } from "./pages/mitra/MitraStartPage";
import { OnboardingPage } from "./pages/mitra/OnboardingPage";
import { RoomPage } from "./pages/mitra/RoomPage";
import { TriggerPage } from "./pages/mitra/TriggerPage";
import { WelcomeBackPage } from "./pages/mitra/WelcomeBackPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { RetreatsInterestPage } from "./pages/retreats/RetreatsInterestPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="/en" element={<MitraHomePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* Mitra — home is an open routing hub */}
      <Route path="/en/mitra" element={<MitraHomePage />} />
      <Route path="/en/mitra/start" element={<MitraStartPage />} />
      <Route path="/en/mitra/onboarding" element={<OnboardingPage />} />

      {/* Journey-gated Mitra routes */}
      <Route
        path="/en/mitra/engine"
        element={
          <RequiresJourney>
            <MitraEnginePage />
          </RequiresJourney>
        }
      />
      <Route
        path="/en/mitra/dashboard"
        element={
          <RequiresJourney>
            <DashboardPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/en/mitra/room/:roomId"
        element={
          <RequiresJourney>
            <RoomPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/en/mitra/checkpoint/:day"
        element={
          <RequiresJourney>
            <CheckpointPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/en/mitra/trigger"
        element={
          <RequiresJourney>
            <TriggerPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/en/mitra/checkin"
        element={
          <RequiresJourney>
            <CheckinPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/en/mitra/welcome-back"
        element={
          <RequiresAuth>
            <WelcomeBackPage />
          </RequiresAuth>
        }
      />

      {/* Classes vertical */}
      <Route path="/en/classes" element={<ClassListingPage />} />
      <Route path="/en/classes/success" element={<ClassBookingSuccessPage />} />
      <Route path="/en/classes/:slug" element={<ClassDetailPage />} />
      <Route path="/en/classes/:slug/book" element={<ClassBookingPage />} />
      <Route path="/en/classes/:slug/pay" element={<ClassPaymentPage />} />

      {/* Communities vertical */}
      <Route path="/en/community" element={<CommunityFeedPage />} />
      <Route path="/en/community/new" element={<CreateCommunityPostPage />} />
      <Route
        path="/en/community/:postId"
        element={<CommunityPostDetailPage />}
      />
      <Route
        path="/en/profile"
        element={
          <RequiresAuth>
            <ProfilePage />
          </RequiresAuth>
        }
      />

      {/* Retreats vertical */}
      <Route path="/en/retreats" element={<RetreatsInterestPage />} />

      {/* Notifications inbox */}
      <Route
        path="/en/notifications"
        element={
          <RequiresAuth>
            <NotificationsPage />
          </RequiresAuth>
        }
      />

      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  );
}
