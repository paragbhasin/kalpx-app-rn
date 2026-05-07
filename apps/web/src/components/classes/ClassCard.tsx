import type { ClassListing } from "@kalpx/types";
import { useNavigate } from "react-router-dom";
import { WEB_ENV } from "../../lib/env";

interface ClassCardProps {
  cls: ClassListing | null | undefined;
}

export function ClassCard({ cls }: ClassCardProps) {
  const navigate = useNavigate();
  if (!cls) return null;
  const subtitle =
    ((cls as any).subtitle as string | undefined) ?? cls.description ?? "";
  const coverUrl = cls.cover_media?.url
    ? cls.cover_media.url
    : cls.cover_media?.key
      ? `${WEB_ENV.imageBaseUrl}/${cls.cover_media.key}`
      : null;
  const duration =
    (cls.pricing?.type === "per_group"
      ? (cls.pricing?.per_group as any)?.session_length_min
      : (cls.pricing?.per_person as any)?.session_length_min) ??
    cls.duration_minutes;
  const price =
    (cls.pricing?.type === "per_group"
      ? cls.pricing?.per_group?.amount?.web
      : cls.pricing?.per_person?.amount?.web) ??
    cls.pricing?.per_person?.amount?.app;
  const currency = cls.pricing?.currency ?? "INR";
  const showTrial =
    cls.pricing?.trial?.enabled && cls.pricing.trial.amount != null;

  function formatMoney(amount: number) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  }

  const priceLabel =
    price != null
      ? `${formatMoney(price)} / ${cls.pricing?.type === "per_group" ? "group" : "person"}${duration ? ` · ${duration}m` : ""}`
      : "";

  return (
    <div
      onClick={() => navigate(`/en/classes/${cls.slug}`)}
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        background: "#fff",
        border: "1px solid #E1E1E1",
        borderRadius: 16,
        cursor: "pointer",
        marginBottom: 16,
        boxShadow: "0 4px 35px rgba(0, 0, 0, 0.15)",
        touchAction: "manipulation",
        transition: "transform 0.15s, box-shadow 0.15s",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 120,
          minWidth: 120,
          background: "#f5efe7",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${cls.title} cover`}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 160,
              objectFit: "cover",
              display: "block",
              padding: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              minHeight: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b7aa9a",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            No image
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              lineHeight: 1.25,
              color: "var(--kalpx-text)",
            }}
          >
            {cls.title}
          </div>
          {subtitle && (
            <div
              style={{
                marginTop: 4,
                fontSize: 14,
                lineHeight: 1.35,
                color: "#5f6670",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {subtitle}
            </div>
          )}
          {showTrial && (
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                fontWeight: 600,
                color: "#1B1EBB",
                lineHeight: 1.35,
              }}
            >
              Trial - {formatMoney(cls.pricing?.trial?.amount as number)} /{" "}
              {cls.pricing?.trial?.session_length_min ?? 0} Minutes
            </div>
          )}
          {priceLabel && (
            <div
              style={{
                marginTop: 8,
                fontSize: 17,
                fontWeight: 700,
                color: "var(--kalpx-cta)",
              }}
            >
              {priceLabel}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/en/classes/${cls.slug}`);
            }}
            style={{
              padding: "5px",

              color: "#000",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            View Details
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/en/classes/${cls.slug}/book`);
            }}
            style={{
              borderRadius: 8,
              padding: "5px",
              background: "var(--kalpx-cta)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 6px 16px rgba(200, 154, 71, 0.28)",
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
