import { Navigate, Route, Routes } from "react-router-dom";

import { RequiresAuth } from "./components/RequiresAuth";
import { RequiresJourney } from "./components/RequiresJourney";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { LogoutPage } from "./pages/auth/LogoutPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { VerifyPage } from "./pages/auth/VerifyPage";
import { ClassBookingPage } from "./pages/classes/ClassBookingPage";
import { ClassBookingSuccessPage } from "./pages/classes/ClassBookingSuccessPage";
import { ClassDetailPage } from "./pages/classes/ClassDetailPage";
import { ClassListingPage } from "./pages/classes/ClassListingPage";
import { ClassPaymentPage } from "./pages/classes/ClassPaymentPage";
import { CommunityFeedPage } from "./pages/community/CommunityFeedPage";
import { CommunityExplorePage } from "./pages/community/CommunityExplorePage";
import { CommunityAboutKalpxPage } from "./pages/community/CommunityAboutKalpxPage";
import { CommunityDetailPage } from "./pages/community/CommunityDetailPage";
import { CommunityKalpxRulesPage } from "./pages/community/CommunityKalpxRulesPage";
import { CommunityPopularPage } from "./pages/community/CommunityPopularPage";
import { CommunityPrivacyPolicyPage } from "./pages/community/CommunityPrivacyPolicyPage";
import { CommunityPostDetailPage } from "./pages/community/CommunityPostDetailPage";
import { CommunityTopCommunitiesPage } from "./pages/community/CommunityTopCommunitiesPage";
import { CommunityTopPage } from "./pages/community/CommunityTopPage";
import { CommunityUserActivityPage } from "./pages/community/CommunityUserActivityPage";
import { CommunityUserAgreementsPage } from "./pages/community/CommunityUserAgreementsPage";
import { CreateCommunityPostPage } from "./pages/community/CreateCommunityPostPage";
import { CreatorPostEditorPage } from "./pages/creator/CreatorPostEditorPage";
import { CreatorPracticeLibraryPage } from "./pages/creator/CreatorPracticeLibraryPage";
import { CreatorPostsPage } from "./pages/creator/CreatorPostsPage";
import { CreatorSimplePostEditorPage } from "./pages/creator/CreatorSimplePostEditorPage";
import { BrowseRoomsPage } from "./pages/mitra/BrowseRoomsPage";
import { CheckinPage } from "./pages/mitra/CheckinPage";
import { CheckpointPage } from "./pages/mitra/CheckpointPage";
import { DashboardPage } from "./pages/mitra/DashboardPage";
import { InnerPathPage } from "./pages/mitra/InnerPathPage";
import { MitraEnginePage } from "./pages/mitra/MitraEnginePage";
import { MitraHomePage } from "./pages/mitra/MitraHomePage";
import { MitraIntentionPage } from "./pages/mitra/MitraIntentionPage";
import { MitraStartPage } from "./pages/mitra/MitraStartPage";
import { OnboardingPage } from "./pages/mitra/OnboardingPage";
import { QuickCheckinPage } from "./pages/mitra/QuickCheckinPage";
import { RhythmHomePage } from "./pages/mitra/RhythmHomePage";
import { RhythmSetupPage } from "./pages/mitra/RhythmSetupPage";
import { RhythmWizardPage } from "./pages/mitra/RhythmWizardPage";
import { RoomPage } from "./pages/mitra/RoomPage";
import { TellMitraPage } from "./pages/mitra/TellMitraPage";
import { TriggerPage } from "./pages/mitra/TriggerPage";
import { WelcomeBackPage } from "./pages/mitra/WelcomeBackPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { NotificationPreferencesPage } from "./pages/settings/NotificationPreferencesPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { PrivacyPage } from "./pages/legal/PrivacyPage";
import { TermsPage } from "./pages/legal/TermsPage";
import { DataDeletionPage } from "./pages/legal/DataDeletionPage";
import { KalpxHaatAddressFormPage } from "./pages/haat/KalpxHaatAddressFormPage";
import { KalpxHaatAddressListPage } from "./pages/haat/KalpxHaatAddressListPage";
import { KalpxHaatBrowsePage } from "./pages/haat/KalpxHaatBrowsePage";
import { KalpxHaatCartPage } from "./pages/haat/KalpxHaatCartPage";
import { KalpxHaatPage } from "./pages/haat/KalpxHaatPage";
import { KalpxHaatPaymentPage } from "./pages/haat/KalpxHaatPaymentPage";
import { KalpxHaatPackageDetailPage } from "./pages/haat/KalpxHaatPackageDetailPage";
import { KalpxHaatProductDetailPage } from "./pages/haat/KalpxHaatProductDetailPage";
import { KalpxHaatStoreDetailPage } from "./pages/haat/KalpxHaatStoreDetailPage";
import { KalpxHaatServiceCheckoutPage } from "./pages/haat/KalpxHaatServiceCheckoutPage";
import { KalpxHaatServiceDetailPage } from "./pages/haat/KalpxHaatServiceDetailPage";
import { RetreatBookingDetailsPage } from "./pages/retreats/RetreatBookingDetailsPage";
import { RetreatBookingPage } from "./pages/retreats/RetreatBookingPage";
import { RetreatCancellationPage } from "./pages/retreats/RetreatCancellationPage";
import { RetreatDetailsPage } from "./pages/retreats/RetreatDetailsPage";
import { RetreatPackageDetailsPage } from "./pages/retreats/RetreatPackageDetailsPage";
import { RetreatsInterestPage } from "./pages/retreats/RetreatsInterestPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="/en" element={<MitraHomePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* Mitra — home is an open routing hub */}
      <Route path="/en/mitra" element={<MitraHomePage />} />
      <Route path="/en/mitra/start" element={<MitraStartPage />} />
      <Route path="/en/mitra/intention" element={<MitraIntentionPage />} />
      <Route path="/en/mitra/onboarding" element={<OnboardingPage />} />
      <Route
        path="/en/mitra/inner-path"
        element={
          <RequiresAuth>
            <InnerPathPage />
          </RequiresAuth>
        }
      />
      <Route path="/en/mitra/rhythm" element={<RhythmHomePage />} />
      <Route path="/en/mitra/rhythm/setup" element={<RhythmWizardPage />} />
      <Route path="/en/mitra/rhythm/edit" element={<RhythmSetupPage />} />
      <Route path="/en/mitra/quick-reset" element={<MitraEnginePage />} />
      <Route path="/en/mitra/tell-mitra" element={<TellMitraPage />} />
      <Route path="/en/mitra/checkin-quick" element={<QuickCheckinPage />} />
      <Route path="/en/mitra/rooms" element={<BrowseRoomsPage />} />

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

      {/* Haat vertical */}
      <Route path="/en/haat" element={<KalpxHaatPage />} />
      <Route path="/en/haat/browse" element={<KalpxHaatBrowsePage />} />
      <Route path="/en/haat/cart" element={<KalpxHaatCartPage />} />
      <Route path="/en/haat/payment" element={<KalpxHaatPaymentPage />} />
      <Route path="/en/haat/addresses" element={<KalpxHaatAddressListPage />} />
      <Route path="/en/haat/addresses/new" element={<KalpxHaatAddressFormPage />} />
      <Route
        path="/en/haat/addresses/:id/edit"
        element={<KalpxHaatAddressFormPage />}
      />
      <Route path="/en/haat/store/:id" element={<KalpxHaatStoreDetailPage />} />
      <Route
        path="/en/haat/product/:id"
        element={<KalpxHaatProductDetailPage />}
      />
      <Route path="/en/haat/service/:id" element={<KalpxHaatServiceDetailPage />} />
      <Route
        path="/en/haat/service/:id/package/:packageId"
        element={<KalpxHaatPackageDetailPage />}
      />
      <Route
        path="/en/haat/service/:id/checkout"
        element={<KalpxHaatServiceCheckoutPage />}
      />

      {/* Retreats vertical */}
      {/* Classes vertical */}
      <Route path="/en/classes" element={<ClassListingPage />} />
      <Route path="/en/classes/success" element={<ClassBookingSuccessPage />} />
      <Route path="/en/classes/:slug" element={<ClassDetailPage />} />
      <Route path="/en/classes/:slug/book" element={<ClassBookingPage />} />
      <Route path="/en/classes/:slug/pay" element={<ClassPaymentPage />} />

      {/* Communities vertical */}
      <Route path="/en/community" element={<CommunityFeedPage />} />
      <Route
        path="/en/community/communities"
        element={<CommunityTopCommunitiesPage />}
      />
      <Route
        path="/en/community/communities/:slug"
        element={<CommunityDetailPage />}
      />
      <Route path="/en/community/explore" element={<CommunityExplorePage />} />
      <Route
        path="/en/community/about-kalpx"
        element={<CommunityAboutKalpxPage />}
      />
      <Route
        path="/en/community/kalpx-rules"
        element={<CommunityKalpxRulesPage />}
      />
      <Route path="/en/community/popular" element={<CommunityPopularPage />} />
      <Route
        path="/en/community/privacy-policy"
        element={<CommunityPrivacyPolicyPage />}
      />
      <Route path="/en/community/top" element={<CommunityTopPage />} />
      <Route
        path="/en/community/activity"
        element={<CommunityUserActivityPage />}
      />
      <Route
        path="/en/community/user-agreements"
        element={<CommunityUserAgreementsPage />}
      />
      <Route path="/en/community/new" element={<CreateCommunityPostPage />} />
      <Route
        path="/en/community/:postId"
        element={<CommunityPostDetailPage />}
      />
      <Route
        path="/en/creator/posts"
        element={
          <RequiresAuth>
            <CreatorPostsPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/en/creator/posts/new"
        element={
          <RequiresAuth>
            <CreatorPostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/en/creator/posts/new-simple"
        element={
          <RequiresAuth>
            <CreatorSimplePostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/en/creator/posts/select-practice"
        element={
          <RequiresAuth>
            <CreatorPracticeLibraryPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/en/creator/posts/:id/edit"
        element={
          <RequiresAuth>
            <CreatorPostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/en/creator/posts/:id/edit-simple"
        element={
          <RequiresAuth>
            <CreatorSimplePostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/en/profile"
        element={
          <RequiresAuth>
            <ProfilePage />
          </RequiresAuth>
        }
      />
      <Route path="/en/privacy" element={<PrivacyPage />} />
      <Route path="/en/terms" element={<TermsPage />} />
      <Route path="/en/data-deletion" element={<DataDeletionPage />} />

      {/* Retreats vertical */}
      <Route path="/en/retreats" element={<RetreatsInterestPage />} />
      <Route path="/en/retreats/:slug" element={<RetreatDetailsPage />} />
      <Route
        path="/en/retreats/:slug/package/:packageId"
        element={<RetreatPackageDetailsPage />}
      />
      <Route path="/en/retreats/:slug/book" element={<RetreatBookingPage />} />
      <Route
        path="/en/retreats/bookings/:bookingId"
        element={<RetreatBookingDetailsPage />}
      />
      <Route
        path="/en/retreats/cancellation/:bookingId"
        element={<RetreatCancellationPage />}
      />

      {/* Notifications inbox */}
      <Route
        path="/en/notifications"
        element={
          <RequiresAuth>
            <NotificationsPage />
          </RequiresAuth>
        }
      />

      {/* Notification preferences */}
      <Route
        path="/en/settings/notifications"
        element={
          <RequiresAuth>
            <NotificationPreferencesPage />
          </RequiresAuth>
        }
      />

      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  );
}
