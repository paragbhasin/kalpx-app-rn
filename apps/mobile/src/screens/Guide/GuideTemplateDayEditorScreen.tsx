import React, { useCallback, useEffect, useRef, useState } from "react";
import { TimePickerModal } from "../../components/TimePickerModal";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  fetchLibraryItems,
  fetchMyTemplate,
  GuideTemplate,
  LibraryCard,
  LibraryDetailField,
  LibraryPickerItem,
  LibrarySlot,
  submitTemplateForReview,
  TemplateDay,
  updateTemplateDay,
} from "../../engine/liveSessionApi";

function hasVal(v: string | string[] | undefined | null): boolean {
  if (!v) return false;
  return Array.isArray(v) ? v.length > 0 : !!v;
}

function cardToSelection(slot: LibrarySlot, card: LibraryCard): SlotSelection {
  if (slot === "mantra") {
    return {
      item_id: card.item_id,
      title: card.title ?? card.item_id,
      subtitle: card.devanagari || card.meaning || "",
      meta: [card.deity, card.category_label].filter(Boolean).join(" · "),
      details: [
        { label: "Meaning", value: card.meaning ?? "" },
        { label: "Essence", value: card.essence ?? "" },
        { label: "Devanagari", value: card.devanagari ?? "" },
        { label: "IAST", value: card.iast ?? "" },
      ].filter((d) => hasVal(d.value)),
    };
  }
  if (slot === "sankalp") {
    return {
      item_id: card.item_id,
      title: card.title ?? card.item_id,
      subtitle: card.line || card.insight || "",
      meta: card.category_label ?? "",
      details: [
        { label: "Essence / Insight", value: card.insight ?? "" },
        { label: "How to Live", value: card.how_to_live ?? "" },
        { label: "Benefits", value: card.benefits ?? "" },
      ].filter((d) => hasVal(d.value)),
    };
  }
  if (slot === "wisdom") {
    return {
      item_id: card.item_id,
      title: card.text || card.title || card.item_id,
      subtitle: (card.explanation ?? [])[0] || "",
      meta: [card.mood, ...(card.tags ?? []).slice(0, 2)].filter(Boolean).join(" · "),
      details: [
        { label: "Explanation", value: card.explanation ?? [] },
        { label: "Source", value: card.source_title ?? "" },
      ].filter((d) => hasVal(d.value)),
    };
  }
  // practice
  return {
    item_id: card.item_id,
    title: card.title ?? card.item_id,
    subtitle: "",
    meta: [card.category_label, card.duration].filter(Boolean).join(" · "),
    details: [
      { label: "Steps", value: card.steps ?? [] },
      { label: "Essence", value: card.essence ?? "" },
      { label: "Benefits", value: card.benefits ?? "" },
    ].filter((d) => hasVal(d.value)),
  };
}
import { Fonts } from "../../theme/fonts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DayState extends TemplateDay {
  saving: boolean;
}

interface SlotSelection {
  item_id: string;
  title: string;
  subtitle: string;
  meta: string;
  details: LibraryDetailField[];
}

type PickerTarget = { dayNumber: number; slot: LibrarySlot } | null;

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted — in review",
  under_review: "Under review",
  changes_requested: "Changes requested",
  approved: "Approved",
  active: "Active",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "#8B6F4E",
  submitted: "#0969da",
  under_review: "#0969da",
  changes_requested: "#d97706",
  approved: "#22863a",
  active: "#22863a",
  rejected: "#C0392B",
};

const TIMEZONES = [
  { value: "IST",  label: "IST (UTC+5:30)" },
  { value: "UTC",  label: "UTC" },
  { value: "GMT",  label: "GMT (UTC+0)" },
  { value: "EST",  label: "EST (UTC-5)" },
  { value: "EDT",  label: "EDT (UTC-4)" },
  { value: "CST",  label: "CST (UTC-6)" },
  { value: "CDT",  label: "CDT (UTC-5)" },
  { value: "MST",  label: "MST (UTC-7)" },
  { value: "PST",  label: "PST (UTC-8)" },
  { value: "PDT",  label: "PDT (UTC-7)" },
  { value: "CET",  label: "CET (UTC+1)" },
  { value: "CEST", label: "CEST (UTC+2)" },
  { value: "GST",  label: "GST (UTC+4)" },
  { value: "SGT",  label: "SGT (UTC+8)" },
  { value: "JST",  label: "JST (UTC+9)" },
  { value: "AEST", label: "AEST (UTC+10)" },
  { value: "AEDT", label: "AEDT (UTC+11)" },
];

// ── Main screen ───────────────────────────────────────────────────────────────

export default function GuideTemplateDayEditorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const templateId: number = route.params?.templateId ?? 0;
  const viewOnly: boolean = !!route.params?.viewOnly;

  const [template, setTemplate] = useState<GuideTemplate | null>(null);
  const [days, setDays] = useState<DayState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [slotSelections, setSlotSelections] = useState<Record<string, SlotSelection>>({});
  const [reminderPickerTarget, setReminderPickerTarget] = useState<{ slot: 'mantra' | 'sankalp' | 'practice'; dayNumber: number } | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const scrollRef = useRef<ScrollView>(null);
  const dayOffsets = useRef<Record<number, number>>({});

  useEffect(() => {
    if (!templateId) return;
    fetchMyTemplate(templateId)
      .then((tmpl) => {
        setTemplate(tmpl);
        const loadedDays = (tmpl.days ?? []).map((d) => ({ ...d, saving: false }));
        setDays(loadedDays);

        // Seed slotSelections from _card fields already resolved by backend — no extra API calls
        const seeded: Record<string, SlotSelection> = {};
        loadedDays.forEach((d) => {
          if (d.mantra_card)   seeded[`${d.day_number}-mantra`]   = cardToSelection("mantra",   d.mantra_card);
          if (d.sankalp_card)  seeded[`${d.day_number}-sankalp`]  = cardToSelection("sankalp",  d.sankalp_card);
          if (d.practice_card) seeded[`${d.day_number}-practice`] = cardToSelection("practice", d.practice_card);
          if (d.wisdom_card)   seeded[`${d.day_number}-wisdom`]   = cardToSelection("wisdom",   d.wisdom_card);
        });
        if (Object.keys(seeded).length > 0) setSlotSelections(seeded);
      })
      .catch(() => setError("Could not load template."))
      .finally(() => setLoading(false));
  }, [templateId]);

  const saveDay = useCallback(
    async (dayNumber: number, patch: Partial<TemplateDay>) => {
      setDays((prev) =>
        prev.map((d) => (d.day_number === dayNumber ? { ...d, ...patch, saving: true } : d)),
      );
      try {
        await updateTemplateDay(templateId, dayNumber, patch);
        setDays((prev) =>
          prev.map((d) => (d.day_number === dayNumber ? { ...d, saving: false } : d)),
        );
      } catch {
        setDays((prev) =>
          prev.map((d) => (d.day_number === dayNumber ? { ...d, saving: false } : d)),
        );
      }
    },
    [templateId],
  );

  function updateDayLocal(dayNumber: number, patch: Partial<TemplateDay>) {
    setDays((prev) =>
      prev.map((d) => (d.day_number === dayNumber ? { ...d, ...patch } : d)),
    );
  }

  function handleLibrarySelect(item: LibraryPickerItem) {
    if (!pickerTarget) return;
    const { dayNumber, slot } = pickerTarget;
    const patch =
      slot === "mantra"
        ? { mantra_ref: item.item_id, custom_mantra_title: "", custom_mantra_body: "" }
        : slot === "sankalp"
        ? { sankalp_ref: item.item_id, custom_sankalp_title: "", custom_sankalp_body: "" }
        : slot === "wisdom"
        ? { wisdom_ref: item.item_id, custom_wisdom_title: "", custom_wisdom_body: "" }
        : { practice_ref: item.item_id, custom_practice_title: "", custom_practice_body: "" };
    saveDay(dayNumber, patch);
    setSlotSelections((prev) => ({ ...prev, [`${dayNumber}-${slot}`]: item }));
    setPickerTarget(null);
  }

  function applyToAllDays(slot: LibrarySlot, item_id: string, sourceDayNumber?: number) {
    const src = sourceDayNumber ? days.find((d) => d.day_number === sourceDayNumber) : days[0];
    const patch =
      slot === "mantra"
        ? { mantra_ref: item_id, custom_mantra_title: "", custom_mantra_body: "", mantra_count: src?.mantra_count ?? null, mantra_reminder_time: src?.mantra_reminder_time ?? null }
        : slot === "sankalp"
          ? { sankalp_ref: item_id, custom_sankalp_title: "", custom_sankalp_body: "", sankalp_reminder_time: src?.sankalp_reminder_time ?? null }
          : slot === "wisdom"
            ? { wisdom_ref: item_id, custom_wisdom_title: "", custom_wisdom_body: "" }
            : { practice_ref: item_id, custom_practice_title: "", custom_practice_body: "", practice_duration_minutes: src?.practice_duration_minutes ?? null, practice_reminder_time: src?.practice_reminder_time ?? null };
    days.forEach((d) => saveDay(d.day_number, patch));
    setSlotSelections((prev) => {
      const next = { ...prev };
      const src = prev[`${days[0]?.day_number}-${slot}`];
      if (src) days.forEach((d) => { next[`${d.day_number}-${slot}`] = src; });
      return next;
    });
  }

  function repeatDay1() {
    const day1 = days[0];
    if (!day1) return;
    const patch: Partial<TemplateDay> = {
      mantra_ref: day1.mantra_ref, custom_mantra_title: day1.custom_mantra_title, custom_mantra_body: day1.custom_mantra_body,
      sankalp_ref: day1.sankalp_ref, custom_sankalp_title: day1.custom_sankalp_title, custom_sankalp_body: day1.custom_sankalp_body,
      practice_ref: day1.practice_ref, custom_practice_title: day1.custom_practice_title, custom_practice_body: day1.custom_practice_body,
      wisdom_ref: day1.wisdom_ref, custom_wisdom_title: day1.custom_wisdom_title, custom_wisdom_body: day1.custom_wisdom_body,
      day_join_url: day1.day_join_url, day_session_time: day1.day_session_time, day_session_timezone: day1.day_session_timezone,
      mantra_count: day1.mantra_count, practice_duration_minutes: day1.practice_duration_minutes,
      mantra_reminder_time: day1.mantra_reminder_time, sankalp_reminder_time: day1.sankalp_reminder_time,
      practice_reminder_time: day1.practice_reminder_time, reflection_prompt: day1.reflection_prompt,
    };
    days.slice(1).forEach((d) => saveDay(d.day_number, patch));
    setSlotSelections((prev) => {
      const next = { ...prev };
      const slots: LibrarySlot[] = ["mantra", "sankalp", "practice", "wisdom"];
      slots.forEach((slot) => {
        const src = prev[`${day1.day_number}-${slot}`];
        if (src) days.slice(1).forEach((d) => { next[`${d.day_number}-${slot}`] = src; });
      });
      return next;
    });
  }

  async function handleSubmit() {
    const emptyDays = days.filter((d) => {
      const hasRef = d.mantra_ref || d.sankalp_ref || d.practice_ref || d.wisdom_ref;
      const hasCustom = d.custom_mantra_body || d.custom_sankalp_body || d.custom_practice_body || d.custom_wisdom_body;
      return !hasRef && !hasCustom;
    });
    if (emptyDays.length > 0) {
      setError(`Each day needs at least one slot. Missing: ${emptyDays.map((d) => `Day ${d.day_number}`).join(", ")}`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitTemplateForReview(templateId);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centered}><ActivityIndicator size="large" color="#C99317" /></View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={[s.centered, { padding: 32 }]}>
          <Text style={s.successTitle}>Submitted for Review</Text>
          <Text style={s.successBody}>KalpX will review your program within 3–5 business days.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate("GuideHome")}>
            <Text style={s.primaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const locked = viewOnly || !!template?.locked_at;
  const canSubmit = !viewOnly && (template?.review_status === "draft" || template?.review_status === "changes_requested");
  const statusColor = STATUS_COLOR[template?.review_status ?? ""] ?? "#8B6F4E";

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        {/* Day tab bar */}
        {days.length > 1 && (
          <View style={s.dayNavBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayNavScroll}>
              {days.map((day) => {
                const hasContent = day.mantra_ref || day.sankalp_ref || day.practice_ref || day.wisdom_ref ||
                  day.custom_mantra_body || day.custom_sankalp_body || day.custom_practice_body || day.custom_wisdom_body;
                const isActive = activeDay === day.day_number;
                return (
                  <TouchableOpacity
                    key={day.day_number}
                    style={[s.dayTab, isActive && s.dayTabActive, !isActive && hasContent && s.dayTabDone]}
                    onPress={() => {
                      setActiveDay(day.day_number);
                      const offset = dayOffsets.current[day.day_number];
                      if (offset !== undefined) scrollRef.current?.scrollTo({ y: offset - 8, animated: true });
                    }}
                  >
                    <Text style={[s.dayTabText, isActive && s.dayTabTextActive, !isActive && hasContent && s.dayTabTextDone]}>
                      Day {day.day_number}
                    </Text>
                    {hasContent && !isActive && <View style={s.dayDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← Templates</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={s.eyebrow}>GUIDE TOOLS · TEMPLATE BUILDER</Text>
          <Text style={s.heading}>{template?.title ?? "Edit Program"}</Text>
          <Text style={[s.statusBadge, { color: statusColor }]}>
            {STATUS_LABEL[template?.review_status ?? ""] ?? template?.review_status}
          </Text>

          {!!error && <Text style={s.errorText}>{error}</Text>}

          {viewOnly && (
            <View style={s.lockBanner}>
              <Text style={s.lockBannerText}>View only — all fields are read-only.</Text>
            </View>
          )}
          {!viewOnly && locked && (
            <View style={s.lockBanner}>
              <Text style={s.lockBannerText}>
                This template is locked — a campaign is running. Create a new version to make changes.
              </Text>
            </View>
          )}

          {/* Repeat Day 1 banner */}
          {!locked && days.length > 1 && (
            <View style={s.repeatBanner}>
              <Text style={s.repeatBannerText}>Set Day 1 first, then repeat across all days.</Text>
              <TouchableOpacity style={s.repeatBtn} onPress={repeatDay1}>
                <Text style={s.repeatBtnText}>Repeat Day 1 →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit btn at top for multi-day */}
          {!locked && canSubmit && days.length > 3 && (
            <TouchableOpacity style={[s.submitBtn, { marginBottom: 20 }]} onPress={handleSubmit} disabled={submitting}>
              <Text style={s.submitBtnText}>{submitting ? "Submitting…" : "Submit for Review"}</Text>
            </TouchableOpacity>
          )}

          {/* Day cards */}
          {days.map((day) => (
            <View
              key={day.day_number}
              onLayout={(e) => { dayOffsets.current[day.day_number] = e.nativeEvent.layout.y; }}
            >
              <DayRow
                day={day}
                locked={locked}
                slotSelections={slotSelections}
                onOpenPicker={(slot) => setPickerTarget({ dayNumber: day.day_number, slot })}
                onApplyToAll={(slot, item_id) => applyToAllDays(slot, item_id, day.day_number)}
                onBlurSave={(patch) => saveDay(day.day_number, patch)}
                onLocalChange={(patch) => updateDayLocal(day.day_number, patch)}
                onOpenReminderPicker={(slot) => setReminderPickerTarget({ slot, dayNumber: day.day_number })}
              />
            </View>
          ))}

          {/* Submit btn at bottom */}
          {!locked && canSubmit && (
            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
              <Text style={s.submitBtnText}>{submitting ? "Submitting…" : "Submit for Review"}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Library picker modal */}
      {pickerTarget && (
        <LibraryPickerModal
          slot={pickerTarget.slot}
          onSelect={handleLibrarySelect}
          onClose={() => setPickerTarget(null)}
        />
      )}

      {/* Reminder time picker — screen-level so Modal is never nested */}
      <TimePickerModal
        visible={reminderPickerTarget !== null}
        initialTime={
          reminderPickerTarget
            ? (() => {
                const day = days.find(d => d.day_number === reminderPickerTarget.dayNumber);
                const saved = day ? (day[`${reminderPickerTarget.slot}_reminder_time` as keyof DayState] as string | null) : null;
                return (saved ?? REMINDER_DEFAULTS[reminderPickerTarget.slot]) + ':00';
              })()
            : null
        }
        onConfirm={(timeStr) => {
          if (!reminderPickerTarget) return;
          const hhmm = timeStr.slice(0, 5);
          updateDayLocal(reminderPickerTarget.dayNumber, { [`${reminderPickerTarget.slot}_reminder_time`]: hhmm } as any);
          saveDay(reminderPickerTarget.dayNumber, { [`${reminderPickerTarget.slot}_reminder_time`]: hhmm } as any);
          setReminderPickerTarget(null);
        }}
        onCancel={() => setReminderPickerTarget(null)}
      />
    </SafeAreaView>
  );
}

// ── DayRow ────────────────────────────────────────────────────────────────────

interface DayRowProps {
  day: DayState;
  locked: boolean;
  onOpenReminderPicker: (slot: 'mantra' | 'sankalp' | 'practice') => void;
  slotSelections: Record<string, SlotSelection>;
  onOpenPicker: (slot: LibrarySlot) => void;
  onApplyToAll: (slot: LibrarySlot, item_id: string) => void;
  onBlurSave: (patch: Partial<TemplateDay>) => void;
  onLocalChange: (patch: Partial<TemplateDay>) => void;
}

const REMINDER_DEFAULTS: Record<'mantra' | 'sankalp' | 'practice', string> = {
  mantra: '06:00',
  sankalp: '08:00',
  practice: '18:00',
};

function fmtGuide12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function DayRow({ day, locked, slotSelections, onOpenPicker, onApplyToAll, onBlurSave, onLocalChange, onOpenReminderPicker }: DayRowProps) {
  const sel = (slot: LibrarySlot) => slotSelections[`${day.day_number}-${slot}`] ?? null;

  return (
    <View style={s.dayCard}>
      <View style={s.dayHeader}>
        <Text style={s.dayNumber}>Day {day.day_number}</Text>
        {day.saving && <Text style={s.savingText}>saving…</Text>}
      </View>

      {/* Theme */}
      <FieldRow label="Theme / Title">
        <TextInput
          style={s.input}
          value={day.theme}
          editable={!locked}
          onChangeText={(v) => onLocalChange({ theme: v })}
          onEndEditing={() => onBlurSave({ theme: day.theme })}
          placeholder="e.g. Surrender & Trust"
          placeholderTextColor="#B5A08A"
        />
      </FieldRow>

      {/* Mantra */}
      <SlotRow
        label="Mantra"
        slot="mantra"
        refValue={day.mantra_ref}
        selection={sel("mantra")}
        customTitle={day.custom_mantra_title}
        customBody={day.custom_mantra_body}
        locked={locked}
        dayNumber={day.day_number}
        onOpenPicker={() => onOpenPicker("mantra")}
        onApplyToAll={(id) => onApplyToAll("mantra", id)}
        onClearRef={() => onBlurSave({ mantra_ref: "" })}
        onCustomChange={(title, body) => onLocalChange({ custom_mantra_title: title, custom_mantra_body: body })}
        onCustomBlur={(title, body) => onBlurSave({ custom_mantra_title: title, custom_mantra_body: body, mantra_ref: "" })}
      />
      {!locked && !!(day.mantra_ref || day.custom_mantra_body) && (
        <View style={s.slotSettings}>
          <View>
            <Text style={s.extraDetailsLabel}>CHANT COUNT FOR PARTICIPANTS</Text>
            <View style={s.pillRow}>
              {[1, 9, 27, 54, 108].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => onBlurSave({ mantra_count: day.mantra_count === n ? null : n })}
                  style={[s.pill, day.mantra_count === n && s.pillActive]}
                >
                  <Text style={[s.pillText, day.mantra_count === n && s.pillTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={s.extraDetailsLabel}>SUGGESTED REMINDER TIME</Text>
            <TouchableOpacity style={s.timePill} onPress={() => onOpenReminderPicker('mantra')}>
              <Text style={s.timePillText}>{fmtGuide12h(day.mantra_reminder_time ?? REMINDER_DEFAULTS.mantra)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sankalp */}
      <SlotRow
        label="Sankalp"
        slot="sankalp"
        refValue={day.sankalp_ref}
        selection={sel("sankalp")}
        customTitle={day.custom_sankalp_title}
        customBody={day.custom_sankalp_body}
        locked={locked}
        dayNumber={day.day_number}
        onOpenPicker={() => onOpenPicker("sankalp")}
        onApplyToAll={(id) => onApplyToAll("sankalp", id)}
        onClearRef={() => onBlurSave({ sankalp_ref: "" })}
        onCustomChange={(title, body) => onLocalChange({ custom_sankalp_title: title, custom_sankalp_body: body })}
        onCustomBlur={(title, body) => onBlurSave({ custom_sankalp_title: title, custom_sankalp_body: body, sankalp_ref: "" })}
      />
      {!locked && !!(day.sankalp_ref || day.custom_sankalp_body) && (
        <View style={s.slotSettings}>
          <View>
            <Text style={s.extraDetailsLabel}>SUGGESTED REMINDER TIME</Text>
            <TouchableOpacity style={s.timePill} onPress={() => onOpenReminderPicker('sankalp')}>
              <Text style={s.timePillText}>{fmtGuide12h(day.sankalp_reminder_time ?? REMINDER_DEFAULTS.sankalp)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Practice */}
      <SlotRow
        label="Practice"
        slot="practice"
        refValue={day.practice_ref}
        selection={sel("practice")}
        customTitle={day.custom_practice_title}
        customBody={day.custom_practice_body}
        locked={locked}
        dayNumber={day.day_number}
        onOpenPicker={() => onOpenPicker("practice")}
        onApplyToAll={(id) => onApplyToAll("practice", id)}
        onClearRef={() => onBlurSave({ practice_ref: "" })}
        onCustomChange={(title, body) => onLocalChange({ custom_practice_title: title, custom_practice_body: body })}
        onCustomBlur={(title, body) => onBlurSave({ custom_practice_title: title, custom_practice_body: body, practice_ref: "" })}
      />
      {!locked && !!(day.practice_ref || day.custom_practice_body) && (
        <View style={s.slotSettings}>
          <View>
            <Text style={s.extraDetailsLabel}>DURATION (MINUTES)</Text>
            <TextInput
              style={s.durationInput}
              value={day.practice_duration_minutes != null ? String(day.practice_duration_minutes) : ""}
              onChangeText={(v) => {
                const n = parseInt(v, 10);
                onLocalChange({ practice_duration_minutes: isNaN(n) ? null : n });
              }}
              onEndEditing={() => onBlurSave({ practice_duration_minutes: day.practice_duration_minutes })}
              placeholder="e.g. 10"
              placeholderTextColor="#B5A08A"
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
          <View>
            <Text style={s.extraDetailsLabel}>SUGGESTED REMINDER TIME</Text>
            <TouchableOpacity style={s.timePill} onPress={() => onOpenReminderPicker('practice')}>
              <Text style={s.timePillText}>{fmtGuide12h(day.practice_reminder_time ?? REMINDER_DEFAULTS.practice)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Wisdom */}
      <SlotRow
        label="Wisdom"
        slot="wisdom"
        refValue={day.wisdom_ref}
        selection={sel("wisdom")}
        customTitle={day.custom_wisdom_title || ""}
        customBody={day.custom_wisdom_body}
        locked={locked}
        dayNumber={day.day_number}
        onOpenPicker={() => onOpenPicker("wisdom")}
        onApplyToAll={(id) => onApplyToAll("wisdom", id)}
        onClearRef={() => onBlurSave({ wisdom_ref: "" })}
        onCustomChange={(t, body) => onLocalChange({ custom_wisdom_title: t, custom_wisdom_body: body })}
        onCustomBlur={(t, body) => onBlurSave({ custom_wisdom_title: t, custom_wisdom_body: body, wisdom_ref: "" })}
      />

      {/* Live session link */}
      <FieldRow label="Live session link (optional)">
        <TextInput
          style={s.input}
          value={day.day_join_url}
          editable={!locked}
          onChangeText={(v) => onLocalChange({ day_join_url: v })}
          onEndEditing={() => onBlurSave({ day_join_url: day.day_join_url })}
          placeholder="https://meet.google.com/…"
          placeholderTextColor="#B5A08A"
          autoCapitalize="none"
          keyboardType="url"
        />
        <View style={s.timeRow}>
          <Text style={s.timeLabel}>Time</Text>
          <TextInput
            style={[s.input, s.timeInput]}
            value={day.day_session_time}
            editable={!locked}
            onChangeText={(v) => onLocalChange({ day_session_time: v })}
            onEndEditing={() => onBlurSave({ day_session_time: day.day_session_time })}
            placeholder="HH:MM"
            placeholderTextColor="#B5A08A"
            keyboardType="numbers-and-punctuation"
          />
          <TZPicker
            value={day.day_session_timezone || "IST"}
            disabled={locked}
            onChange={(tz) => {
              onLocalChange({ day_session_timezone: tz });
              onBlurSave({ day_session_timezone: tz });
            }}
          />
        </View>
      </FieldRow>

      {/* Reflection prompt */}
      <FieldRow label="Reflection prompt (optional)">
        <TextInput
          style={s.input}
          value={day.reflection_prompt}
          editable={!locked}
          onChangeText={(v) => onLocalChange({ reflection_prompt: v })}
          onEndEditing={() => onBlurSave({ reflection_prompt: day.reflection_prompt })}
          placeholder="What are you grateful for today?"
          placeholderTextColor="#B5A08A"
        />
        <Text style={s.fieldHint}>
          Ask one thoughtful question that helps participants reflect on today's practice. Participants can write and save their answer privately.
        </Text>
      </FieldRow>

    </View>
  );
}

// ── SlotRow ───────────────────────────────────────────────────────────────────

interface SlotRowProps {
  label: string;
  slot: LibrarySlot;
  refValue: string;
  selection: SlotSelection | null;
  customTitle: string;
  customBody: string;
  locked: boolean;
  dayNumber: number;
  onOpenPicker: () => void;
  onApplyToAll: (item_id: string) => void;
  onClearRef: () => void;
  onCustomChange: (title: string, body: string) => void;
  onCustomBlur: (title: string, body: string) => void;
}

function SlotRow({ label, refValue, selection, customTitle, customBody, locked, onOpenPicker, onApplyToAll, onClearRef, onCustomChange, onCustomBlur }: SlotRowProps) {
  const [mode, setMode] = useState<"library" | "custom">(customBody ? "custom" : "library");
  const [localTitle, setLocalTitle] = useState(customTitle);
  const [localBody, setLocalBody] = useState(customBody);

  useEffect(() => {
    setLocalTitle(customTitle);
    setLocalBody(customBody);
    if (customBody) setMode("custom");
  }, [customTitle, customBody]);

  const [showDetails, setShowDetails] = useState(false);
  const displayTitle = selection?.title || refValue;

  return (
    <FieldRow label={label}>
      {/* Mode toggle */}
      {!locked && (
        <View style={s.modeToggle}>
          <TouchableOpacity
            style={[s.modeBtn, mode === "library" && s.modeBtnActive]}
            onPress={() => setMode("library")}
          >
            <Text style={[s.modeBtnText, mode === "library" && s.modeBtnTextActive]}>From library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modeBtn, mode === "custom" && s.modeBtnActive]}
            onPress={() => { setMode("custom"); onClearRef(); }}
          >
            <Text style={[s.modeBtnText, mode === "custom" && s.modeBtnTextActive]}>Write my own</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "library" ? (
        <View>
          {refValue ? (
            <View style={s.selectedCard}>
              {/* Top row: title + action buttons */}
              <View style={s.selectedCardTop}>
                <Text style={s.selectedCardTitle} numberOfLines={showDetails ? undefined : 2}>{displayTitle}</Text>
                <View style={s.selectedCardBtns}>
                  <TouchableOpacity style={s.detailsBtn} onPress={() => setShowDetails((v) => !v)}>
                    <Text style={s.detailsBtnText}>{showDetails ? "Hide details" : "View details"}</Text>
                  </TouchableOpacity>
                  {!locked && (
                    <>
                      <TouchableOpacity style={s.changeBtn} onPress={onOpenPicker}>
                        <Text style={s.changeBtnText}>Change</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.changeBtn} onPress={onClearRef}>
                        <Text style={s.changeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* Details panel — matches web structure exactly */}
              {showDetails && (
                <View style={s.detailsPanel}>
                  {(selection?.details ?? []).length > 0
                    ? (selection!.details.map((d) => (
                        <View key={d.label} style={s.detailFieldRow}>
                          <Text style={s.detailFieldLabel}>{d.label.toUpperCase()}</Text>
                          {Array.isArray(d.value)
                            ? (d.value as string[]).map((v, i) => (
                                <Text key={i} style={s.detailListItem}>• {v}</Text>
                              ))
                            : <Text style={s.detailFieldValue}>{d.value as string}</Text>
                          }
                        </View>
                      )))
                    : !!selection?.subtitle && (
                        <Text style={s.detailFieldValue}>{selection.subtitle}</Text>
                      )
                  }
                </View>
              )}

              {!locked && (
                <TouchableOpacity onPress={() => onApplyToAll(refValue)} style={s.applyAllBtn}>
                  <Text style={s.applyAllText}>Apply to all days</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            !locked && (
              <TouchableOpacity style={s.pickBtn} onPress={onOpenPicker}>
                <Text style={s.pickBtnText}>+ Pick from library</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      ) : (
        <View>
          <TextInput
            style={[s.input, { marginBottom: 6 }]}
            placeholder={`${label} title`}
            placeholderTextColor="#B5A08A"
            value={localTitle}
            editable={!locked}
            onChangeText={(v) => { setLocalTitle(v); onCustomChange(v, localBody); }}
            onEndEditing={() => onCustomBlur(localTitle, localBody)}
          />
          <TextInput
            style={[s.input, s.textArea]}
            placeholder={`${label} text…`}
            placeholderTextColor="#B5A08A"
            value={localBody}
            editable={!locked}
            multiline
            numberOfLines={3}
            onChangeText={(v) => { setLocalBody(v); onCustomChange(localTitle, v); }}
            onEndEditing={() => onCustomBlur(localTitle, localBody)}
          />
          <Text style={s.reviewNote}>Custom content is reviewed by KalpX before going live.</Text>
        </View>
      )}
    </FieldRow>
  );
}

// ── FieldRow ──────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ── TZPicker ──────────────────────────────────────────────────────────────────

function TZPicker({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<any>(null);

  const currentLabel = TIMEZONES.find((t) => t.value === value)?.label ?? value;

  function openDropdown() {
    if (disabled) return;
    btnRef.current?.measure((_x: number, _y: number, _w: number, h: number, pageX: number, pageY: number) => {
      setPos({ top: pageY + h + 4, left: pageX });
      setOpen(true);
    });
  }

  return (
    <>
      <TouchableOpacity ref={btnRef} style={s.tzBtn} onPress={openDropdown}>
        <Text style={s.tzBtnText}>{currentLabel} ▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject as any} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[s.tzDropdown, { top: pos.top, left: pos.left }]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
              {TIMEZONES.map((tz) => (
                <TouchableOpacity
                  key={tz.value}
                  style={s.tzOption}
                  onPress={() => { onChange(tz.value); setOpen(false); }}
                >
                  <Text style={[s.tzOptionText, tz.value === value && s.tzOptionTextActive]}>
                    {tz.value === value ? `✓ ${tz.label}` : `   ${tz.label}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ── Library Picker Modal ──────────────────────────────────────────────────────

function LibraryPickerModal({
  slot,
  onSelect,
  onClose,
}: {
  slot: LibrarySlot;
  onSelect: (item: LibraryPickerItem) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<LibraryPickerItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLibraryItems(slot, search || undefined)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [slot, search]);

  const SLOT_LABEL: Record<LibrarySlot, string> = {
    mantra: "Mantra",
    sankalp: "Sankalp",
    practice: "Practice",
    wisdom: "Wisdom",
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <SafeAreaView style={s.pickerSheet}>
          {/* Header */}
          <View style={s.pickerHeader}>
            <Text style={s.pickerTitle}>Pick a {SLOT_LABEL[slot]}</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            style={s.searchInput}
            placeholder={`Search ${SLOT_LABEL[slot].toLowerCase()}s…`}
            placeholderTextColor="#B5A08A"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />

          {loading ? (
            <View style={s.centered}><ActivityIndicator color="#C99317" /></View>
          ) : items.length === 0 ? (
            <Text style={s.hint}>No results found.</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.item_id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.pickerItem} onPress={() => onSelect(item)}>
                  <Text style={s.pickerItemTitle}>{item.title}</Text>
                  {!!item.subtitle && <Text style={s.pickerItemSub}>{item.subtitle}</Text>}
                  {!!item.meta && <Text style={s.pickerItemMeta}>{item.meta}</Text>}
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { padding: 16, paddingBottom: 80 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 13, color: "#8B6F4E", fontFamily: Fonts.sans.regular },
  eyebrow: { fontSize: 9, letterSpacing: 1.2, color: "#8B6F4E", textTransform: "uppercase", marginBottom: 4, fontFamily: Fonts.sans.medium },
  heading: { fontSize: 22, fontWeight: "800", color: "#432104", marginBottom: 4, fontFamily: Fonts.serif.bold },
  statusBadge: { fontSize: 12, fontWeight: "700", marginBottom: 20, fontFamily: Fonts.sans.medium },
  errorText: { color: "#C0392B", fontSize: 13, marginBottom: 12, fontFamily: Fonts.sans.regular },

  lockBanner: { backgroundColor: "#FEF3D0", borderWidth: 1, borderColor: "#C99317", borderRadius: 8, padding: 12, marginBottom: 16 },
  lockBannerText: { fontSize: 13, color: "#7A4E00", fontFamily: Fonts.sans.regular },

  repeatBanner: { backgroundColor: "#FEF9ED", borderWidth: 1, borderColor: "#E8D9A0", borderRadius: 10, padding: 12, marginBottom: 16, gap: 8 },
  repeatBannerText: { fontSize: 12, color: "#7A6652", fontFamily: Fonts.sans.regular },
  repeatBtn: { backgroundColor: "#432104", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, alignSelf: "flex-start" },
  repeatBtnText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: Fonts.sans.bold },

  submitBtn: { backgroundColor: "#432104", borderRadius: 8, padding: 14, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: Fonts.sans.bold },
  primaryBtn: { backgroundColor: "#C99317", borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: Fonts.sans.bold },
  successTitle: { fontSize: 20, fontWeight: "700", color: "#432104", marginBottom: 8, fontFamily: Fonts.serif.bold },
  successBody: { fontSize: 14, color: "#7A6652", textAlign: "center", fontFamily: Fonts.sans.regular },

  // Day nav
  dayNavBar: { backgroundColor: "#FAF7F2", borderBottomWidth: 1, borderBottomColor: "#E8DECE" },
  dayNavScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  dayTab: { borderWidth: 2, borderColor: "#E8DECE", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  dayTabActive: { borderColor: "#C99317", backgroundColor: "#C99317" },
  dayTabDone: { borderColor: "#E8DECE", backgroundColor: "#FFF8EC" },
  dayTabText: { fontSize: 12, color: "#B5A08A", fontFamily: Fonts.sans.medium },
  dayTabTextActive: { color: "#fff", fontWeight: "700" },
  dayTabTextDone: { color: "#7A5C00" },
  dayDot: { position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: "#C99317", borderWidth: 1.5, borderColor: "#fff" },

  // Day card
  dayCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E8DECE", borderRadius: 12, padding: 16, marginBottom: 16 },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  dayNumber: { fontSize: 14, fontWeight: "800", color: "#432104", fontFamily: Fonts.sans.bold },
  savingText: { fontSize: 11, color: "#B5A08A", fontFamily: Fonts.sans.regular },

  // Field
  fieldRow: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontWeight: "700", color: "#8B6F4E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, fontFamily: Fonts.sans.medium },
  input: { borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: "#432104", fontFamily: Fonts.sans.regular },
  textArea: { minHeight: 72, textAlignVertical: "top" },

  // Mode toggle
  modeToggle: { flexDirection: "row", gap: 6, marginBottom: 8 },
  modeBtn: { borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  modeBtnActive: { backgroundColor: "#C99317", borderColor: "#C99317" },
  modeBtnText: { fontSize: 12, color: "#8B6F4E", fontFamily: Fonts.sans.regular },
  modeBtnTextActive: { color: "#fff", fontWeight: "700" },

  // Selected library item
  selectedCard: { backgroundColor: "#F5EFE5", borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 8, padding: 12 },
  selectedCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  selectedCardTitle: { flex: 1, fontSize: 13, fontWeight: "700", color: "#432104", lineHeight: 18, fontFamily: Fonts.sans.bold },
  selectedCardBtns: { flexDirection: "row", gap: 6, flexShrink: 0, flexWrap: "wrap", alignItems: "center" },
  detailsBtn: { borderWidth: 1, borderColor: "#C99317", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  detailsBtnText: { fontSize: 11, fontWeight: "600", color: "#C99317", fontFamily: Fonts.sans.medium },
  changeBtn: { borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  changeBtnText: { fontSize: 11, color: "#8B6F4E", fontFamily: Fonts.sans.regular },
  detailsPanel: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#DDD3C0", gap: 10 },
  detailFieldRow: { marginBottom: 8 },
  detailFieldLabel: { fontSize: 10, fontWeight: "700", color: "#B5A08A", letterSpacing: 0.8, marginBottom: 3, fontFamily: Fonts.sans.bold },
  detailFieldValue: { fontSize: 13, color: "#432104", lineHeight: 19, fontFamily: Fonts.sans.regular },
  detailListItem: { fontSize: 13, color: "#432104", lineHeight: 19, marginLeft: 4, fontFamily: Fonts.sans.regular },
  applyAllBtn: { marginTop: 8 },
  applyAllText: { fontSize: 11, color: "#C99317", textDecorationLine: "underline", fontFamily: Fonts.sans.regular },
  slotSettings: { backgroundColor: "#FAF7F2", borderRadius: 8, borderWidth: 1, borderColor: "#EDE4D0", padding: 12, marginTop: 6, marginBottom: 4 },
  extraDetailsLabel: { fontSize: 10, fontWeight: "700", color: "#9A7548", letterSpacing: 0.8, marginBottom: 6, fontFamily: Fonts.sans.bold },
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#DDD3C0", backgroundColor: "transparent" },
  pillActive: { backgroundColor: "#C99317", borderColor: "#C99317" },
  pillText: { fontSize: 13, color: "#7B6545", fontFamily: Fonts.sans.regular },
  pillTextActive: { color: "#fff", fontWeight: "700" },
  durationInput: { borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: "#432104", fontFamily: Fonts.sans.regular, width: 100 },
  timePill: { backgroundColor: "#C99317", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start" as const },
  timePillText: { fontFamily: Fonts.sans.medium, fontSize: 14, color: "#fff", fontWeight: "700" },
  pickBtn: { backgroundColor: "#FEF3D0", borderWidth: 1, borderColor: "#C99317", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start" },
  pickBtnText: { fontSize: 12, fontWeight: "700", color: "#7A4E00", fontFamily: Fonts.sans.bold },
  reviewNote: { fontSize: 11, color: "#B5A08A", marginTop: 4, fontFamily: Fonts.sans.regular },

  // Time row
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" },
  timeLabel: { fontSize: 12, color: "#7A6652", fontWeight: "600", fontFamily: Fonts.sans.medium },
  timeInput: { flex: 1, minWidth: 70 },
  tzBtn: { borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, flexShrink: 1 },
  tzBtnText: { fontSize: 12, color: "#432104", fontFamily: Fonts.sans.regular },

  // TZ floating dropdown
  tzDropdown: {
    position: "absolute", backgroundColor: "#3C3C3E", borderRadius: 12,
    paddingVertical: 6, minWidth: 190,
    shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  tzOption: { paddingHorizontal: 14, paddingVertical: 11 },
  tzOptionActive: {},
  tzOptionText: { fontSize: 14, color: "#fff", fontFamily: Fonts.sans.regular },
  tzOptionTextActive: { color: "#5BB3FF", fontWeight: "700", fontFamily: Fonts.sans.bold },
  tzCheckmark: { fontSize: 14, color: "#5BB3FF" },

  // Picker sheet
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  pickerSheet: { backgroundColor: "#FAF7F2", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", flex: 0 },
  pickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#E8DECE" },
  pickerTitle: { fontSize: 16, fontWeight: "700", color: "#432104", fontFamily: Fonts.sans.bold },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 16, color: "#8B6F4E" },
  searchInput: { margin: 12, borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#432104", backgroundColor: "#fff", fontFamily: Fonts.sans.regular },
  pickerItem: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0EAE0" },
  pickerItemTitle: { fontSize: 14, fontWeight: "700", color: "#432104", marginBottom: 2, fontFamily: Fonts.sans.bold },
  pickerItemSub: { fontSize: 12, color: "#7A6652", marginBottom: 2, fontFamily: Fonts.sans.regular },
  pickerItemMeta: { fontSize: 11, color: "#B5A08A", fontFamily: Fonts.sans.regular },
  hint: { textAlign: "center", color: "#B5A08A", padding: 40, fontSize: 14, fontFamily: Fonts.sans.regular },
  fieldHint: { fontSize: 12, color: "#9A8470", marginTop: 6, lineHeight: 17, fontFamily: Fonts.sans.regular },
});
