import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../theme/colors";
import { Fonts } from "../theme/fonts";

const ITEM_H = 48;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS: readonly string[] = ["AM", "PM"];

function parseTime(timeStr: string | null): [number, number, number] {
  if (!timeStr) return [6, 0, 0]; // 07:00 AM
  const parts = timeStr.split(":");
  const hh = parseInt(parts[0] ?? "7", 10);
  const mm = parseInt(parts[1] ?? "0", 10);
  if (isNaN(hh) || isNaN(mm)) return [6, 0, 0];
  const pi = hh >= 12 ? 1 : 0;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  const hi = HOURS.indexOf(String(h12).padStart(2, "0"));
  const rounded = Math.round(mm / 5) * 5 % 60;
  const mi = MINUTES.indexOf(String(rounded).padStart(2, "0"));
  return [hi !== -1 ? hi : 6, mi !== -1 ? mi : 0, pi];
}

function buildTime(hi: number, mi: number, pi: number): string {
  let h = parseInt(HOURS[hi] ?? "7", 10);
  if (PERIODS[pi] === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${MINUTES[mi] ?? "00"}:00`;
}

interface ColProps {
  items: readonly string[];
  initial: number;
  onChange: (i: number) => void;
  width: number;
}

function Col({ items, initial, onChange, width }: ColProps) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: initial * ITEM_H, animated: false });
    }, 40);
    return () => clearTimeout(t);
  }, []); // intentionally run once on mount

  return (
    <ScrollView
      ref={ref}
      style={{ width, height: PICKER_H }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
      onMomentumScrollEnd={(e) => {
        const idx = Math.max(
          0,
          Math.min(Math.round(e.nativeEvent.contentOffset.y / ITEM_H), items.length - 1),
        );
        onChange(idx);
      }}
    >
      {items.map((label, i) => (
        <View key={i} style={s.colItem}>
          <Text style={s.colLabel}>{label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

interface Props {
  visible: boolean;
  initialTime: string | null;
  onConfirm: (timeStr: string) => void;
  onCancel: () => void;
}

export function TimePickerModal({ visible, initialTime, onConfirm, onCancel }: Props) {
  const [hi, setHi] = useState(6);
  const [mi, setMi] = useState(0);
  const [pi, setPi] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const prevVisible = useRef(false);

  useEffect(() => {
    if (visible && !prevVisible.current) {
      const [nh, nm, np] = parseTime(initialTime);
      setHi(nh);
      setMi(nm);
      setPi(np);
      setOpenCount((c) => c + 1);
    }
    prevVisible.current = visible;
  }, [visible, initialTime]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <TouchableOpacity activeOpacity={1} style={s.backdrop} onPress={onCancel} />
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onCancel} hitSlop={8} style={s.headerBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Set time</Text>
            <TouchableOpacity
              onPress={() => onConfirm(buildTime(hi, mi, pi))}
              hitSlop={8}
              style={s.headerBtn}
            >
              <Text style={s.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Picker wheels */}
          <View style={s.wheelsWrap}>
            {/* Gold selection band */}
            <View style={s.band} pointerEvents="none" />

            <Col key={`h-${openCount}`} items={HOURS} initial={hi} onChange={setHi} width={72} />
            <Text style={s.colon}>:</Text>
            <Col key={`m-${openCount}`} items={MINUTES} initial={mi} onChange={setMi} width={72} />
            <Col key={`p-${openCount}`} items={PERIODS} initial={pi} onChange={setPi} width={64} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  sheet: {
    backgroundColor: Colors.parchment,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.goldHairline,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201,168,76,0.15)",
  },
  headerBtn: {
    minWidth: 64,
  },
  headerTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: Colors.brownDeep,
    textAlign: "center",
    flex: 1,
  },
  cancelText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: Colors.brownMuted,
  },
  doneText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.goldBright,
    textAlign: "right",
  },
  wheelsWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PICKER_H,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  band: {
    position: "absolute",
    left: 20,
    right: 20,
    height: ITEM_H,
    top: (PICKER_H - ITEM_H) / 2,
    backgroundColor: "rgba(201,168,76,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.28)",
  },
  colon: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 24,
    color: Colors.brownDeep,
    marginHorizontal: 2,
    lineHeight: ITEM_H,
  },
  colItem: {
    height: ITEM_H,
    alignItems: "center",
    justifyContent: "center",
  },
  colLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 22,
    color: Colors.brownDeep,
    letterSpacing: 0.5,
  },
});
