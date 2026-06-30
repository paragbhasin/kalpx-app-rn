import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useTranslation } from "./lib/i18n";

import { RequiresAuth } from "./components/RequiresAuth";
import { RequiresGuideAuth } from "./components/RequiresGuideAuth";
import { RequiresJourney } from "./components/RequiresJourney";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ForgotPasswordPhonePage } from "./pages/auth/ForgotPasswordPhonePage";
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
import { RemindersPage } from "./pages/settings/RemindersPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { PrivacyPage } from "./pages/legal/PrivacyPage";
import { TermsPage } from "./pages/legal/TermsPage";
import { DataDeletionPage } from "./pages/legal/DataDeletionPage";
import { IndiaPrivacyPage } from "./pages/legal/IndiaPrivacyPage";
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
import { ProgramLandingPage } from "./pages/programs/ProgramLandingPage";
import { ProgramSupportPage } from "./pages/programs/ProgramSupportPage";
import { ProgramsDiscoveryPage } from "./pages/programs/ProgramsDiscoveryPage";
import { ProgramDetailPage } from "./pages/programs/ProgramDetailPage";
import { LiveSessionsListPage } from "./pages/programs/LiveSessionsListPage";
import { LiveSessionDetailPage } from "./pages/programs/LiveSessionDetailPage";
import { GuidePublicProfilePage } from "./pages/programs/GuidePublicProfilePage";
import { GuideDashboardPage } from "./pages/programs/GuideDashboardPage";
import { GuideProgramDraftPage } from "./pages/programs/GuideProgramDraftPage";
import { GuideSessionDraftPage } from "./pages/programs/GuideSessionDraftPage";
import { GuideTemplateBrowserPage } from "./pages/programs/GuideTemplateBrowserPage";
import { GuideTemplateDayEditorPage } from "./pages/programs/GuideTemplateDayEditorPage";
import { GuideTemplateReviewPage } from "./pages/programs/GuideTemplateReviewPage";
import { RequiresStaff } from "./components/RequiresStaff";
import { RequiresFounder } from "./components/RequiresFounder";
import { ProgramAdminDashboard } from "./pages/programs/ProgramAdminDashboard";
import { ProgramAdminCampaignList } from "./pages/programs/ProgramAdminCampaignList";
import { ProgramAdminOverview } from "./pages/programs/ProgramAdminOverview";
import { ProgramAdminCreateCampaign } from "./pages/programs/ProgramAdminCreateCampaign";
import { ProgramAdminCampaignDetail } from "./pages/programs/ProgramAdminCampaignDetail";
import { OpsLoginPage } from "./pages/auth/OpsLoginPage";
import { OpsForgotPasswordPage } from "./pages/auth/OpsForgotPasswordPage";
import { GuideLoginPage } from "./pages/auth/GuideLoginPage";
import { GuideForgotPasswordPage } from "./pages/auth/GuideForgotPasswordPage";
import { GuideInviteAcceptPage } from "./pages/auth/GuideInviteAcceptPage";

function LocaleRedirect() {
  const { locale } = useTranslation();
  return <Navigate to={`/${locale}`} replace />;
}

function MitraStartRedirect() {
  const { locale = 'en' } = useParams<{ locale: string }>();
  return <Navigate to={`/${locale}/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1`} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LocaleRedirect />} />
      <Route path="/:locale" element={<MitraHomePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password-phone" element={<ForgotPasswordPhonePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/ops-login" element={<OpsLoginPage />} />
      <Route path="/ops-forgot-password" element={<OpsForgotPasswordPage />} />
      <Route path="/guide/login" element={<GuideLoginPage />} />
      <Route path="/guide/forgot-password" element={<GuideForgotPasswordPage />} />
      <Route path="/guide/invite/:token" element={<GuideInviteAcceptPage />} />

      {/* Mitra — home is an open routing hub */}
      <Route path="/:locale/mitra" element={<MitraHomePage />} />
      <Route
        path="/:locale/mitra/start"
        element={<MitraStartRedirect />}
      />
      <Route path="/:locale/mitra/intention" element={<MitraIntentionPage />} />
      <Route path="/:locale/mitra/onboarding" element={<OnboardingPage />} />
      <Route
        path="/:locale/mitra/inner-path"
        element={
          <RequiresAuth>
            <InnerPathPage />
          </RequiresAuth>
        }
      />
      <Route path="/:locale/mitra/rhythm" element={<RhythmHomePage />} />
      <Route path="/:locale/mitra/rhythm/setup" element={<RhythmWizardPage />} />
      <Route path="/:locale/mitra/rhythm/edit" element={<RhythmSetupPage />} />
      <Route path="/:locale/mitra/quick-reset" element={<MitraEnginePage />} />
      <Route path="/:locale/mitra/tell-mitra" element={<TellMitraPage />} />
      <Route path="/:locale/mitra/checkin-quick" element={<QuickCheckinPage />} />
      <Route path="/:locale/mitra/rooms" element={<BrowseRoomsPage />} />

      {/* Journey-gated Mitra routes */}
      <Route
        path="/:locale/mitra/engine"
        element={
          <RequiresAuth>
            <MitraEnginePage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/mitra/dashboard"
        element={
          <RequiresJourney>
            <DashboardPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/:locale/mitra/room/:roomId"
        element={
          <RequiresAuth>
            <RoomPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/mitra/checkpoint/:day"
        element={
          <RequiresJourney>
            <CheckpointPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/:locale/mitra/trigger"
        element={
          <RequiresJourney>
            <TriggerPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/:locale/mitra/checkin"
        element={
          <RequiresJourney>
            <CheckinPage />
          </RequiresJourney>
        }
      />
      <Route
        path="/:locale/mitra/welcome-back"
        element={
          <RequiresAuth>
            <WelcomeBackPage />
          </RequiresAuth>
        }
      />

      {/* Haat vertical */}
      <Route path="/:locale/haat" element={<KalpxHaatPage />} />
      <Route path="/:locale/haat/browse" element={<KalpxHaatBrowsePage />} />
      <Route path="/:locale/haat/cart" element={<KalpxHaatCartPage />} />
      <Route path="/:locale/haat/payment" element={<KalpxHaatPaymentPage />} />
      <Route path="/:locale/haat/addresses" element={<KalpxHaatAddressListPage />} />
      <Route path="/:locale/haat/addresses/new" element={<KalpxHaatAddressFormPage />} />
      <Route
        path="/:locale/haat/addresses/:id/edit"
        element={<KalpxHaatAddressFormPage />}
      />
      <Route path="/:locale/haat/store/:id" element={<KalpxHaatStoreDetailPage />} />
      <Route
        path="/:locale/haat/product/:id"
        element={<KalpxHaatProductDetailPage />}
      />
      <Route path="/:locale/haat/service/:id" element={<KalpxHaatServiceDetailPage />} />
      <Route
        path="/:locale/haat/service/:id/package/:packageId"
        element={<KalpxHaatPackageDetailPage />}
      />
      <Route
        path="/:locale/haat/service/:id/checkout"
        element={<KalpxHaatServiceCheckoutPage />}
      />

      {/* Retreats vertical */}
      {/* Classes vertical */}
      <Route path="/:locale/classes" element={<ClassListingPage />} />
      <Route path="/:locale/classes/success" element={<ClassBookingSuccessPage />} />
      <Route path="/:locale/classes/:slug" element={<ClassDetailPage />} />
      <Route path="/:locale/classes/:slug/book" element={<ClassBookingPage />} />
      <Route path="/:locale/classes/:slug/pay" element={<ClassPaymentPage />} />

      {/* Communities vertical */}
      <Route path="/:locale/community" element={<CommunityFeedPage />} />
      <Route
        path="/:locale/community/communities"
        element={<CommunityTopCommunitiesPage />}
      />
      <Route
        path="/:locale/community/communities/:slug"
        element={<CommunityDetailPage />}
      />
      <Route path="/:locale/community/explore" element={<CommunityExplorePage />} />
      <Route
        path="/:locale/community/about-kalpx"
        element={<CommunityAboutKalpxPage />}
      />
      <Route
        path="/:locale/community/kalpx-rules"
        element={<CommunityKalpxRulesPage />}
      />
      <Route path="/:locale/community/popular" element={<CommunityPopularPage />} />
      <Route
        path="/:locale/community/privacy-policy"
        element={<CommunityPrivacyPolicyPage />}
      />
      <Route path="/:locale/community/top" element={<CommunityTopPage />} />
      <Route
        path="/:locale/community/activity"
        element={<CommunityUserActivityPage />}
      />
      <Route
        path="/:locale/community/user-agreements"
        element={<CommunityUserAgreementsPage />}
      />
      <Route path="/:locale/community/new" element={<CreateCommunityPostPage />} />
      <Route
        path="/:locale/community/:postId"
        element={<CommunityPostDetailPage />}
      />
      <Route
        path="/:locale/creator/posts"
        element={
          <RequiresAuth>
            <CreatorPostsPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/creator/posts/new"
        element={
          <RequiresAuth>
            <CreatorPostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/creator/posts/new-simple"
        element={
          <RequiresAuth>
            <CreatorSimplePostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/creator/posts/select-practice"
        element={
          <RequiresAuth>
            <CreatorPracticeLibraryPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/creator/posts/:id/edit"
        element={
          <RequiresAuth>
            <CreatorPostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/creator/posts/:id/edit-simple"
        element={
          <RequiresAuth>
            <CreatorSimplePostEditorPage />
          </RequiresAuth>
        }
      />
      <Route
        path="/:locale/profile"
        element={
          <RequiresAuth>
            <ProfilePage />
          </RequiresAuth>
        }
      />
      <Route path="/:locale/privacy" element={<PrivacyPage />} />
      <Route path="/:locale/privacy/india" element={<IndiaPrivacyPage />} />
      <Route path="/:locale/terms" element={<TermsPage />} />
      <Route path="/:locale/data-deletion" element={<DataDeletionPage />} />

      {/* Retreats vertical */}
      <Route path="/:locale/retreats" element={<RetreatsInterestPage />} />
      <Route path="/:locale/retreats/:slug" element={<RetreatDetailsPage />} />
      <Route
        path="/:locale/retreats/:slug/package/:packageId"
        element={<RetreatPackageDetailsPage />}
      />
      <Route path="/:locale/retreats/:slug/book" element={<RetreatBookingPage />} />
      <Route
        path="/:locale/retreats/bookings/:bookingId"
        element={<RetreatBookingDetailsPage />}
      />
      <Route
        path="/:locale/retreats/cancellation/:bookingId"
        element={<RetreatCancellationPage />}
      />

      {/* Notifications inbox */}
      <Route
        path="/:locale/notifications"
        element={
          <RequiresAuth>
            <NotificationsPage />
          </RequiresAuth>
        }
      />

      {/* Notification preferences */}
      <Route
        path="/:locale/settings/notifications"
        element={
          <RequiresAuth>
            <NotificationPreferencesPage />
          </RequiresAuth>
        }
      />

      {/* Reminders */}
      <Route
        path="/:locale/settings/reminders"
        element={
          <RequiresAuth>
            <RemindersPage />
          </RequiresAuth>
        }
      />

      {/* Practice Distribution OS — Gate 2 (public, no auth required) */}
      <Route path="/join/:code" element={<ProgramLandingPage />} />
      <Route path="/p/:slug" element={<ProgramLandingPage />} />
      <Route path="/programs/support" element={<ProgramSupportPage />} />

      {/* TLP — programs discovery and live sessions (public) */}
      <Route path="/programs/" element={<ProgramsDiscoveryPage />} />
      <Route path="/programs/:slug" element={<ProgramDetailPage />} />
      <Route path="/live-sessions/" element={<LiveSessionsListPage />} />
      <Route path="/live-sessions/:code/" element={<LiveSessionDetailPage />} />
      {/* /sessions/ aliases for Universal Links compatibility */}
      <Route path="/sessions/" element={<LiveSessionsListPage />} />
      <Route path="/sessions/:code/" element={<LiveSessionDetailPage />} />
      {/* TLP Phase 2 — public guide profiles */}
      <Route path="/guides/:slug/" element={<GuidePublicProfilePage />} />
      <Route path="/guides/:slug" element={<GuidePublicProfilePage />} />
      {/* TLP Phase 2 — guide self-service (auth required via API 403 handling) */}
      <Route path="/guide/dashboard" element={<RequiresGuideAuth><GuideDashboardPage /></RequiresGuideAuth>} />
      <Route path="/guide/programs/draft" element={<RequiresGuideAuth><GuideProgramDraftPage /></RequiresGuideAuth>} />
      <Route path="/guide/sessions/draft" element={<RequiresGuideAuth><GuideSessionDraftPage /></RequiresGuideAuth>} />
      <Route path="/guide/templates" element={<RequiresGuideAuth><GuideTemplateBrowserPage /></RequiresGuideAuth>} />
      <Route path="/guide/templates/:id/edit" element={<RequiresGuideAuth><GuideTemplateDayEditorPage /></RequiresGuideAuth>} />
      <Route path="/guide/templates/:id/review" element={<RequiresGuideAuth><GuideTemplateReviewPage /></RequiresGuideAuth>} />
      {/* Ops template review — same page, ops fetches via admin endpoint */}
      <Route path="/ops/templates/:id/review" element={<RequiresStaff><GuideTemplateReviewPage /></RequiresStaff>} />

      {/* Practice Distribution OS — Gate 7 (staff-only admin) */}
      <Route
        path="/programs/admin/"
        element={<RequiresStaff><ProgramAdminDashboard /></RequiresStaff>}
      />
      <Route
        path="/programs/admin/overview/"
        element={<RequiresFounder><ProgramAdminOverview /></RequiresFounder>}
      />
      <Route
        path="/programs/admin/campaigns/"
        element={<RequiresStaff><ProgramAdminCampaignList /></RequiresStaff>}
      />
      <Route
        path="/programs/admin/new/"
        element={<RequiresStaff><ProgramAdminCreateCampaign /></RequiresStaff>}
      />
      <Route
        path="/programs/admin/:code/"
        element={<RequiresStaff><ProgramAdminCampaignDetail /></RequiresStaff>}
      />

      <Route path="*" element={<LocaleRedirect />} />
    </Routes>
  );
}
