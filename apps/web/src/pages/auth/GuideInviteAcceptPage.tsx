import { CheckCircle, Eye, EyeOff, Info, Loader2, Lock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { storeTokens } from "@kalpx/auth";
import { webStorage } from "../../lib/webStorage";
import { api } from "../../lib/api";
import "./Auth.css";

interface InviteInfo {
  email: string;
  expires_at: string;
}

interface AcceptResponse {
  access_token: string;
  refresh_token: string;
  user: { id: number; email: string; is_guide: boolean };
}

export function GuideInviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) { setInviteError("Invalid invite link."); setLoadingInvite(false); return; }
    api.get<InviteInfo>(`guide/invite/${token}/`)
      .then((res) => {
        if (!res.data.email) {
          setInviteError("This invite link has expired or already been used.");
        } else {
          setInviteInfo(res.data);
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 410) {
          setInviteError("This invite link has expired or already been used.");
        } else {
          setInviteError("This invite link is invalid or has expired.");
        }
      })
      .finally(() => setLoadingInvite(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<AcceptResponse>(`guide/invite/${token}/`, { password });
      const { access_token, refresh_token } = res.data;
      await storeTokens(webStorage, { accessToken: access_token, refreshToken: refresh_token });
      localStorage.setItem("kalpx:guide_session", "1");
      navigate("/guide/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.password?.[0] ||
        "Something went wrong. Please try again.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="auth-layout-container">
        <main className="auth-content-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Loader2 className="spinner" size={32} style={{ color: "var(--kalpx-gold)" }} />
        </main>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="auth-layout-container">
        <main className="auth-content-container">
          <div className="auth-grid">
            <section className="auth-panel feature-panel">
              <div className="brand-header">
                <img src="/kalpx-logo.png" alt="KalpX" style={{ height: "40px", marginBottom: "1.5rem" }} />
                <h1 className="auth-hero-title text-center">Leader Portal</h1>
              </div>
              <div className="global-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 16 }}>
                <Info size={16} />
                <span>{inviteError}</span>
              </div>
              <p style={{ textAlign: "center", fontSize: 14 }}>
                <Link to="/guide/login" style={{ color: "var(--kalpx-gold)" }}>Sign in if you already have an account →</Link>
              </p>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-layout-container">
      <main className="auth-content-container">
        <div className="auth-grid">
          <section className="auth-panel feature-panel">
            <div className="brand-header">
              <img src="/kalpx-logo.png" alt="KalpX" style={{ height: "40px", marginBottom: "1.5rem" }} />
              <h1 className="auth-hero-title text-center">Leader Portal</h1>
              <p className="auth-hero-sub">Accept your invitation</p>
            </div>

            <section>
              <div className="auth-header">
                <h2 className="auth-title">Set your password</h2>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(201,147,23,0.08)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                <CheckCircle size={16} style={{ color: "var(--kalpx-gold)", flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "var(--kalpx-text)" }}>
                  Invite for <strong>{inviteInfo?.email}</strong>
                </span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="guide-new-password">Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="guide-new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      autoFocus
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

                <div className="form-group">
                  <label htmlFor="guide-confirm-password">Confirm password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="guide-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="password-toggle"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {formError && (
                  <div className="global-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Info size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? <Loader2 className="spinner" size={20} /> : "Create account & sign in"}
                </button>
              </form>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
