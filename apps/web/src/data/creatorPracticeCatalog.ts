import {
  CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS,
} from "../../../mobile/src/config/locales/en/CareerProsperity.js";
import {
  EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS,
} from "../../../mobile/src/config/locales/en/EmotionalHealing.js";
import {
  FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS,
} from "../../../mobile/src/config/locales/en/FocusMotivation.js";
import {
  GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS,
} from "../../../mobile/src/config/locales/en/GratitudePositivity.js";
import {
  HEALTH_WELL_BEING_MANTRASS,
  HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS,
} from "../../../mobile/src/config/locales/en/HealthWellbeing.js";
import DAILY_MANTRAS from "../../../mobile/src/config/locales/en/mantras-en.json";
import {
  PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS,
} from "../../../mobile/src/config/locales/en/PeaceCalm.js";
import {
  SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS,
} from "../../../mobile/src/config/locales/en/SpiritualGrowth.js";
import SANKALPS from "../../../mobile/src/config/locales/en/sankalps-en.json";
import { SANATAN_PRACTICES_FINAL } from "../../../mobile/src/data/sanatanPractices";

export type CreatorPracticeKind = "practice" | "mantra" | "sankalp";
export type CreatorPracticeFilter = CreatorPracticeKind | "all";

export type CreatorPracticeCategory = {
  id: string;
  label: string;
  description: string;
};

export type CreatorPracticeItem = {
  id: string;
  title: string;
  summary: string;
  type: CreatorPracticeKind;
  categoryId: string;
  categoryLabel: string;
  tags: string[];
  searchText: string;
};

type PracticeSource = {
  id?: string;
  title?: string;
  name?: string;
  text?: string;
  line?: string;
  deity?: string;
  summary?: string;
  meaning?: string;
  essence?: string | { text?: string };
  explanation?: string[] | string;
  tags?: string[];
};

type DailyMantraSource = {
  id: string;
  deity?: string;
  text?: string;
  explanation?: string[] | string;
  tags?: string[];
};

type TypeOption = {
  id: CreatorPracticeFilter;
  label: string;
};

const categoryDefinitions: CreatorPracticeCategory[] = [
  {
    id: "peace-calm",
    label: "Peace & Calm",
    description: "Practices, mantras, and sankalps to settle the mind and restore balance.",
  },
  {
    id: "focus-motivation",
    label: "Focus & Motivation",
    description: "Practices, mantras, and sankalps for attention, energy, and forward motion.",
  },
  {
    id: "emotional-healing",
    label: "Emotional Healing",
    description: "Practices, mantras, and sankalps for release, softness, and inner repair.",
  },
  {
    id: "gratitude-positivity",
    label: "Gratitude & Positivity",
    description: "Practices, mantras, and sankalps that cultivate appreciation and uplift.",
  },
  {
    id: "spiritual-growth",
    label: "Spiritual Growth",
    description: "Practices, mantras, and sankalps for devotion, wisdom, and deepening awareness.",
  },
  {
    id: "health-wellbeing",
    label: "Health & Well-Being",
    description: "Practices, mantras, and sankalps that support vitality, healing, and ease.",
  },
  {
    id: "career-prosperity",
    label: "Career & Prosperity",
    description: "Practices, mantras, and sankalps for clarity, discipline, confidence, and abundance.",
  },
  {
    id: "sanatan",
    label: "Sanatan",
    description: "Broader Sanatan practices rooted in japa, ritual, devotion, and discipline.",
  },
  {
    id: "daily-mantra",
    label: "Daily Mantra",
    description: "Daily-use mantra library from the shared JSON catalog.",
  },
  {
    id: "sankalp",
    label: "Daily Sankalp",
    description: "Short daily intentions from the shared sankalp JSON catalog.",
  },
];

export const CREATOR_PRACTICE_CATEGORIES = categoryDefinitions;

export const CREATOR_PRACTICE_TYPE_OPTIONS: TypeOption[] = [
  { id: "all", label: "All" },
  { id: "practice", label: "Practice" },
  { id: "mantra", label: "Mantra" },
  { id: "sankalp", label: "Sankalp" },
];

function normalizeSummary(item: PracticeSource) {
  if (item.summary) return item.summary;
  if (item.line) return item.line;
  if (item.meaning) return item.meaning;
  if (typeof item.essence === "string") return item.essence;
  if (item.essence?.text) return item.essence.text;
  if (Array.isArray(item.explanation)) return item.explanation[0] || "";
  if (typeof item.explanation === "string") return item.explanation;
  return "";
}

function normalizeCollection(
  items: PracticeSource[],
  categoryId: string,
  type: CreatorPracticeKind,
) {
  const categoryLabel =
    categoryDefinitions.find((category) => category.id === categoryId)?.label ||
    categoryId;

  return items.map((item) => {
    const title = item.title || item.name || item.text || "Untitled";
    const summary = normalizeSummary(item);
    const tags = Array.isArray(item.tags) ? item.tags : [];
    return {
      id: String(item.id || title),
      title,
      summary,
      type,
      categoryId,
      categoryLabel,
      tags,
      searchText: [
        title,
        summary,
        item.deity,
        tags.join(" "),
        categoryLabel,
        formatPracticeTypeLabel(type),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    } satisfies CreatorPracticeItem;
  });
}

function normalizeDailyMantras(items: DailyMantraSource[]) {
  return normalizeCollection(items, "daily-mantra", "mantra");
}

function normalizeJsonSankalps(entries: Record<string, string>) {
  const roots = Object.keys(entries)
    .filter((key) => key.endsWith(".short"))
    .map((key) => key.replace(/\.short$/, ""));

  return roots.map((root) => {
    const title = entries[`${root}.short`] || root;
    const summary =
      entries[`${root}.tooltip`] ||
      entries[`${root}.suggested`] ||
      entries[`${root}.source`] ||
      "";

    return {
      id: root.replace(/^sankalps\./, "sankalp."),
      title,
      summary,
      type: "sankalp",
      categoryId: "sankalp",
      categoryLabel: "Daily Sankalp",
      tags: [],
      searchText: `${title} ${summary} Sankalp`.toLowerCase(),
    } satisfies CreatorPracticeItem;
  });
}

export const CREATOR_PRACTICE_ITEMS: CreatorPracticeItem[] = [
  ...normalizeCollection(PEACE_CALM_PRACTICES, "peace-calm", "practice"),
  ...normalizeCollection(PEACE_CALM_MANTRAS, "peace-calm", "mantra"),
  ...normalizeCollection(PEACE_CALM_SANKALPS, "peace-calm", "sankalp"),
  ...normalizeCollection(
    FOCUS_MOTIVATION_PRACTICES,
    "focus-motivation",
    "practice",
  ),
  ...normalizeCollection(
    FOCUS_MOTIVATION_MANTRAS,
    "focus-motivation",
    "mantra",
  ),
  ...normalizeCollection(
    FOCUS_MOTIVATION_SANKALPS,
    "focus-motivation",
    "sankalp",
  ),
  ...normalizeCollection(
    EMOTIONAL_HEALING_PRACTICES,
    "emotional-healing",
    "practice",
  ),
  ...normalizeCollection(
    EMOTIONAL_HEALING_MANTRAS,
    "emotional-healing",
    "mantra",
  ),
  ...normalizeCollection(
    EMOTIONAL_HEALING_SANKALPS,
    "emotional-healing",
    "sankalp",
  ),
  ...normalizeCollection(
    GRATITUDE_POSTIVITY_PRACTICES,
    "gratitude-positivity",
    "practice",
  ),
  ...normalizeCollection(
    GRATITUDE_POSTIVITY_MANTRAS,
    "gratitude-positivity",
    "mantra",
  ),
  ...normalizeCollection(
    GRATITUDE_POSTIVITY_SANKALPS,
    "gratitude-positivity",
    "sankalp",
  ),
  ...normalizeCollection(
    SPIRITUAL_GROWTH_PRACTICES,
    "spiritual-growth",
    "practice",
  ),
  ...normalizeCollection(
    SPIRITUAL_GROWTH_MANTRAS,
    "spiritual-growth",
    "mantra",
  ),
  ...normalizeCollection(
    SPIRITUAL_GROWTH_SANKALPS,
    "spiritual-growth",
    "sankalp",
  ),
  ...normalizeCollection(
    HEALTH_WELL_BEING_PRACTICES,
    "health-wellbeing",
    "practice",
  ),
  ...normalizeCollection(
    HEALTH_WELL_BEING_MANTRASS,
    "health-wellbeing",
    "mantra",
  ),
  ...normalizeCollection(
    HEALTH_WELL_BEING_SANKALPS,
    "health-wellbeing",
    "sankalp",
  ),
  ...normalizeCollection(
    CARRER_ABUNDANCE_PRACTICES,
    "career-prosperity",
    "practice",
  ),
  ...normalizeCollection(
    CARRER_ABUNDANCE_MANTRAS,
    "career-prosperity",
    "mantra",
  ),
  ...normalizeCollection(
    CARRER_ABUNDANCE_SANKALPS,
    "career-prosperity",
    "sankalp",
  ),
  ...normalizeCollection(SANATAN_PRACTICES_FINAL, "sanatan", "practice"),
  ...normalizeDailyMantras(DAILY_MANTRAS as DailyMantraSource[]),
  ...normalizeJsonSankalps(SANKALPS as Record<string, string>),
];

export function getAvailablePracticeTypes(categoryId: string) {
  const typeSet = new Set<CreatorPracticeKind>();
  for (const item of CREATOR_PRACTICE_ITEMS) {
    if (item.categoryId === categoryId) {
      typeSet.add(item.type);
    }
  }

  return CREATOR_PRACTICE_TYPE_OPTIONS.filter(
    (option) => option.id === "all" || typeSet.has(option.id),
  );
}

export function formatPracticeTypeLabel(type?: string) {
  const normalized = String(type || "")
    .split(":")
    .pop()
    ?.trim()
    .toLowerCase();

  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
