import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Info, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./Auth.css";

export function OpsForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email is required."); return; }
    setError("");
    setLoading(true);
    // Always navigate to reset-password to avoid account enumeration
    await forgotPassword(email);
    setLoading(false);
    navigate("/reset-password", { state: { email, returnTo: "/ops-login" } });
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
                <h2 className="auth-title">Reset password</h2>
              </div>

              <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: 16 }}>
                <p style={{ color: "var(--kalpx-text-soft)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.6 }}>
                  Enter your ops team email and we'll send you a reset code.
                </p>

                <div className="form-group">
                  <label htmlFor="ops-reset-email">Email address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      id="ops-reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ops@kalpx.com"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="global-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Info size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={20} /> : "Send reset code"}
                </button>

                <div style={{ textAlign: "center", fontSize: 14, marginTop: 12 }}>
                  <Link to="/ops-login" style={{ color: "var(--kalpx-gold)" }}>
                    ← Back to ops sign in
                  </Link>
                </div>
              </form>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
