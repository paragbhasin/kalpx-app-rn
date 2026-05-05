import { X } from "lucide-react";
import type { ReactNode } from "react";

export interface CommunityLinkedItemView {
  type: "mantra" | "sankalp" | "practice";
  itemId: string;
  title: string;
  subtitle?: string;
  devanagari?: string;
  iast?: string;
  meaning?: string;
  essence?: string;
  insight?: string;
  source?: string;
  suggestedPractice?: string;
  duration?: string;
  benefits?: string[];
  steps?: string[];
  tags?: string[];
  raw?: any;
}

interface CommunityLinkedItemModalProps {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  item: CommunityLinkedItemView | null;
  addLoading?: boolean;
  completeLoading?: boolean;
  onClose: () => void;
  onAdd: () => void;
  onComplete: () => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          color: "#8b7b67",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function CommunityLinkedItemModal({
  open,
  loading = false,
  error = null,
  item,
  addLoading = false,
  completeLoading = false,
  onClose,
  onAdd,
  onComplete,
}: CommunityLinkedItemModalProps) {
  if (!open) return null;

  return (
    <>
      <button
        onClick={onClose}
        aria-label="Close linked item modal"
        style={{
          position: "fixed",
          inset: 0,
          border: "none",
          padding: 0,
          margin: 0,
          background: "rgba(0,0,0,0.42)",
          zIndex: 70,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 71,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            maxHeight: "88vh",
            overflowY: "auto",
            background: "#fffdf8",
            borderRadius: 22,
            boxShadow: "0 22px 44px rgba(0,0,0,0.2)",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: "#a27e2c",
                textTransform: "uppercase",
              }}
            >
              {item?.type || "linked item"}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#5c5248",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div
              style={{
                padding: "28px 8px 20px",
                textAlign: "center",
                color: "#7b6f62",
                fontSize: 14,
              }}
            >
              Loading linked item...
            </div>
          ) : error ? (
            <div
              style={{
                padding: "20px 8px 8px",
                color: "#9f3a2f",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          ) : item ? (
            <>
              <div
                style={{
                  border: "1.5px solid #d9a32d",
                  background: "#fff9ec",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#24160b",
                    lineHeight: 1.2,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {item.title}
                </div>
                {item.subtitle && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 15,
                      color: "#594535",
                      lineHeight: 1.45,
                    }}
                  >
                    {item.subtitle}
                  </div>
                )}
                {item.devanagari && (
                  <Section title="Devanagari">
                    <div
                      style={{
                        fontSize: 28,
                        color: "#23170b",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.devanagari}
                    </div>
                  </Section>
                )}
                {item.iast && (
                  <Section title="IAST">
                    <div style={{ fontSize: 14, color: "#43352b" }}>
                      {item.iast}
                    </div>
                  </Section>
                )}
                {item.meaning && (
                  <Section title="Meaning">
                    <div style={{ fontSize: 14, color: "#43352b", lineHeight: 1.6 }}>
                      {item.meaning}
                    </div>
                  </Section>
                )}
                {item.essence && (
                  <Section title="Essence">
                    <div style={{ fontSize: 14, color: "#43352b", lineHeight: 1.6 }}>
                      {item.essence}
                    </div>
                  </Section>
                )}
                {item.insight && (
                  <Section title="Insight">
                    <div style={{ fontSize: 14, color: "#43352b", lineHeight: 1.6 }}>
                      {item.insight}
                    </div>
                  </Section>
                )}
                {item.source && (
                  <Section title="Source">
                    <div style={{ fontSize: 14, color: "#43352b", lineHeight: 1.6 }}>
                      {item.source}
                    </div>
                  </Section>
                )}
                {item.suggestedPractice && (
                  <Section title="Suggested Practice">
                    <div style={{ fontSize: 14, color: "#43352b", lineHeight: 1.6 }}>
                      {item.suggestedPractice}
                    </div>
                  </Section>
                )}
                {item.duration && (
                  <Section title="Duration">
                    <div style={{ fontSize: 14, color: "#43352b" }}>
                      {item.duration}
                    </div>
                  </Section>
                )}
                {item.benefits && item.benefits.length > 0 && (
                  <Section title="Benefits">
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        color: "#43352b",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.benefits.map((benefit, index) => (
                        <li key={`${benefit}-${index}`}>{benefit}</li>
                      ))}
                    </ul>
                  </Section>
                )}
                {item.steps && item.steps.length > 0 && (
                  <Section title="Steps">
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        color: "#43352b",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.steps.map((step, index) => (
                        <li key={`${step}-${index}`}>{step}</li>
                      ))}
                    </ol>
                  </Section>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 14,
                    }}
                  >
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          borderRadius: 999,
                          background: "#f6ecd7",
                          color: "#7e6327",
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "5px 9px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <button
                  onClick={onAdd}
                  disabled={addLoading || completeLoading}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    border: "1px solid #d6b15c",
                    background: "#fff",
                    color: "#7e6327",
                    fontSize: 14,
                    fontWeight: 700,
                    padding: "12px 14px",
                    cursor:
                      addLoading || completeLoading ? "not-allowed" : "pointer",
                    opacity: addLoading || completeLoading ? 0.65 : 1,
                  }}
                >
                  {addLoading ? "Adding..." : "Add to My Practice"}
                </button>
                <button
                  onClick={onComplete}
                  disabled={addLoading || completeLoading}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    border: "none",
                    background: "#d6a23a",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    padding: "12px 14px",
                    cursor:
                      addLoading || completeLoading ? "not-allowed" : "pointer",
                    opacity: addLoading || completeLoading ? 0.65 : 1,
                  }}
                >
                  {completeLoading ? "Saving..." : "Do it today"}
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: "24px 8px 8px",
                textAlign: "center",
                color: "#7b6f62",
                fontSize: 14,
              }}
            >
              No linked item data available.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
