import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Info, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { WEB_ENV } from "../../lib/env";
import { useRecaptcha } from "../../hooks/useRecaptcha";
import { useAppDispatch } from "../../store/hooks";
import { showSnackBar } from "../../store/snackBarSlice";
import { useTranslation } from "../../lib/i18n";
import { PhoneOtpFlow } from "../../components/PhoneOtpFlow";
import {
  invalidateDashboardViewCache,
  invalidateMitraHomeV3Cache,
} from "../../engine/mitraApi";
import { invalidateJourneyStatusCache } from "../../hooks/useJourneyStatus";
import { invalidateJourneyEntryViewCache } from "../../hooks/useJourneyEntryView";
import "./Auth.css";

/**
 * LoginPage — Enhanced Sign-in Page
 * Features:
 * - Premium two-panel layout consistent with Signup
 * - Google Social Login integration
 * - Password visibility toggle
 * - Email/Password validation
 * - Animated interactions
 */

function GoogleLoginButton({
  disabled,
  loading,
  onMissingConfig,
  onError,
  onSuccess,
}: {
  disabled: boolean;
  loading: boolean;
  onMissingConfig: () => void;
  onError: () => void;
  onSuccess: (accessToken: string) => Promise<void>;
}) {
  const googleClientId = WEB_ENV.googleClientId.trim();

  if (!googleClientId) {
    return (
      <button
        type="button"
        onClick={onMissingConfig}
        disabled={disabled}
        className="google-login-btn"
      >
        <GoogleButtonContent loading={loading} />
      </button>
    );
  }

  return (
    <ConfiguredGoogleLoginButton
      disabled={disabled}
      loading={loading}
      onError={onError}
      onSuccess={onSuccess}
    />
  );
}

function ConfiguredGoogleLoginButton({
  disabled,
  loading,
  onError,
  onSuccess,
}: {
  disabled: boolean;
  loading: boolean;
  onError: () => void;
  onSuccess: (accessToken: string) => Promise<void>;
}) {
  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      await onSuccess(tokenResponse.access_token);
    },
    onError,
  });

  return (
    <button
      type="button"
      onClick={() => handleGoogleLogin()}
      disabled={disabled}
      className="google-login-btn"
    >
      <GoogleButtonContent loading={loading} />
    </button>
  );
}

function GoogleButtonContent({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  if (loading) {
    return <Loader2 className="spinner" size={20} />;
  }

  return (
    <>
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      <span>{t('auth.signInWithGoogle')}</span>
    </>
  );
}

export function LoginPage() {
  useRecaptcha();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/en/mitra";
  const { login, socialLoginGoogle } = useAuth();
  const { t } = useTranslation();

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneAuthSuccess = async (
    tokens?: { accessToken: string; refreshToken: string },
    isNewUser?: boolean,
  ) => {
    invalidateJourneyStatusCache();
    invalidateJourneyEntryViewCache();
    invalidateDashboardViewCache();
    invalidateMitraHomeV3Cache();
    dispatch(showSnackBar(t("auth.loginSuccess")));
    if (isNewUser) {
      navigate("/en/onboarding", { replace: true });
    } else {
      navigate(returnTo, { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("auth.validationBothRequired"));
      return;
    }

    setLoading(true);
    setError("");
    const result = await login(email, password, returnTo);
    setLoading(false);

    if (!result.success) {
      setError(result.error || t("auth.loginFailed"));
    } else {
      dispatch(showSnackBar(t("auth.loginSuccess")));
    }
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <div className="auth-layout-container">
      <main className="auth-content-container">
        <div className="auth-grid">
          {/* Left Panel: Brand Experience */}
          <section className="auth-panel feature-panel">
            <div className="brand-header">
              <img
                src="/kalpx-logo.png"
                alt="KalpX"
                style={{ height: "40px", marginBottom: "1.5rem" }}
              />
              <h1 className="auth-hero-title text-center">
                {t("auth.getStarted")}
              </h1>
              <p className="auth-hero-sub">
                {t("auth.tagline")}
              </p>
            </div>
            <section>
              <div className="auth-header">
                <h2 className="auth-title">{t("auth.signIn")}</h2>
              </div>

              <GoogleLoginButton
                disabled={isAnyLoading}
                loading={googleLoading}
                onMissingConfig={() => {
                  setError(t("auth.googleUnavailable"));
                }}
                onError={() => {
                  setError(t("auth.googleFailed"));
                }}
                onSuccess={async (accessToken) => {
                  setGoogleLoading(true);
                  setError("");
                  const result = await socialLoginGoogle(accessToken, returnTo);
                  setGoogleLoading(false);
                  if (!result.success) {
                    setError(result.error || "Google sign-in failed");
                  }
                }}
              />

              {WEB_ENV.phoneAuthEnabled === "1" && (
                <div className="auth-method-toggle">
                  <button
                    type="button"
                    className={`auth-tab-btn${authMethod === "email" ? " auth-tab-btn--active" : ""}`}
                    onClick={() => { setAuthMethod("email"); setError(""); }}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={`auth-tab-btn${authMethod === "phone" ? " auth-tab-btn--active" : ""}`}
                    onClick={() => { setAuthMethod("phone"); setError(""); }}
                  >
                    Phone
                  </button>
                </div>
              )}

              {authMethod === "phone" && WEB_ENV.phoneAuthEnabled === "1" ? (
                <PhoneOtpFlow purpose="auth" onSuccess={handlePhoneAuthSuccess} />
              ) : (
                <>
              <div className="auth-divider">
                <span>{t("auth.orSignInWithEmail")}</span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">{t("auth.emailAddress")}</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">{t("auth.password")}</label>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--kalpx-gold)",
                        fontWeight: 600,
                      }}
                    >
                      {t("auth.forgotPassword")}
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("auth.passwordPlaceholder")}
                      required
                      autoComplete="current-password"
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="global-error"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Info size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isAnyLoading}
                >
                  {loading ? (
                    <Loader2 className="spinner" size={20} />
                  ) : (
                    t("auth.signInBtn")
                  )}
                </button>

                <div className="auth-footer">
                  <Link to="/signup">{t("auth.newToKalpX")}</Link>
                </div>
              </form>
                </>
              )}
            </section>
          </section>

          {/* Right Panel: Sign-in Form */}
        </div>
      </main>
    </div>
  );
}
