import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "../../components/ui";
import { ExploreRetreats } from "./ExploreRetreats";
import { MyRetreatBookings } from "./MyRetreatBookings";
const landingHero = "/mobile-assets/retreat/landing1.webp";

type RetreatTab = "explore" | "bookings";

export function RetreatsInterestPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "bookings" ? "bookings" : "explore";
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  const heroImageStyle = useMemo<CSSProperties>(
    () => ({
      objectFit: "cover",
      width: isDesktop ? "100%" : 390,
      height: isDesktop ? "100%" : 229,
      display: "block",
    }),
    [isDesktop],
  );

  function goToActiveTab(tab: RetreatTab) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  }

  return (
    <AppShell>
      <div style={pageStyle}>
        <section style={heroSectionStyle}>
          <div style={heroBgWrapStyle}>
            <img src={landingHero} alt="Retreat Hero" style={heroImageStyle} />
            <div style={heroOverlayStyle} />
          </div>

          <div style={heroContentStyle}>
            <h1 style={heroTitleStyle}>Welcome to KalpX Retreats</h1>
            <p style={heroTextStyle}>
              Mindfully curated wellness retreats that help you pause, reset and
              connect at your own space
            </p>
          </div>
        </section>

        <div style={tabsShellStyle}>
          <div style={tabsWrapStyle}>
            <button
              type="button"
              onClick={() => goToActiveTab("explore")}
              style={{
                ...tabButtonStyle,
                ...(activeTab === "explore"
                  ? activeTabStyle
                  : inactiveTabStyle),
              }}
            >
              Explore Retreats
            </button>
            <button
              type="button"
              onClick={() => goToActiveTab("bookings")}
              style={{
                ...tabButtonStyle,
                ...(activeTab === "bookings"
                  ? activeTabStyle
                  : inactiveTabStyle),
              }}
            >
              My Bookings
            </button>
          </div>
        </div>

        <div style={contentStyle}>
          {activeTab === "explore" ? (
            <ExploreRetreats />
          ) : (
            <MyRetreatBookings />
          )}
        </div>
      </div>
    </AppShell>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#ffffff",
};

const heroSectionStyle: CSSProperties = {
  position: "relative",
  minHeight: 229,
  height: "22vh",
  width: "100%",
  overflow: "hidden",
};

const heroBgWrapStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
};

const heroOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
};

const heroContentStyle: CSSProperties = {
  position: "relative",
  zIndex: 10,
  display: "flex",
  height: "100%",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 24px",
  textAlign: "center",
  marginTop: 41,
  boxSizing: "border-box",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#ffffff",
  lineHeight: 1.2,
};

const heroTextStyle: CSSProperties = {
  margin: "8px 0 0",
  maxWidth: 560,
  fontSize: 16,
  fontWeight: 500,
  color: "rgba(255,255,255,0.9)",
  lineHeight: 1.45,
};

const tabsShellStyle: CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "0 16px",
  boxSizing: "border-box",
};

const tabsWrapStyle: CSSProperties = {
  display: "flex",
  borderRadius: 8,
  background: "#EBEBEB",
  padding: 4,
  marginTop: 8,
  gap: 0,
};

const tabButtonStyle: CSSProperties = {
  flex: 1,
  border: "none",
  borderRadius: 12,
  padding: "8px 16px",
  fontSize: 15,
  fontWeight: 700,
  transition: "all 0.2s ease",
  cursor: "pointer",
  background: "transparent",
};

const activeTabStyle: CSSProperties = {
  background: "#D4A017",
  color: "#ffffff",
  boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
};

const inactiveTabStyle: CSSProperties = {
  color: "#707070",
};

const contentStyle: CSSProperties = {
  width: "100%",
};
