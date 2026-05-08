import { ArrowLeft, Check } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui";

const reasons = [
  "Schedule or date conflict",
  "Health or personal reasons",
  "Unable to attend at this time",
  "The retreat dates no longer work for me.",
  "found an alternative retreat or program.",
  "My plans have changed and I’m unable to attend.",
  "Work or professional commitments have come up.",
  "Pricing or payment concern",
  "Other",
];

export function RetreatCancellationPage() {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState(
    "Schedule or date conflict",
  );
  const [otherReason, setOtherReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 640;

  function handleCancel() {
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  }

  return (
    <AppShell>
      <div style={pageStyle}>
        <header style={headerStyle}>
          <div style={headerInnerStyle}>
            <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
              <ArrowLeft size={18} color="#000" />
            </button>
            <h1 style={headerTitleStyle}>Cancellation</h1>
          </div>
        </header>

        <main style={mainStyle}>
          <h1 style={pageTitleStyle}>Why you want to cancel the booking?</h1>

          <div style={reasonsWrapStyle}>
            {reasons.map((reason) => {
              const selected = selectedReason === reason;
              return (
                <label key={reason} style={reasonLabelStyle}>
                  <div style={radioWrapStyle}>
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selected}
                      onChange={() => setSelectedReason(reason)}
                      style={radioInputStyle}
                    />
                    <div
                      style={{
                        ...radioDotStyle,
                        transform: selected ? "scale(1)" : "scale(0)",
                      }}
                    />
                  </div>
                  <span style={reasonTextStyle}>{reason}</span>
                </label>
              );
            })}
          </div>

          <div style={textAreaWrapStyle}>
            <h2 style={textAreaHeadingStyle}>
              Write Reason for cancellation if selected other
            </h2>
            <textarea
              value={otherReason}
              onChange={(event) => setOtherReason(event.target.value)}
              placeholder="Type here..."
              style={textAreaStyle}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedReason}
            style={{
              ...cancelActionStyle,
              opacity: selectedReason ? 1 : 0.5,
              cursor: selectedReason ? "pointer" : "not-allowed",
            }}
          >
            Cancel Booking
          </button>
        </main>

        {showConfirmModal ? (
          <div
            style={{
              ...modalRootStyle,
              alignItems: isDesktop ? "center" : "flex-end",
              padding: isDesktop ? 24 : 0,
            }}
          >
            <div
              style={modalBackdropStyle}
              onClick={() => setShowConfirmModal(false)}
            />
            <div
              style={{
                ...confirmModalCardStyle,
                borderTopLeftRadius: isDesktop ? 32 : 32,
                borderTopRightRadius: isDesktop ? 32 : 32,
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
                maxWidth: 448,
              }}
            >
              <div style={confirmContentStyle}>
                <h3 style={confirmTitleStyle}>
                  Are sure you want to cancel the booking?
                </h3>
                <p style={confirmBodyStyle}>
                  90% refund will be credited to your account in 20 days
                </p>
              </div>

              <div style={confirmActionsStyle}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  style={noCancelButtonStyle}
                >
                  No, Don’t Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={yesCancelButtonStyle}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showSuccessModal ? (
          <div style={{ ...modalRootStyle, alignItems: "center", padding: 24 }}>
            <div style={successBackdropStyle} />
            <div style={successCardStyle}>
              <div style={successIconWrapStyle}>
                <Check size={30} color="#fff" style={{ transform: "rotate(-45deg)" }} />
              </div>

              <div style={successTextWrapStyle}>
                <h3 style={successTitleStyle}>Booking Cancelled Succesfully</h3>
                <p style={successBodyStyle}>
                  90% refund will be credited to your account in 20 days
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/en/retreats?tab=bookings")}
                style={successButtonStyle}
              >
                Ok
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
};

const headerStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #f3f4f6",
};

const headerInnerStyle: CSSProperties = {
  maxWidth: 672,
  margin: "0 auto",
  padding: "0 16px",
  height: 64,
  display: "flex",
  alignItems: "center",
  gap: 16,
  boxSizing: "border-box",
};

const backButtonStyle: CSSProperties = {
  display: "flex",
  height: 40,
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const headerTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const mainStyle: CSSProperties = {
  padding: 24,
  maxWidth: 672,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: 32,
  paddingBottom: 40,
  boxSizing: "border-box",
};

const pageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const reasonsWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const reasonLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  cursor: "pointer",
};

const radioWrapStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const radioInputStyle: CSSProperties = {
  appearance: "none",
  width: 24,
  height: 24,
  border: "2px solid #D4A017",
  borderRadius: "50%",
  background: "#fff",
  margin: 0,
  cursor: "pointer",
};

const radioDotStyle: CSSProperties = {
  position: "absolute",
  width: 12,
  height: 12,
  background: "#D4A017",
  borderRadius: "50%",
  transition: "transform 0.2s ease",
  pointerEvents: "none",
};

const reasonTextStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  color: "#000",
};

const textAreaWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const textAreaHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
};

const textAreaStyle: CSSProperties = {
  width: "100%",
  height: 128,
  padding: 16,
  borderRadius: 12,
  border: "1px solid #f3f4f6",
  background: "#FBFBFB",
  outline: "none",
  fontSize: 14,
  resize: "none",
  boxSizing: "border-box",
};

const cancelActionStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid #707070",
  color: "#707070",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 16,
  background: "#fff",
};

const modalRootStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  display: "flex",
  justifyContent: "center",
};

const modalBackdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(2px)",
};

const confirmModalCardStyle: CSSProperties = {
  background: "#fff",
  padding: 32,
  width: "100%",
  position: "relative",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const confirmContentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const confirmTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.3,
};

const confirmBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 500,
  color: "#707070",
  lineHeight: 1.6,
};

const confirmActionsStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  paddingTop: 8,
};

const noCancelButtonStyle: CSSProperties = {
  flex: 1.2,
  padding: "16px 16px",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  border: "none",
  cursor: "pointer",
};

const yesCancelButtonStyle: CSSProperties = {
  flex: 1,
  padding: "16px 16px",
  background: "#fff",
  color: "#D4A017",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  border: "1px solid #D4A017",
  cursor: "pointer",
};

const successBackdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
};

const successCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 32,
  padding: 40,
  width: "100%",
  maxWidth: 384,
  position: "relative",
  zIndex: 10,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const successIconWrapStyle: CSSProperties = {
  width: 80,
  height: 80,
  background: "#D4A017",
  borderRadius: 24,
  transform: "rotate(45deg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  boxShadow: "0 18px 30px rgba(212,160,23,0.3)",
};

const successTextWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const successTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: "#000",
};

const successBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 500,
  color: "#707070",
  lineHeight: 1.6,
};

const successButtonStyle: CSSProperties = {
  width: "100%",
  padding: "16px 16px",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 16,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  border: "none",
  cursor: "pointer",
};
