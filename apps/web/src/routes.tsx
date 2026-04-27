import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { LogoutPage } from './pages/auth/LogoutPage';
import { MitraHomePage } from './pages/mitra/MitraHomePage';
import { MitraStartPage } from './pages/mitra/MitraStartPage';
import { MitraEnginePage } from './pages/mitra/MitraEnginePage';
import { DashboardPage } from './pages/mitra/DashboardPage';
import { OnboardingPage } from './pages/mitra/OnboardingPage';
import { RoomPage } from './pages/mitra/RoomPage';
import { CheckpointPage } from './pages/mitra/CheckpointPage';
import { TriggerPage } from './pages/mitra/TriggerPage';
import { CheckinPage } from './pages/mitra/CheckinPage';
import { ClassListingPage } from './pages/classes/ClassListingPage';
import { CommunityFeedPage } from './pages/community/CommunityFeedPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { RequiresJourney } from './components/RequiresJourney';
import { RequiresAuth } from './components/RequiresAuth';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="/en" element={<LandingPage />} />

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
        element={<RequiresJourney><MitraEnginePage /></RequiresJourney>}
      />
      <Route
        path="/en/mitra/dashboard"
        element={<RequiresJourney><DashboardPage /></RequiresJourney>}
      />
      <Route
        path="/en/mitra/room/:roomId"
        element={<RequiresJourney><RoomPage /></RequiresJourney>}
      />
      <Route
        path="/en/mitra/checkpoint/:day"
        element={<RequiresJourney><CheckpointPage /></RequiresJourney>}
      />
      <Route
        path="/en/mitra/trigger"
        element={<RequiresJourney><TriggerPage /></RequiresJourney>}
      />
      <Route
        path="/en/mitra/checkin"
        element={<RequiresJourney><CheckinPage /></RequiresJourney>}
      />

      {/* Other verticals — scaffolds */}
      <Route path="/en/classes" element={<ClassListingPage />} />
      <Route path="/en/community" element={<CommunityFeedPage />} />
      <Route path="/en/profile" element={<RequiresAuth><ProfilePage /></RequiresAuth>} />

      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  );
}
