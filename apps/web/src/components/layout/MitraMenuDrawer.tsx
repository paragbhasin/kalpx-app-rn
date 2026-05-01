import { AUTH_KEYS } from "@kalpx/api-client";
import { clearTokens } from "@kalpx/auth";
import { LayoutDashboard, User, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { webStorage } from "../../lib/webStorage";

interface Props {
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Mitra", Icon: LayoutDashboard, to: "/en/mitra/dashboard" },
  // { label: "Community", Icon: Users, to: "/en/community" },
  // { label: "Classes", Icon: BookOpen, to: "/en/classes" },
  { label: "Profile", Icon: User, to: "/en/profile" },
];

export function MitraMenuDrawer({ onClose }: Props) {
  const navigate = useNavigate();
  const { authed, userInitial, refresh } = useCurrentUser();
  const isLoggedIn =
    typeof localStorage !== "undefined" &&
    !!localStorage.getItem(AUTH_KEYS.accessToken);

  async function handleLogout() {
    await clearTokens(webStorage);
    refresh();
    onClose();
    navigate("/login");
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 80,
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 14,
          right: 0,
          bottom: 14,
          width: "min(456px, calc(100vw - 80px))",
          background: "#ffffff",
          borderRadius: "42px 0 0 0",
          boxShadow: "-12px 0 30px rgba(67,33,4,0.14)",
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          animation: "kalpx-slide-in-right 0.22s ease-out",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#d9a40c",
            padding: "15px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#fff",
              color: "#d9a40c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px rgba(67,33,4,0.08)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {authed ? (
              userInitial
            ) : (
              <User size={28} strokeWidth={2.2} color="#d9a40c" />
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2b2b2b",
            }}
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "34px 42px 0",
          }}
        >
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {NAV_ITEMS.map(({ label, Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: "#2f3135",
                  textDecoration: "none",
                  lineHeight: 1.1,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                <Icon size={22} strokeWidth={1.9} color="#5a2f0b" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div style={{ marginTop: 20 }}>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--kalpx-cta)",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                style={{
                  color: "var(--kalpx-cta)",
                  fontSize: 18,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Login
              </Link>
            )}
          </div>

          <div
            style={{
              marginTop: 28,
              borderTop: "1px solid #d9d9d9",
              paddingTop: 34,
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 16,
                fontWeight: 700,
                color: "#2f3135",
              }}
            >
              Download App now
            </p>
            <a
              href="#"
              style={{
                width: 45,
                height: 45,
                borderRadius: 10,
                background: "#fff",
                boxShadow: "0 14px 24px rgba(67,33,4,0.12)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2f3135",
                textDecoration: "none",
              }}
            >
              <img
                src="/apple-black.svg"
                width={28}
                height={33}
                alt=""
                aria-hidden="true"
              />
            </a>
          </div>

          <div
            style={{
              marginTop: 42,
              borderTop: "1px solid #d9d9d9",
              paddingTop: 30,
              paddingBottom: 28,
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 16,
                fontWeight: 600,
                color: "#3b3d42",
              }}
            >
              Follow Us
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <a
                href="https://www.facebook.com/KalpxOfficial/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/facebook-icon.svg"
                  width={32}
                  height={32}
                  alt="Facebook"
                />
              </a>

              <a
                href="https://www.instagram.com/kalpxofficial"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/insta.svg" width={30} height={30} alt="Instagram" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kalpx-slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
