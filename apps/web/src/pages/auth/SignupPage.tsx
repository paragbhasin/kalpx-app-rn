import {
  Loader2,
  Lock,
  LucideIcon,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRecaptcha } from "../../hooks/useRecaptcha";
import { api } from "../../lib/api";
import { getRecaptchaToken } from "../../lib/recaptcha";
import { useAppDispatch } from "../../store/hooks";
import { showSnackBar } from "../../store/snackBarSlice";
import { WEB_ENV } from "../../lib/env";
import { PhoneOtpFlow } from "../../components/PhoneOtpFlow";
import {
  invalidateDashboardViewCache,
  invalidateMitraHomeV3Cache,
} from "../../engine/mitraApi";
import { invalidateJourneyStatusCache } from "../../hooks/useJourneyStatus";
import { invalidateJourneyEntryViewCache } from "../../hooks/useJourneyEntryView";
import "./Auth.css";
import { useTranslation } from '../../lib/i18n';

/**
 * SignupPage — Enhanced Registration Page
 * Features:
 * - Two-panel layout
 * - Real-time username availability check (debounced)
 * - Password strength meter & validation rules
 * - OTP generation and verification with cooldown
 * - Premium aesthetics with mandala background
 */

export function SignupPage() {
  useRecaptcha();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/en/mitra";
  const { generateOtp, verifyOtp, registerUser } = useAuth();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  const handlePhoneSignupSuccess = async (
    _tokens?: { accessToken: string; refreshToken: string },
    isNewUser?: boolean,
  ) => {
    invalidateJourneyStatusCache();
    invalidateJourneyEntryViewCache();
    invalidateDashboardViewCache();
    invalidateMitraHomeV3Cache();
    dispatch(showSnackBar("Welcome to KalpX!"));
    if (isNewUser) {
      navigate("/en/onboarding", { replace: true });
    } else {
      navigate(returnTo, { replace: true });
    }
  };

  // Form State
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [otpValidFor, setOtpValidFor] = useState(0);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameError, setUsernameError] = useState("");

  // Password Validations
  const validations = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /\d/.test(password),
      noUserOrEmail:
        password !== username && password !== email && password.length > 0,
    }),
    [password, username, email],
  );

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (validations.minLength) score += 25;
    if (validations.hasLetter) score += 25;
    if (validations.hasNumber) score += 25;
    if (validations.noUserOrEmail) score += 25;
    return score;
  }, [validations]);

  const strengthClass = useMemo(() => {
    if (passwordStrength < 40) return "weak";
    if (passwordStrength < 70) return "medium";
    return "strong";
  }, [passwordStrength]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // OTP Validity timer
  useEffect(() => {
    if (otpValidFor > 0) {
      const timer = setInterval(() => setOtpValidFor((prev) => prev - 1), 1000);
      return () => {
        clearInterval(timer);
        if (otpValidFor === 1) {
          setOtpVerified(false);
          setOtpSent(false);
          setOtpSuccessMsg("");
        }
      };
    }
  }, [otpValidFor]);

  // Debounced Username Check
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameLoading(true);
      try {
        const response = await api.post("users/check_username/", {
          username: username,
          recaptcha_token: await getRecaptchaToken("check_username"),
          recaptcha_action: "check_username",
        });

        if (response.data.available) {
          setUsernameAvailable(true);
          setUsernameError("");
        } else {
          setUsernameAvailable(false);
          setUsernameError(response.data.error || "Username taken");
        }
      } catch (err: any) {
        setUsernameAvailable(false);
        setUsernameError(err.response?.data?.error || "Error checking username");
      } finally {
        setUsernameLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleRequestOTP = async () => {
    if (!email) {
      setError(t('auth.emailRequired'));
      return;
    }
    setOtpLoading(true);
    setError("");
    const result = await generateOtp(email);
    setOtpLoading(false);
    if (result.success) {
      setOtpSent(true);
      setOtpSuccessMsg(t('auth.otpSent'));
      setCooldown(60);
    } else {
      setError(result.error || t('auth.otpFailed'));
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError(t('auth.otpRequired'));
      return;
    }
    setOtpLoading(true);
    setError("");
    const result = await verifyOtp(email, otp);
    setOtpLoading(false);
    if (result.success) {
      setOtpVerified(true);
      setOtpSuccessMsg(t('auth.otpVerified'));
      setOtpValidFor(120);
    } else {
      setError(result.error || t('auth.otpInvalid'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      setError(t('auth.verifyEmailFirst'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return;
    }

    setLoading(true);
    setError("");
    const result = await registerUser({
      email,
      password1: password,
      password2: confirmPassword,
      username,
    } as any);
    setLoading(false);

    if (result.success) {
      try { navigator.sendBeacon('/api/programs/track/', JSON.stringify({ event: 'signup_completed', method: 'email' })); } catch { /* non-fatal */ }
      dispatch(showSnackBar(t('auth.accountCreated')));
      navigate(returnTo);
    } else {
      setError(result.error || t('auth.registrationFailed'));
    }
  };

  const canRequestOTP =
    email &&
    usernameAvailable &&
    Object.values(validations).every((v) => v) &&
    password === confirmPassword;

  return (
    <div className="auth-layout-container">
      <main className="auth-content-container">
        <div className="auth-grid">
          <section className="auth-panel form-panel">
            <div className="auth-header">
              <h2 className="auth-title">{t('auth.createAccount')}</h2>
            </div>

            {WEB_ENV.phoneAuthEnabled === "1" && (
              <div className="auth-method-toggle">
                <button
                  type="button"
                  className={`auth-tab-btn${authMethod === "email" ? " auth-tab-btn--active" : ""}`}
                  onClick={() => setAuthMethod("email")}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn${authMethod === "phone" ? " auth-tab-btn--active" : ""}`}
                  onClick={() => setAuthMethod("phone")}
                >
                  Phone
                </button>
              </div>
            )}

            {authMethod === "phone" && WEB_ENV.phoneAuthEnabled === "1" ? (
              <PhoneOtpFlow purpose="signup" onSuccess={handlePhoneSignupSuccess} />
            ) : (
            <form onSubmit={handleRegister} className="auth-form">
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">{t('auth.email')}</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    disabled={otpVerified}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">{t('auth.username')}</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth.usernamePlaceholder')}
                    required
                  />
                  {usernameLoading && (
                    <Loader2 className="spinner input-action-icon" size={18} />
                  )}
                </div>
                {usernameAvailable === true && (
                  <p className="success-text">{t('auth.usernameAvailable')}</p>
                )}
                {usernameError && <p className="error-text">{usernameError}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">{t('auth.password')}</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>

                <ul className="password-rules">
                  <RuleItem
                    valid={validations.minLength}
                    text={t('auth.passwordMin')}
                  />
                  <RuleItem
                    valid={validations.hasNumber}
                    text={t('auth.passwordNumber')}
                  />
                  <RuleItem
                    valid={validations.hasLetter}
                    text={t('auth.passwordLetter')}
                  />
                  <RuleItem
                    valid={validations.noUserOrEmail}
                    text={t('auth.passwordNotUsername')}
                  />
                </ul>

                <div className="strength-meter">
                  <div
                    className={`strength-bar ${strengthClass}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                <div className="input-wrapper">
                  <ShieldCheck className="input-icon" size={18} />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    required
                  />
                </div>
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <p className="error-text">{t('auth.passwordsNoMatch')}</p>
                  )}
              </div>

              {/* OTP Section */}
              <div className="form-group otp-section">
                <label htmlFor="otp">{t('auth.verificationCode')}</label>
                <div className="otp-controls">
                  <div className="input-wrapper">
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder={t('auth.otpPlaceholder')}
                      disabled={otpVerified}
                      className={otpVerified ? "verified" : ""}
                    />
                  </div>
                  <button
                    type="button"
                    className={`otp-btn ${otpVerified ? "verified" : ""}`}
                    onClick={
                      otpSent && !otpVerified
                        ? handleVerifyOTP
                        : handleRequestOTP
                    }
                    disabled={
                      otpLoading ||
                      (!otpSent && (!canRequestOTP || cooldown > 0)) ||
                      otpVerified
                    }
                  >
                    {otpLoading ? (
                      <Loader2 className="spinner" size={16} />
                    ) : otpVerified ? (
                      t('auth.otpVerified')
                    ) : otpSent ? (
                      t('auth.verifyCode')
                    ) : (
                      t('auth.getCode')
                    )}
                  </button>
                </div>
                {cooldown > 0 && !otpVerified && (
                  <p className="cooldown-text">{t('auth.resendIn').replace('{s}', String(cooldown))}</p>
                )}
                {otpSuccessMsg && (
                  <p className="success-text">{otpSuccessMsg}</p>
                )}
                {otpVerified && otpValidFor > 0 && (
                  <p
                    className={`otp-expiry ${otpValidFor < 30 ? "urgent" : ""}`}
                  >
                    {t('auth.expiresIn').replace('{s}', String(otpValidFor))}
                  </p>
                )}
              </div>

              {error && <div className="global-error">{error}</div>}

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !otpVerified}
              >
                {loading ? (
                  <Loader2 className="spinner mr-2" size={18} />
                ) : (
                  t('auth.register')
                )}
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: '#888',
                  textAlign: 'center',
                  margin: '4px 0 0',
                  lineHeight: 1.5,
                }}
              >
                By creating an account, you agree to KalpX&apos;s{' '}
                <Link to="/en/terms" style={{ color: '#b8864b', textDecoration: 'none', fontWeight: 600 }}>
                  Terms of Service
                </Link>{' '}
                and acknowledge our{' '}
                <Link to="/en/privacy" style={{ color: '#b8864b', textDecoration: 'none', fontWeight: 600 }}>
                  Privacy Policy
                </Link>
                .
              </p>

              <div className="auth-footer">
                <Link to="/login">{t('auth.alreadyHaveAccount')}</Link>
              </div>
            </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <li className="feature-item">
      <div className="feature-icon-wrapper">
        <Icon size={16} />
      </div>
      <p>{text}</p>
    </li>
  );
}

function RuleItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <li className={`rule-item ${valid ? "valid" : ""}`}>
      <span style={{ marginRight: "8px" }}>{valid ? "✅" : "❌"}</span>
      {text}
    </li>
  );
}
