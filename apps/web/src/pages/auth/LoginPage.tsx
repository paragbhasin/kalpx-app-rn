import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Info, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRecaptcha } from "../../hooks/useRecaptcha";
import { useAppDispatch } from "../../store/hooks";
import { showSnackBar } from "../../store/snackBarSlice";
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

export function LoginPage() {
  useRecaptcha();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/en/mitra";
  const { login, socialLoginGoogle } = useAuth();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError("");
      const result = await socialLoginGoogle(
        tokenResponse.access_token,
        returnTo,
      );
      setGoogleLoading(false);
      if (!result.success) {
        setError(result.error || "Google sign-in failed");
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    const result = await login(email, password, returnTo);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Login failed. Please check your credentials.");
    } else {
      dispatch(showSnackBar("Successfully signed in!"));
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
                Get Started with KalpX
              </h1>
              <p className="auth-hero-sub">
                Your portal to spiritual growth, daily dharma, and sacred
                wisdom. Sign in to continue your journey.
              </p>
            </div>
            <section>
              <div className="auth-header">
                <h2 className="auth-title">Login to KalpX</h2>
                <div className="auth-badge">
                  <span>Member</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isAnyLoading}
                className="google-login-btn"
              >
                {googleLoading ? (
                  <Loader2 className="spinner" size={20} />
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
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
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="auth-divider">
                <span>or sign in with email</span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--kalpx-gold)",
                        fontWeight: 600,
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                    "Sign In"
                  )}
                </button>

                <div className="auth-footer">
                  New to KalpX? <Link to="/signup">Create account</Link>
                </div>
              </form>
            </section>
          </section>

          {/* Right Panel: Sign-in Form */}
        </div>
      </main>
    </div>
  );
}
