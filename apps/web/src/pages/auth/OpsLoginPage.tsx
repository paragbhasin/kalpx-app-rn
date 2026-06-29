import { Eye, EyeOff, Info, Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storeTokens } from "@kalpx/auth";
import { webStorage } from "../../lib/webStorage";
import { api } from "../../lib/api";
import type { LoginResponse } from "../../types/auth";
import { useRecaptcha } from "../../hooks/useRecaptcha";
import { getRecaptchaToken } from "../../lib/recaptcha";
import "./Auth.css";

export function OpsLoginPage() {
  const navigate = useNavigate();
  useRecaptcha();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email or username and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const recaptcha_token = (import.meta.env.DEV || import.meta.env.VITE_SKIP_RECAPTCHA === "1") ? "" : await getRecaptchaToken("ops_login");
      const res = await api.post<LoginResponse>("users/login/", { email, password, recaptcha_token });
      const data = res.data;

      if (data.user_type !== "ops") {
        setError("Access denied. This portal is for KalpX ops team only.");
        setLoading(false);
        return;
      }

      const accessToken = data.access_token ?? data.access;
      const refreshToken = data.refresh_token ?? data.refresh;
      if (!accessToken || !refreshToken) {
        setError("Login succeeded but tokens were missing. Please try again.");
        setLoading(false);
        return;
      }

      await storeTokens(webStorage, { accessToken, refreshToken });

      if (data.is_superuser) {
        localStorage.setItem("kalpx:founder_session", "1");
        localStorage.setItem("kalpx:ops_session", "1");
        navigate("/programs/admin/overview/", { replace: true });
      } else {
        localStorage.setItem("kalpx:ops_session", "1");
        navigate("/programs/admin/", { replace: true });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout-container">
      <main className="auth-content-container">
        <div className="auth-grid">
          <section className="auth-panel feature-panel">
            <div className="brand-header">
              <img
                src="/kalpx-logo.png"
                alt="KalpX"
                style={{ height: "40px", marginBottom: "1.5rem" }}
              />
              <h1 className="auth-hero-title text-center">Ops Portal</h1>
              <p className="auth-hero-sub">KalpX internal team access only</p>
            </div>

            <section>
              <div className="auth-header">
                <h2 className="auth-title">Sign in</h2>
              </div>

              <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label htmlFor="ops-email">Email or username</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      id="ops-email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ops@kalpx.com or username"
                      required
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="ops-password">Password</label>
                    <Link
                      to="/ops-forgot-password"
                      style={{ fontSize: "0.8rem", color: "var(--kalpx-gold)", fontWeight: 600 }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="ops-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      required
                      autoComplete="current-password"
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="global-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Info size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={20} /> : "Sign in to Ops Portal"}
                </button>
              </form>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
