import { API_BASE_URL, IMAGE_BASE_URL } from './env';

export const api = {
  mitra: {
    today: () => `${API_BASE_URL}/mitra/today/`,
    day7: () => `${API_BASE_URL}/mitra/day7/`,
    day14: () => `${API_BASE_URL}/mitra/day14/`,
    journeyStatus: () => `${API_BASE_URL}/mitra/journey/status/`,
    journeyStart: () => `${API_BASE_URL}/mitra/journey/start-v3/`,
    trackEvent: () => `${API_BASE_URL}/mitra/track-event/`,
    trackCompletion: () => `${API_BASE_URL}/mitra/track-completion/`,
    dashboardChips: () => `${API_BASE_URL}/mitra/rooms/dashboard-chips/`,
    onboardingRecognition: () => `${API_BASE_URL}/mitra/onboarding/recognition/`,
    onboardingComplete: () => `${API_BASE_URL}/mitra/onboarding/complete/`,
  },
  auth: {
    login: () => `${API_BASE_URL}/auth/login/`,
    logout: () => `${API_BASE_URL}/auth/logout/`,
    refresh: () => `${API_BASE_URL}/auth/token/refresh/`,
    signup: () => `${API_BASE_URL}/auth/register/`,
    forgotPassword: () => `${API_BASE_URL}/auth/password-reset/`,
  },
  image: (path: string) => `${IMAGE_BASE_URL}${path}`,
} as const;
