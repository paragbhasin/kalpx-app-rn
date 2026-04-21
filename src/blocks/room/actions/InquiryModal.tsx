/**
 * InquiryModal — category picker + detail panel launched by
 * RoomActionInquiryPill (Phase 6).
 *
 * Two-screen flow inside one Modal:
 *   1. Category list — renders `inquiry_payload.categories[]`
 *   2. Category detail — shows `anchor_line` + `reflective_prompt || prompt`
 *      with two actions:
 *        - "Try a practice" (only when suggested_practice_template_id is set):
 *          caller-side dispatches room_step_completed with the template_id.
 *        - "Journal on this": inline TextInput → caller dispatches
 *          room_step_completed with { template_id: "step_journal_inquiry",
 *          text, category_id, source: "inquiry" }.
 *
 * The modal itself is presentation only. All dispatch decisions live on
 * the caller via `onLaunchPractice` / `onSubmitJournal` callbacks so the
 * dispatch shape stays consistent with the existing Room pill pattern.
 */

import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { InquiryCategory, InquiryPayload } from "../types";

interface Props {
  visible: boolean;
  label: string;
  inquiryPayload: InquiryPayload | null | undefined;
  onCancel: () => void;
  /** Fired when user taps "Try a practice" on a category with a template_id. */
  onLaunchPractice: (
    category: InquiryCategory,
    templateId: string,
  ) => void;
  /** Fired when user writes a journal entry and taps Done. */
  onSubmitJournal: (category: InquiryCategory, text: string) => void;
  /** Fired on first open — used by caller for room_inquiry_opened telemetry. */
  onOpened?: () => void;
  /** Fired when a category row is tapped — used for room_inquiry_category_selected. */
  onCategorySelected?: (category: InquiryCategory) => void;
}

const MAX_TEXT = 1000;

const InquiryModal: React.FC<Props> = ({
  visible,
  label,
  inquiryPayload,
  onCancel,
  onLaunchPractice,
  onSubmitJournal,
  onOpened,
  onCategorySelected,
}) => {
  const [selected, setSelected] = useState<InquiryCategory | null>(null);
  const [journalOpen, setJournalOpen] = useState<boolean>(false);
  const [journalText, setJournalText] = useState<string>("");
  const [openedFired, setOpenedFired] = useState<boolean>(false);

  React.useEffect(() => {
    if (visible && !openedFired) {
      setOpenedFired(true);
      onOpened?.();
    }
    if (!visible) {
      // Reset state on close so the next open starts fresh.
      setOpenedFired(false);
      setSelected(null);
      setJournalOpen(false);
      setJournalText("");
    }
  }, [visible, openedFired, onOpened]);

  const categories = inquiryPayload?.categories ?? [];

  const handleSelect = (cat: InquiryCategory) => {
    setSelected(cat);
    setJournalOpen(false);
    setJournalText("");
    onCategorySelected?.(cat);
  };

  const handleBack = () => {
    setSelected(null);
    setJournalOpen(false);
    setJournalText("");
  };

  const handleJournalDone = () => {
    if (!selected) return;
    const trimmed = journalText.trim();
    if (trimmed.length < 1) return;
    onSubmitJournal(selected, trimmed);
  };

  const handlePractice = () => {
    if (!selected) return;
    const tid = selected.suggested_practice_template_id;
    if (!tid) return;
    onLaunchPractice(selected, tid);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onCancel}
      transparent={false}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          {selected ? (
            <TouchableOpacity
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
              testID="inquiry_modal_back"
            >
              <Text style={styles.headerCancel}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              testID="inquiry_modal_cancel"
            >
              <Text style={styles.headerCancel}>Cancel</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selected ? selected.label : label}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {!selected ? (
          <ScrollView
            style={styles.body}
            testID="inquiry_modal_category_list"
            keyboardShouldPersistTaps="handled"
          >
            {categories.length === 0 ? (
              <Text style={styles.emptyHint}>No categories.</Text>
            ) : (
              categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryRow}
                  onPress={() => handleSelect(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                  testID={`inquiry_modal_category_${cat.id}`}
                >
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.body}
            testID="inquiry_modal_category_detail"
            keyboardShouldPersistTaps="handled"
          >
            {selected.anchor_line ? (
              <Text style={styles.anchorLine}>{selected.anchor_line}</Text>
            ) : null}
            <Text style={styles.reflectivePrompt}>
              {selected.reflective_prompt || selected.prompt}
            </Text>

            {!journalOpen ? (
              <View style={styles.detailActions}>
                {selected.suggested_practice_template_id ? (
                  <TouchableOpacity
                    style={[styles.actionBtn]}
                    onPress={handlePractice}
                    testID="inquiry_modal_try_practice"
                  >
                    <Text style={styles.actionBtnLabel}>
                      {selected.practice_label
                        ? selected.practice_label
                        : "Try a practice"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[styles.actionBtn]}
                  onPress={() => setJournalOpen(true)}
                  testID="inquiry_modal_open_journal"
                >
                  <Text style={styles.actionBtnLabel}>Journal on this</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.journalBlock}>
                <TextInput
                  value={journalText}
                  onChangeText={(v) => setJournalText(v.slice(0, MAX_TEXT))}
                  multiline
                  textAlignVertical="top"
                  style={styles.textInput}
                  placeholder="Write what comes..."
                  placeholderTextColor="#B0B0B5"
                  testID="inquiry_modal_journal_input"
                  maxLength={MAX_TEXT}
                />
                <Text style={styles.textCounter}>
                  {journalText.length} / {MAX_TEXT}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.doneBtn,
                    journalText.trim().length < 1 ? styles.disabled : null,
                  ]}
                  disabled={journalText.trim().length < 1}
                  onPress={handleJournalDone}
                  testID="inquiry_modal_journal_done"
                >
                  <Text style={[styles.actionBtnLabel, styles.doneBtnLabel]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E2",
  },
  headerCancel: {
    fontSize: 15,
    color: "#6E6E73",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  headerSpacer: {
    width: 50,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  emptyHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    paddingVertical: 40,
  },

  categoryRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    marginVertical: 6,
  },
  categoryLabel: {
    fontSize: 15,
    color: "#1C1C1E",
  },

  anchorLine: {
    fontSize: 20,
    color: "#1C1C1E",
    lineHeight: 28,
    marginBottom: 16,
    fontWeight: "300",
  },
  reflectivePrompt: {
    fontSize: 15,
    color: "#3C3C43",
    lineHeight: 22,
    marginBottom: 24,
  },
  detailActions: {
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  actionBtnLabel: {
    fontSize: 15,
    color: "#1C1C1E",
  },
  doneBtn: {
    backgroundColor: "#1C1C1E",
    borderColor: "#1C1C1E",
    marginTop: 6,
  },
  doneBtnLabel: {
    color: "#FFFFFF",
  },
  disabled: {
    opacity: 0.35,
  },

  journalBlock: {
    marginTop: 8,
  },
  textInput: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#1C1C1E",
  },
  textCounter: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 8,
  },
});

export default InquiryModal;
