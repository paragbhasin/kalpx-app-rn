import { RHYTHM_BAND_LABELS, RHYTHM_BAND_LABELS_HI } from "@kalpx/contracts";
import type { RhythmTimeBand } from "@kalpx/types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import {
  mitraJourneyHomeV3,
  postRhythmItemAdd,
  postRhythmSetup,
} from "../engine/mitraApi";
import { setHomeData } from "../store/doorSlice";

export interface RhythmOffer {
  item_id: string;
  item_type: "mantra" | "sankalp" | "practice";
  title: string;
  description: string | null;
}

interface Props {
  /** When set, the modal is shown for this practice. Null hides it. */
  offer: RhythmOffer | null;
  onClose: () => void;
}

const SLOTS: RhythmTimeBand[] = ["morning", "afternoon", "night"];

/**
 * Bottom-sheet offered when the user tries to repeat a community practice they
 * have already completed once.
 *
 * - If the practice is already in their Daily Rhythm → tells them and offers a
 *   button to open the rhythm.
 * - Otherwise → lets them add it to a slot (morning / afternoon / night).
 */
const RhythmSlotPickerModal: React.FC<Props> = ({ offer, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigation: any = useNavigation();
  const dispatch: any = useDispatch();

  const [adding, setAdding] = useState(false);
  const [addedSlot, setAddedSlot] = useState<RhythmTimeBand | null>(null);
  const [checking, setChecking] = useState(false);
  const [existingSlot, setExistingSlot] = useState<RhythmTimeBand | null>(null);

  const bandLabel = (slot: RhythmTimeBand) =>
    (i18n.language?.startsWith("hi")
      ? RHYTHM_BAND_LABELS_HI
      : RHYTHM_BAND_LABELS)[slot];

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
        const home = await mitraJourneyHomeV3({ forceFresh: true });
        if (!active) return;
        dispatch(setHomeData(home));
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
    navigation.navigate("RhythmHome");
  };

  const handlePickSlot = async (slot: RhythmTimeBand) => {
    if (!offer || adding) return;
    setAdding(true);
    try {
      // Refresh + dedupe. Adding an item creates the Daily Rhythm automatically
      // if the user doesn't have one yet — no setup wizard needed.
      const home = await mitraJourneyHomeV3({ forceFresh: true });
      dispatch(setHomeData(home));
      const rhythm = (home as any)?.companion_rhythm;

      // Already added in the meantime → show the "already there" state.
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
          source: "user_chosen",
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
              source: "user_chosen",
              sort_order: 1,
              reminder_enabled: false,
              reminder_time: null,
            },
          ],
        });
      }
      const fresh = await mitraJourneyHomeV3({ forceFresh: true });
      dispatch(setHomeData(fresh));
      setAddedSlot(slot);
    } catch (e: any) {
      console.warn("[RhythmSlotPickerModal] add failed", e?.message);
      handleClose();
    } finally {
      setAdding(false);
    }
  };

  const renderBody = () => {
    // 1. Checking whether it's already in the rhythm.
    if (checking) {
      return (
        <View style={{ paddingVertical: 24 }}>
          <ActivityIndicator color="#CC9933" />
        </View>
      );
    }

    // 2. Already part of the Daily Rhythm → just point them to it.
    if (existingSlot && !addedSlot) {
      return (
        <>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>
            {t("community.rhythm.alreadyTitle", {
              defaultValue: "Already in your Daily Rhythm",
            })}
          </Text>
          {!!offer?.title && (
            <Text style={styles.practiceName}>{offer.title}</Text>
          )}
          <Text style={styles.subtitle}>
            {t("community.rhythm.alreadySubtitle", {
              slot: bandLabel(existingSlot),
              defaultValue: `This is already part of your ${bandLabel(
                existingSlot,
              )} practice.`,
            })}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={goToRhythm}>
            <Text style={styles.primaryBtnText}>
              {t("community.rhythm.goToRhythm", {
                defaultValue: "Go to Daily Rhythm",
              })}
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    // 3. Just added → confirmation.
    if (addedSlot) {
      return (
        <>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>
            {t("community.rhythm.addedTitle", {
              defaultValue: "Added to your Daily Rhythm",
            })}
          </Text>
          {!!offer?.title && (
            <Text style={styles.practiceName}>{offer.title}</Text>
          )}
          <Text style={styles.subtitle}>
            {t("community.rhythm.addedSubtitle", {
              slot: bandLabel(addedSlot),
              defaultValue: `This will appear in your ${bandLabel(
                addedSlot,
              )} practice every day.`,
            })}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={goToRhythm}>
            <Text style={styles.primaryBtnText}>
              {t("community.rhythm.goToRhythm", {
                defaultValue: "Go to Daily Rhythm",
              })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismiss} onPress={handleClose}>
            <Text style={styles.dismissText}>
              {t("community.rhythm.done", { defaultValue: "Done" })}
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    // 4. Default → pick a slot.
    return (
      <>
        <Text style={styles.title}>
          {t("community.rhythm.offerTitle", {
            defaultValue: "Make this a daily practice?",
          })}
        </Text>
        {!!offer?.title && (
          <Text style={styles.practiceName}>{offer.title}</Text>
        )}
        <Text style={styles.subtitle}>
          {t("community.rhythm.offerSubtitle", {
            defaultValue:
              "You've already done this once. Add it to your Daily Rhythm to keep it going — pick a time of day.",
          })}
        </Text>
        <View style={styles.slotRow}>
          {SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={styles.slotBtn}
              disabled={adding}
              onPress={() => handlePickSlot(slot)}
            >
              <Ionicons
                name={
                  slot === "morning"
                    ? "sunny-outline"
                    : slot === "afternoon"
                      ? "partly-sunny-outline"
                      : "moon-outline"
                }
                size={22}
                color="#CC9933"
              />
              <Text style={styles.slotText}>{bandLabel(slot)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {adding && (
          <ActivityIndicator style={{ marginTop: 12 }} color="#CC9933" />
        )}
        <TouchableOpacity
          style={styles.dismiss}
          disabled={adding}
          onPress={handleClose}
        >
          <Text style={styles.dismissText}>
            {t("community.rhythm.notNow", { defaultValue: "Not now" })}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <Modal
      visible={!!offer}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        {/* Stop taps on the sheet from closing the modal. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {renderBody()}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1c1c",
    textAlign: "center",
  },
  practiceName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#CC9933",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
  slotBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CC9933",
    backgroundColor: "#FFFCF0",
  },
  slotText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#1c1c1c",
  },
  dismiss: {
    marginTop: 18,
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  primaryBtn: {
    marginTop: 22,
    backgroundColor: "#CC9933",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 48,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
});

export default RhythmSlotPickerModal;
