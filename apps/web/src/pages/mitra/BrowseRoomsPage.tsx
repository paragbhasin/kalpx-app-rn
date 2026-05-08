import { ROOM_DESCRIPTIONS, ROOM_LABELS } from "@kalpx/contracts";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import { useJourneyStatus } from "../../hooks/useJourneyStatus";

const ROOM_GROUPS = [
  {
    label: "Settle",
    rooms: ["room_stillness", "room_release"] as const,
  },
  {
    label: "Understand",
    rooms: ["room_clarity", "room_connection"] as const,
  },
  {
    label: "Grow",
    rooms: ["room_growth", "room_joy"] as const,
  },
];

export function BrowseRoomsPage() {
  const navigate = useNavigate();
  const { hasActiveJourney } = useJourneyStatus();

  function handleRoom(roomId: string) {
    if (hasActiveJourney) {
      navigate(`/en/mitra/room/${roomId}`);
    } else {
      navigate("/en/mitra/tell-mitra");
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
      <Header transparent />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}
          >
            ← Back
          </button>
          <h2 style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 24, color: "#432104", margin: "0 0 24px" }}>
            Browse Rooms
          </h2>

          {ROOM_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#A08060", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.rooms.map((roomId) => (
                  <button
                    key={roomId}
                    onClick={() => handleRoom(roomId)}
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      borderRadius: 16,
                      border: "1px solid rgba(201,168,76,0.22)",
                      background: "rgba(250,245,240,0.92)",
                      boxShadow: "0 8px 18px rgba(67,33,4,0.07)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 16, color: "#432104", marginBottom: 4 }}>
                      {ROOM_LABELS[roomId]}
                    </div>
                    <div style={{ fontSize: 13, color: "#7B6550", lineHeight: 1.5 }}>
                      {ROOM_DESCRIPTIONS[roomId]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer transparent />
      <MobileBottomNav transparent />
    </div>
  );
}
