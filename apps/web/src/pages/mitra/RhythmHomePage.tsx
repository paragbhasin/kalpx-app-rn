import type { RhythmItem, RhythmSlot, RhythmTimeBand } from "@kalpx/types";
import { Clock3, Pencil, Sparkles } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { RhythmLibraryPickerModal } from "../../components/mitra/RhythmLibraryPickerModal";
import { executeAction } from "../../engine/actionExecutor";
import {
  getMitraHomeV3,
  postRhythmItemAdd,
  postRhythmResolveItem,
} from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";
import { useScreenState } from "../../store/screenSlice";
import { useTranslation } from "../../lib/i18n";

function actionLabel(itemType: string): string {
  if (itemType === "mantra") return "Chant";
  if (itemType === "sankalp") return "Embody";
  return "Practice";
}

function beginLabel(itemType: string, t: (key: string) => string): string {
  if (itemType === "mantra") return t("mitra.rhythmHome.beginChanting");
  if (itemType === "sankalp") return t("mitra.rhythmHome.beginEmbodying");
  return t("mitra.rhythmHome.beginPractice");
}

function cardLabel(itemType: string): string {
  if (itemType === "mantra") return "MANTRA";
  if (itemType === "sankalp") return "SANKALP";
  if (itemType === "reflection") return "REFLECTION";
  return "PRACTICE";
}

function formatReminderTime(hms: string): string {
  const [h, m] = hms.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function itemDuration(item: RhythmItem): string | null {
  const rawDuration = (item as any).duration_minutes;
  if (typeof rawDuration === "number" && Number.isFinite(rawDuration)) {
    return `${rawDuration} min`;
  }
  return null;
}

function heldLabel(itemType: string, t: (key: string) => string): string {
  if (itemType === "mantra") return t("mitra.rhythmHome.heldMantra");
  if (itemType === "sankalp") return t("mitra.rhythmHome.heldSankalp");
  if (itemType === "practice") return t("mitra.rhythmHome.heldPractice");
  if (itemType === "reflection") return t("mitra.rhythmHome.heldReflection");
  return "Held today · return anytime";
}

function slotHeldLabel(band: RhythmTimeBand, t: (key: string) => string): string {
  if (band === "morning") return t("mitra.rhythmHome.morningHeld");
  if (band === "afternoon") return t("mitra.rhythmHome.afternoonHeld");
  return t("mitra.rhythmHome.nightHeld");
}

function RhythmItemCard({
  item,
  onAction,
  resolving,
  t,
}: {
  item: RhythmItem;
  onAction: () => void;
  resolving?: boolean;
  t: (key: string) => string;
}) {
  return (
    <div
      className="rhythm-item-card"
      style={{
        border: "1px solid rgba(201,168,76,0.35)",
        borderRadius: 28,
        background: "rgba(255,252,247,0.9)",
        padding: "15px",
        marginBottom: 18,
        boxShadow: "0 18px 48px rgba(201,168,76,0.08)",
      }}
    >
      <div
        className="rhythm-item-card-meta"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: "#A97C14",
            textTransform: "uppercase",
            background: "#F6EED8",
            borderRadius: 5,
            padding: "5px",
            display: "inline-block",
          }}
        >
          {cardLabel(item.item_type)}
        </span>
        {itemDuration(item) && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#8B6A43",
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            <Clock3 size={20} strokeWidth={1.8} />
            {itemDuration(item)}
          </span>
        )}
      </div>
      <p
        className="rhythm-item-card-title"
        style={{
          fontFamily: "var(--kalpx-font-serif)",
          fontSize: 18,
          fontWeight: "700",
          color: "#432104",
          margin: "0 0 24px",
          textAlign: "center",
        }}
      >
        {item.title_snapshot || ""}
      </p>
      <div
        className="rhythm-item-card-divider"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          marginBottom: 22,
          color: "#D2A63D",
        }}
      >
        <div
          style={{
            width: 86,
            height: 1,
            background: "rgba(210,166,61,0.45)",
          }}
        />
        <span
          className="rhythm-item-card-divider-lotus"
          style={{ fontSize: 28, lineHeight: 1 }}
        >
          <img src="/lotus_icon.png" alt="" height={20} width={20} />
        </span>
        <div
          style={{
            width: 86,
            height: 1,
            background: "rgba(210,166,61,0.45)",
          }}
        />
      </div>
      {item.reminder_enabled && item.reminder_time && (
        <p
          style={{
            fontSize: 12,
            marginTop: 0,
            marginBottom: 12,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          Mitra will gently remind you at{" "}
          {formatReminderTime(item.reminder_time)}
        </p>
      )}
      {item.description_snapshot && (
        <div
          className="rhythm-item-card-description"
          style={{ marginBottom: 28 }}
        >
          <p
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 16,
              textAlign: "center",
              color: "#7A6040",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {item.description_snapshot}
          </p>
        </div>
      )}
      {(item as any).completed_today === true && (
        <p
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 14,
            color: "#7A9E7E",
            textAlign: "center",
            margin: "0 0 14px",
            letterSpacing: "0.02em",
            fontWeight: 700,
          }}
        >
          {heldLabel(item.item_type, t)}
        </p>
      )}
      <div
        className="rhythm-item-card-action"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <button
          onClick={onAction}
          disabled={resolving}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 11,
            border: "none",
            background: resolving
              ? "rgba(201,147,23,0.45)"
              : "linear-gradient(90deg, #C99317 0%, #E0AE21 45%, #C99317 100%)",
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
            fontFamily: "var(--kalpx-font-serif)",
            cursor: resolving ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            boxShadow: "0 18px 40px rgba(201,147,23,0.24)",
            opacity: resolving ? 0.7 : 1,
          }}
        >
          <Sparkles size={22} strokeWidth={1.8} />
          {resolving ? t("mitra.rhythmHome.opening") : beginLabel(item.item_type, t)}
        </button>
      </div>
    </div>
  );
}

function BandSection({
  band,
  slot,
  onItemAction,
  resolvingItemId,
  onAddItem,
  slotDone,
  trailingAction,
  t,
}: {
  band: RhythmTimeBand;
  slot: RhythmSlot | null;
  onItemAction: (item: RhythmItem) => void;
  resolvingItemId?: string | null;
  onAddItem: (band: RhythmTimeBand) => void;
  slotDone?: boolean;
  trailingAction?: React.ReactNode;
  t: (key: string) => string;
}) {
  const hasItems = slot && slot.items.length > 0;
  if (!hasItems) return null;
  const slotHeld =
    slotDone === true ||
    ((slot?.items?.length ?? 0) > 0 &&
      slot!.items.every((item) => item.completed_today === true));
  return (
    <div className="rhythm-band-section" style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontFamily: "var(--kalpx-font-serif)",
            fontWeight: 700,
            fontSize: 16,
            color: "#432104",
          }}
        >
          {band === "morning"
            ? t("mitra.rhythmHome.morningPractice")
            : band === "afternoon"
              ? t("mitra.rhythmHome.afternoonPractice")
              : t("mitra.rhythmHome.nightPractice")}
        </div>
        {slotHeld && (
          <span
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 12,
              color: "#7A9E7E",
              letterSpacing: 0.4,
            }}
          >
            {slotHeldLabel(band, t)}
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
          color: "#D2A63D",
        }}
      >
        <div
          style={{ width: 35, height: 1, background: "rgba(210,166,61,0.45)" }}
        />
        <span style={{ fontSize: 14, lineHeight: 1 }}>◇</span>
        <div
          style={{ width: 35, height: 1, background: "rgba(210,166,61,0.45)" }}
        />
      </div>
      {slot.items.map((item) => (
        <RhythmItemCard
          key={item.rhythm_item_id}
          item={item}
          onAction={() => onItemAction(item)}
          resolving={resolvingItemId === item.item_id}
          t={t}
        />
      ))}
      <div className="rhythm-band-actions">
        <button
          className="rhythm-band-add-button"
          onClick={() => onAddItem(band)}
          style={{
            background: "transparent",
            border: "1px dashed  #d4a017",
            borderRadius: 11,

            fontSize: 16,
            fontFamily: "var(--kalpx-font-serif)",
            padding: "10px 18px",
            cursor: "pointer",
            marginTop: 8,
            width: "100%",
          }}
        >
          {band === "morning"
            ? t("mitra.rhythmHome.addMorning")
            : band === "afternoon"
              ? t("mitra.rhythmHome.addAfternoon")
              : t("mitra.rhythmHome.addNight")}
        </button>
        {trailingAction}
      </div>
    </div>
  );
}

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(250,245,240,0.95)",
  border: "1px solid rgba(201,168,76,0.25)",
  borderRadius: 24,
  padding: "32px 20px",
  textAlign: "center",
};

export function RhythmHomePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const homeData = useSelector((s: RootState) => s.door.homeData);
  const screenState = useScreenState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingItemId, setResolvingItemId] = useState<string | null>(null);
  const [homePickerBand, setHomePickerBand] = useState<RhythmTimeBand | null>(
    null,
  );

  // Always fetch on mount — getMitraHomeV3's locale-keyed cache returns instantly
  // for same locale (no API call), but makes a fresh fetch if locale changed since last visit.
  useEffect(() => {
    setLoading(true);
    void getMitraHomeV3()
      .then((d) => { if (d) dispatch(setHomeData(d)); })
      .catch(() => setError("Could not load your rhythm."))
      .finally(() => setLoading(false));
  }, [dispatch]);

  // Re-fetch with new locale so item title_snapshots update when language changes
  useEffect(() => {
    function onLocaleChange() {
      getMitraHomeV3({ forceFresh: true })
        .then((d) => { if (d) dispatch(setHomeData(d)); })
        .catch(() => {});
    }
    window.addEventListener('kalpx:locale-changed', onLocaleChange);
    return () => window.removeEventListener('kalpx:locale-changed', onLocaleChange);
  }, [dispatch]);

  const rhythm = homeData?.companion_rhythm;
  const visibleRhythmBands = rhythm
    ? ([
        {
          band: "morning" as const,
          slot: rhythm.morning,
          done: (rhythm as any).morning_done === true,
        },
        {
          band: "afternoon" as const,
          slot: rhythm.afternoon,
          done: (rhythm as any).afternoon_done === true,
        },
        {
          band: "night" as const,
          slot: rhythm.night,
          done: (rhythm as any).night_done === true,
        },
      ].filter(({ slot }) => slot && slot.items.length > 0) as Array<{
        band: RhythmTimeBand;
        slot: RhythmSlot;
        done: boolean;
      }>)
    : [];

  const editRhythmButton = (
    <button
      className="rhythm-edit-button"
      onClick={() => navigate("/en/mitra/rhythm/edit")}
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: 11,
        border: "1px solid rgba(201,168,76,0.55)",
        background: "rgba(255,252,247,0.6)",
        color: "#7B6550",
        fontSize: 16,
        fontFamily: "var(--kalpx-font-sans, Inter, sans-serif)",
        cursor: "pointer",
        marginTop: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <Pencil size={24} strokeWidth={1.8} color="#C99317" />
      {t("mitra.rhythmHome.editCta")}
    </button>
  );

  const handleHomePickerAdd = useCallback(
    async (picked: {
      slot: RhythmTimeBand;
      item_type: any;
      item_id: string;
      title_snapshot: string;
      description_snapshot: string | null;
      source: any;
      sort_order: number;
      reminder_enabled: boolean;
    }) => {
      const slot = homePickerBand!;
      const slotItems = homeData?.companion_rhythm?.[slot]?.items ?? [];
      const alreadyInSlot = slotItems.some((i) => i.item_id === picked.item_id);
      if (alreadyInSlot) {
        setHomePickerBand(null);
        return;
      }
      setHomePickerBand(null);
      try {
        await postRhythmItemAdd({
          ...picked,
          slot,
          sort_order: slotItems.length + 1,
        });
        const fresh = await getMitraHomeV3({ forceFresh: true });
        dispatch(setHomeData(fresh));
      } catch (err: any) {
        console.warn("[RhythmHome] addItem failed", err?.message);
      }
    },
    [homePickerBand, homeData, dispatch],
  );

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: "rhythm_daily",
  };

  async function handleItemAction(item: RhythmItem, band: RhythmTimeBand) {
    if (resolvingItemId) return;
    setResolvingItemId(item.item_id);
    let enrichedItem: Record<string, unknown> = {
      item_id: item.item_id,
      title_snapshot: item.title_snapshot,
      description_snapshot: item.description_snapshot ?? "",
      item_type: item.item_type,
    };
    try {
      const resolved = await postRhythmResolveItem(
        band,
        item.item_id,
        item.item_type,
      );
      if (resolved?.resolved) {
        enrichedItem = {
          ...enrichedItem,
          ...resolved,
          title_snapshot:
            item.title_snapshot ||
            resolved.title ||
            resolved.title_snapshot ||
            "",
          description_snapshot:
            item.description_snapshot ||
            resolved.description_snapshot ||
            resolved.subtitle ||
            "",
        };
      }
    } catch (_) {
      // fall through with snapshot item
    } finally {
      setResolvingItemId(null);
    }
    void executeAction(
      {
        type: "start_runner",
        payload: {
          source: "rhythm_daily",
          variant: item.item_type,
          rhythm_slot: band,
          item: enrichedItem,
        },
      },
      actionContext,
    );
  }

  return (
    <>
      <MitraMobileShell backgroundImage="/beige_bg.png">
        <main
          className="rhythm-home-main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 16px calc(92px + env(safe-area-inset-bottom))",
          }}
        >
          <div
            className="rhythm-home-content"
            style={{ width: "100%", maxWidth: 420, position: "relative" }}
          >
            <img
              src="/leaves-bird.png"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -135,
                right: -22,
                width: 245,
                pointerEvents: "none",
                userSelect: "none",
                opacity: 0.5,
              }}
            />
            <h2
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontWeight: 700,
                fontSize: 34,
                color: "#432104",
                // margin: "0 0 24px",
              }}
            >
              {t("mitra.rhythmHome.title")}
            </h2>

            {loading && (
              <p style={{ color: "#A08060", textAlign: "center" }}>{t("mitra.common.loading")}</p>
            )}
            {error && (
              <p style={{ color: "#e06060", textAlign: "center" }}>{error}</p>
            )}

            {!loading && rhythm && !rhythm.has_rhythm && (
              <div style={CARD_STYLE}>
                <p
                  style={{
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 17,
                    color: "#432104",
                    marginBottom: 20,
                  }}
                >
                  {t("mitra.rhythmHome.empty")}
                </p>
                <button
                  onClick={() => navigate("/en/mitra/rhythm/setup")}
                  style={{
                    padding: "14px 28px",
                    borderRadius: 14,
                    border: "none",
                    background:
                      "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
                    color: "#fff",
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t("mitra.rhythmHome.setupCta")}
                </button>
              </div>
            )}

            {!loading && rhythm && rhythm.has_rhythm && (
              <>
                {visibleRhythmBands.map(({ band, slot, done }, index) => (
                  <BandSection
                    key={band}
                    band={band}
                    slot={slot}
                    slotDone={done}
                    onItemAction={(item) => void handleItemAction(item, band)}
                    resolvingItemId={resolvingItemId}
                    onAddItem={setHomePickerBand}
                    trailingAction={
                      index === visibleRhythmBands.length - 1
                        ? editRhythmButton
                        : undefined
                    }
                    t={t}
                  />
                ))}
                {visibleRhythmBands.length === 0 && editRhythmButton}
              </>
            )}
          </div>
        </main>
      </MitraMobileShell>
      {homePickerBand && (
        <RhythmLibraryPickerModal
          band={homePickerBand}
          onPick={(picked) => void handleHomePickerAdd(picked)}
          onClose={() => setHomePickerBand(null)}
          nextSortOrder={
            (homeData?.companion_rhythm?.[homePickerBand]?.items?.length ?? 0) +
            1
          }
        />
      )}
    </>
  );
}
