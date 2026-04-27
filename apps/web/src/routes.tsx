import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { MitraHomePage } from './pages/mitra/MitraHomePage';
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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="/en" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Mitra */}
      <Route path="/en/mitra" element={<MitraHomePage />} />
      <Route path="/en/mitra/start" element={<OnboardingPage />} />
      <Route path="/en/mitra/engine" element={<MitraEnginePage />} />
      <Route path="/en/mitra/dashboard" element={<DashboardPage />} />
      <Route path="/en/mitra/room/:roomId" element={<RoomPage />} />
      <Route path="/en/mitra/checkpoint/:day" element={<CheckpointPage />} />
      <Route path="/en/mitra/trigger" element={<TriggerPage />} />
      <Route path="/en/mitra/checkin" element={<CheckinPage />} />

      {/* Other verticals — scaffolds */}
      <Route path="/en/classes" element={<ClassListingPage />} />
      <Route path="/en/community" element={<CommunityFeedPage />} />
      <Route path="/en/profile" element={<ProfilePage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  );
}
