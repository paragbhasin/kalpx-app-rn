import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../lib/i18n";

interface CommunityReportModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void> | void;
}

export function CommunityReportModal({
  open,
  title,
  onClose,
  onSubmit,
}: CommunityReportModalProps) {
  const { t } = useTranslation();
  const reportTitle = title ?? t('communityReportModal.reportPost');

  const REPORT_REASONS = [
    { label: t('communityReportModal.reasonSpam'), value: "spam" },
    { label: t('communityReportModal.reasonInappropriate'), value: "inappropriate" },
    { label: t('communityReportModal.reasonHarassment'), value: "harassment" },
    { label: t('communityReportModal.reasonOther'), value: "other" },
  ];

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedReason(null);
      setDetails("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedReason || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(
        selectedReason,
        details,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        aria-label="Close report modal"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          border: "none",
          padding: 0,
          margin: 0,
          zIndex: 70,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 71,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 430,
            maxHeight: "80vh",
            overflowY: "auto",
            background: "#fff",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 15,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#333",
              }}
            >
              {reportTitle}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: 4,
                color: "#666",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          <p
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 1.45,
              margin: "0 0 20px",
            }}
          >
            {t('communityReportModal.reasonHelperText')}
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            {REPORT_REASONS.map((reason) => {
              const selected = selectedReason === reason.value;
              return (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(reason.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 15,
                    borderRadius: 12,
                    border: `1px solid ${selected ? "#D69E2E" : "#eee"}`,
                    background: selected ? "#FFF8EF" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid #ccc",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {selected && (
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#D69E2E",
                          display: "block",
                        }}
                      />
                    )}
                  </span>
                  <span style={{ fontSize: 16, color: "#333" }}>
                    {reason.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 15 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#333",
                marginBottom: 10,
              }}
            >
              {t('communityReportModal.additionalDetails')}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('communityReportModal.detailsPlaceholder')}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                minHeight: 100,
                resize: "vertical",
                fontFamily: "inherit",
                fontSize: 14,
                color: "#333",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
            }}
          >
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff",
                color: "#333",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t('communityReportModal.cancel')}
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={!selectedReason || submitting}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 10,
                border: "none",
                background: selectedReason ? "#E6B05B" : "#eee",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: !selectedReason || submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? t('communityReportModal.submitting') : t('communityReportModal.submitReport')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
