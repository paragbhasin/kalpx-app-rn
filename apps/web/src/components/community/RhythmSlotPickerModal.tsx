import {
  RHYTHM_BAND_LABELS,
  RHYTHM_BAND_LABELS_HI,
  RHYTHM_BAND_LABELS_TE,
} from "@kalpx/contracts";
import type { RhythmTimeBand } from "@kalpx/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMitraHomeV3,
  postRhythmItemAdd,
  postRhythmSetup,
} from "../../engine/mitraApi";
import { useTranslation } from "../../lib/i18n";
import { store } from "../../store";
import { setHomeData } from "../../store/doorSlice";
import { ModalSheet } from "../ui/ModalSheet";

export interface RhythmOffer {
  item_id: string;
  item_type: "mantra" | "sankalp" | "practice";
  title: string;
  description: string | null;
}

interface Props {
  /** When set, the sheet is shown for this practice. Null hides it. */
  offer: RhythmOffer | null;
  onClose: () => void;
}

const SLOTS: RhythmTimeBand[] = ["morning", "afternoon", "night"];
const GOLD = "#CC9933";

/**
 * Bottom-sheet offered when the user tries to repeat a community practice they
 * have already completed once. Mirrors
 * apps/mobile/src/components/RhythmSlotPickerModal.tsx.
 *
 * - Already in the Daily Rhythm → tells them and offers a button to open it.
 * - Otherwise → lets them add it to a slot (morning / afternoon / night).
 *   Creates the rhythm via /rhythm/setup/ if the user has none yet.
 */
export function RhythmSlotPickerModal({ offer, onClose }: Props) {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();

  const bandLabel = (slot: RhythmTimeBand) =>
    (locale === "hi"
      ? RHYTHM_BAND_LABELS_HI
      : locale === "te"
        ? RHYTHM_BAND_LABELS_TE
        : RHYTHM_BAND_LABELS)[slot];

  const [adding, setAdding] = useState(false);
  const [addedSlot, setAddedSlot] = useState<RhythmTimeBand | null>(null);
  const [checking, setChecking] = useState(false);
  const [existingSlot, setExistingSlot] = useState<RhythmTimeBand | null>(null);

  const findExistingSlot = (rhythm: any): RhythmTimeBand | null => {
    if (!rhythm?.has_rhythm || !offer) return null;
    for (const slot of SLOTS) {
      const items = rhythm?.[slot]?.items ?? [];
      if (items.some((i: any) => i.item_id === offer.item_id)) return slot;
    }
    return null;
  };

  // On open: check whether this practice is already in the user's rhythm.
  useEffect(() => {
    if (!offer) {
      setAdding(false);
      setAddedSlot(null);
      setChecking(false);
      setExistingSlot(null);
      return;
    }
    let active = true;
    (async () => {
      setChecking(true);
      try {
        const home = await getMitraHomeV3({ forceFresh: true });
        if (!active) return;
        store.dispatch(setHomeData(home));
        setExistingSlot(findExistingSlot((home as any)?.companion_rhythm));
      } catch {
        // ignore — fall back to the slot picker
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer]);

  const handleClose = () => {
    setAddedSlot(null);
    setAdding(false);
    setChecking(false);
    setExistingSlot(null);
    onClose();
  };

  const goToRhythm = () => {
    handleClose();
    navigate("/en/mitra/rhythm");
  };

  const handlePickSlot = async (slot: RhythmTimeBand) => {
    if (!offer || adding) return;
    setAdding(true);
    try {
      // Refresh + dedupe.
      const home = await getMitraHomeV3({ forceFresh: true });
      store.dispatch(setHomeData(home));
      const rhythm = (home as any)?.companion_rhythm;

      const existing = findExistingSlot(rhythm);
      if (existing) {
        setExistingSlot(existing);
        return;
      }

      if (rhythm?.has_rhythm) {
        // Rhythm exists → add this item to the chosen slot.
        const slotItems = rhythm?.[slot]?.items ?? [];
        await postRhythmItemAdd({
          slot,
          item_type: offer.item_type as any,
          item_id: offer.item_id,
          title_snapshot: offer.title,
          description_snapshot: offer.description,
          source: "user_chosen" as any,
          sort_order: slotItems.length + 1,
          reminder_enabled: false,
          reminder_time: null,
        });
      } else {
        // No rhythm yet → create one seeded with this single item.
        await postRhythmSetup({
          items: [
            {
              slot,
              item_type: offer.item_type as any,
              item_id: offer.item_id,
              title_snapshot: offer.title,
              description_snapshot: offer.description,
              source: "user_chosen" as any,
              sort_order: 1,
              reminder_enabled: false,
              reminder_time: null,
            },
          ],
        });
      }
      const fresh = await getMitraHomeV3({ forceFresh: true });
      store.dispatch(setHomeData(fresh));
      setAddedSlot(slot);
    } catch (e: any) {
      console.warn("[RhythmSlotPickerModal] add failed", e?.message);
      handleClose();
    } finally {
      setAdding(false);
    }
  };

  const renderBody = () => {
    if (checking) {
      return (
        <div style={{ padding: "24px 0", textAlign: "center", color: GOLD }}>
          …
        </div>
      );
    }

    if (existingSlot && !addedSlot) {
      return (
        <div style={styles.center}>
          <div style={styles.checkCircle}>✓</div>
          <p style={styles.title}>{t("communityRhythm.alreadyTitle")}</p>
          {offer?.title && <p style={styles.practiceName}>{offer.title}</p>}
          <p style={styles.subtitle}>
            {t("communityRhythm.alreadySubtitle").replace(
              "{slot}",
              bandLabel(existingSlot),
            )}
          </p>
          <button style={styles.primaryBtn} onClick={goToRhythm}>
            {t("communityRhythm.goToRhythm")}
          </button>
        </div>
      );
    }

    if (addedSlot) {
      return (
        <div style={styles.center}>
          <div style={styles.checkCircle}>✓</div>
          <p style={styles.title}>{t("communityRhythm.addedTitle")}</p>
          {offer?.title && <p style={styles.practiceName}>{offer.title}</p>}
          <p style={styles.subtitle}>
            {t("communityRhythm.addedSubtitle").replace(
              "{slot}",
              bandLabel(addedSlot),
            )}
          </p>
          <button style={styles.primaryBtn} onClick={goToRhythm}>
            {t("communityRhythm.goToRhythm")}
          </button>
          <button style={styles.dismiss} onClick={handleClose}>
            {t("communityRhythm.done")}
          </button>
        </div>
      );
    }

    return (
      <div style={styles.center}>
        <p style={styles.title}>{t("communityRhythm.offerTitle")}</p>
        {offer?.title && <p style={styles.practiceName}>{offer.title}</p>}
        <p style={styles.subtitle}>{t("communityRhythm.offerSubtitle")}</p>
        <div style={styles.slotRow}>
          {SLOTS.map((slot) => (
            <button
              key={slot}
              style={styles.slotBtn}
              disabled={adding}
              onClick={() => handlePickSlot(slot)}
            >
              <span style={{ fontSize: 22 }}>
                {slot === "morning" ? "🌅" : slot === "afternoon" ? "☀️" : "🌙"}
              </span>
              <span style={styles.slotText}>{bandLabel(slot)}</span>
            </button>
          ))}
        </div>
        {adding && (
          <div style={{ marginTop: 12, color: GOLD, textAlign: "center" }}>…</div>
        )}
        <button style={styles.dismiss} disabled={adding} onClick={handleClose}>
          {t("communityRhythm.notNow")}
        </button>
      </div>
    );
  };

  return (
    <ModalSheet isOpen={!!offer} onClose={handleClose}>
      {renderBody()}
    </ModalSheet>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1c1c1c",
    margin: "0 0 8px",
  },
  practiceName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#CC9933",
    margin: "6px 8px 0",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.5,
    margin: "0 8px 4px",
  },
  slotRow: {
    display: "flex",
    width: "100%",
    gap: 10,
    marginTop: 20,
  },
  slotBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBlock: 16,
    borderRadius: 14,
    border: `1px solid ${GOLD}`,
    background: "#FFFCF0",
    cursor: "pointer",
  },
  slotText: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1c1c1c",
  },
  dismiss: {
    marginTop: 18,
    padding: "8px 0",
    background: "none",
    border: "none",
    fontSize: 14,
    color: "#999",
    fontWeight: 500,
    cursor: "pointer",
  },
  primaryBtn: {
    marginTop: 22,
    background: GOLD,
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "12px 48px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    background: "#4CAF50",
    color: "#fff",
    fontSize: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
};
