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
  ImageBackground,
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
  onLaunchPractice: (category: InquiryCategory, templateId: string) => void;
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
      presentationStyle="overFullScreen"
      onRequestClose={onCancel}
      transparent
    >
      <View style={styles.scrim}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={styles.sheet}>
          <ImageBackground
            source={require("../../../../assets/beige_bg.png")}
            style={styles.sheetBackground}
            imageStyle={styles.sheetImage}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={styles.handle} />
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
                    <Text style={styles.anchorLine}>
                      {selected.anchor_line}
                    </Text>
                  ) : null}
                  <Text style={styles.reflectivePrompt}>
                    {selected.reflective_prompt || selected.prompt}
                  </Text>

                  {!journalOpen ? (
                    <View style={styles.detailActions}>
                      {selected.suggested_practice_template_id ? (
                        <TouchableOpacity
                          style={styles.primaryAction}
                          onPress={handlePractice}
                          testID="inquiry_modal_try_practice"
                        >
                          <Text style={styles.primaryActionLabel}>
                            {selected.practice_label
                              ? selected.practice_label
                              : "Try a practice"}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        style={styles.primaryAction}
                        onPress={() => setJournalOpen(true)}
                        testID="inquiry_modal_open_journal"
                      >
                        <Text style={styles.primaryActionLabel}>
                          Journal on this
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.journalBlock}>
                      <TextInput
                        value={journalText}
                        onChangeText={(v) =>
                          setJournalText(v.slice(0, MAX_TEXT))
                        }
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
                          styles.primaryAction,
                          journalText.trim().length < 1
                            ? styles.disabled
                            : null,
                        ]}
                        disabled={journalText.trim().length < 1}
                        onPress={handleJournalDone}
                        testID="inquiry_modal_journal_done"
                      >
                        <Text style={styles.primaryActionLabel}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              )}
            </KeyboardAvoidingView>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  sheetBackground: {
    width: "100%",
  },
  sheetImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E2",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  headerCancel: {
    fontSize: 15,
    color: "#6E6E73",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#432104",
    alignSelf: "center",
  },
  headerSpacer: {
    width: 50,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
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
    borderRadius: 28,
    borderWidth: 0.4,
    borderColor: "#c89a47",
    marginVertical: 6,
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#432104",
  },

  anchorLine: {
    fontSize: 16,
    color: "#432104",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 16,
    fontWeight: "300",
  },
  reflectivePrompt: {
    fontSize: 15,
    color: "#432104",
    textAlign: "center",

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
    color: "#432104",
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
  primaryAction: {
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    borderWidth: 0.3,
    borderRadius: 15,
    padding: 15,
    elevation: 6,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 10,
  },
  primaryActionLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#432104",
    textAlign: "center",
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
    color: "#432104",
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
