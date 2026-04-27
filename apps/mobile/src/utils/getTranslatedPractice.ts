import i18n from "../config/i18n";
import { CATALOGS } from "../data/mantras";

// Localized JSON imports for Master Lists (following Vue pattern)
import sankalpsEn from "../config/locales/en/sankalps-en.json";
import sankalpsHi from "../config/locales/hi/sankalps-hi.json";
import sankalpsTe from "../config/locales/te/sankalps-te.json";
import sankalpsTa from "../config/locales/ta/sankalps-ta.json";
import sankalpsGu from "../config/locales/gu/sankalps-gu.json";
import sankalpsKn from "../config/locales/kn/sankalps-kn.json";
import sankalpsMl from "../config/locales/ml/sankalps-ml.json";
import sankalpsMr from "../config/locales/mr/sankalps-mr.json";
import sankalpsOr from "../config/locales/or/sankalps-or.json";
import sankalpsBn from "../config/locales/bn/sankalps-bn.json";

import practicesEn from "../config/locales/en/practices-en.json";
import practicesHi from "../config/locales/hi/practices-hi.json";
import practicesTe from "../config/locales/te/practices-te.json";
import practicesTa from "../config/locales/ta/practices-ta.json";
import practicesGu from "../config/locales/gu/practices-gu.json";
import practicesKn from "../config/locales/kn/practices-kn.json";
import practicesMl from "../config/locales/ml/practices-ml.json";
import practicesMr from "../config/locales/mr/practices-mr.json";
import practicesOr from "../config/locales/or/practices-or.json";
import practicesBn from "../config/locales/bn/practices-bn.json";

const LOCALE_DATA: Record<string, any> = {
  sankalps: {
    en: sankalpsEn,
    hi: sankalpsHi,
    te: sankalpsTe,
    ta: sankalpsTa,
    gu: sankalpsGu,
    kn: sankalpsKn,
    ml: sankalpsMl,
    mr: sankalpsMr,
    or: sankalpsOr,
    bn: sankalpsBn,
  },
  practices: {
    en: practicesEn,
    hi: practicesHi,
    te: practicesTe,
    ta: practicesTa,
    gu: practicesGu,
    kn: practicesKn,
    ml: practicesMl,
    mr: practicesMr,
    or: practicesOr,
    bn: practicesBn,
  },
};

import { SANATAN_PRACTICES_FINAL } from "../data/sanatanPractices";

// Import category mantras (EN)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_EN } from "../config/locales/en/PeaceCalm";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_EN } from "../config/locales/en/CareerProsperity";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_EN } from "../config/locales/en/EmotionalHealing";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_EN } from "../config/locales/en/FocusMotivation";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_EN } from "../config/locales/en/GratitudePositivity";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_EN } from "../config/locales/en/HealthWellbeing";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_EN } from "../config/locales/en/SpiritualGrowth";

// Import category sankalps (EN)
import { PEACE_CALM_SANKALPS as PC_SANKALPS_EN } from "../config/locales/en/PeaceCalm";
import { CARRER_ABUNDANCE_SANKALPS as CP_SANKALPS_EN } from "../config/locales/en/CareerProsperity";
import { EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_EN } from "../config/locales/en/EmotionalHealing";
import { FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_EN } from "../config/locales/en/FocusMotivation";
import { GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_EN } from "../config/locales/en/GratitudePositivity";
import { HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_EN } from "../config/locales/en/HealthWellbeing";
import { SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_EN } from "../config/locales/en/SpiritualGrowth";

// Import category practices (EN)
import { PEACE_CALM_PRACTICES as PC_PRACTICES_EN } from "../config/locales/en/PeaceCalm";
import { CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_EN } from "../config/locales/en/CareerProsperity";
import { EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_EN } from "../config/locales/en/EmotionalHealing";
import { FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_EN } from "../config/locales/en/FocusMotivation";
import { GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_EN } from "../config/locales/en/GratitudePositivity";
import { HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_EN } from "../config/locales/en/HealthWellbeing";
import { SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_EN } from "../config/locales/en/SpiritualGrowth";

// Import category mantras (HI)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_HI } from "../config/locales/hi/PeaceCalm-hi";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_HI } from "../config/locales/hi/CareerProsperity-hi";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_HI } from "../config/locales/hi/EmotionalHealing-hi";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_HI } from "../config/locales/hi/FocusMotivation-hi";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_HI } from "../config/locales/hi/GratitudePositivity-hi";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_HI } from "../config/locales/hi/HealthWellbeing-hi";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_HI } from "../config/locales/hi/SpiritualGrowth-hi";

// Import category mantras (TE)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_TE } from "../config/locales/te/PeaceClam-te";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_TE } from "../config/locales/te/CareerProsperity-te";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_TE } from "../config/locales/te/EmotionalHealing-te";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_TE } from "../config/locales/te/FocusMotivation-te";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_TE } from "../config/locales/te/GratitudePositivity-te";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_TE } from "../config/locales/te/HealthWellbeing-te";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_TE } from "../config/locales/te/SpiritualGrowth-te";

// Import category sankalps (HI)
import { PEACE_CALM_SANKALPS as PC_SANKALPS_HI } from "../config/locales/hi/PeaceCalm-hi";
import { CARRER_ABUNDANCE_SANKALPS as CP_SANKALPS_HI } from "../config/locales/hi/CareerProsperity-hi";
import { EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_HI } from "../config/locales/hi/EmotionalHealing-hi";
import { FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_HI } from "../config/locales/hi/FocusMotivation-hi";
import { GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_HI } from "../config/locales/hi/GratitudePositivity-hi";
import { HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_HI } from "../config/locales/hi/HealthWellbeing-hi";
import { SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_HI } from "../config/locales/hi/SpiritualGrowth-hi";

// Import category sankalps (TE)
import { PEACE_CALM_SANKALPS as PC_SANKALPS_TE } from "../config/locales/te/PeaceClam-te";
import { CARRER_ABUNDANCE_SANKALPS as CP_SANKALPS_TE } from "../config/locales/te/CareerProsperity-te";
import { EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_TE } from "../config/locales/te/EmotionalHealing-te";
import { FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_TE } from "../config/locales/te/FocusMotivation-te";
import { GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_TE } from "../config/locales/te/GratitudePositivity-te";
import { HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_TE } from "../config/locales/te/HealthWellbeing-te";
import { SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_TE } from "../config/locales/te/SpiritualGrowth-te";

// Import category practices (HI)
import { PEACE_CALM_PRACTICES as PC_PRACTICES_HI } from "../config/locales/hi/PeaceCalm-hi";
import { CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_HI } from "../config/locales/hi/CareerProsperity-hi";
import { EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_HI } from "../config/locales/hi/EmotionalHealing-hi";
import { FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_HI } from "../config/locales/hi/FocusMotivation-hi";
import { GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_HI } from "../config/locales/hi/GratitudePositivity-hi";
import { HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_HI } from "../config/locales/hi/HealthWellbeing-hi";
import { SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_HI } from "../config/locales/hi/SpiritualGrowth-hi";

// Import category practices (TE)
import { PEACE_CALM_PRACTICES as PC_PRACTICES_TE } from "../config/locales/te/PeaceClam-te";
import { CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_TE } from "../config/locales/te/CareerProsperity-te";
import { EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_TE } from "../config/locales/te/EmotionalHealing-te";
import { FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_TE } from "../config/locales/te/FocusMotivation-te";
import { GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_TE } from "../config/locales/te/GratitudePositivity-te";
import { HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_TE } from "../config/locales/te/HealthWellbeing-te";
import { SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_TE } from "../config/locales/te/SpiritualGrowth-te";

// Import category arrays (TA)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_TA, PEACE_CALM_SANKALPS_TA as PC_SANKALPS_TA, PEACE_CALM_PRACTICES as PC_PRACTICES_TA } from "../config/locales/ta/PeaceCalm-ta";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_TA, CARRER_ABUNDANCE_SANKALPS_TAMIL as CP_SANKALPS_TA, CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_TA } from "../config/locales/ta/CareerProsperity-ta";
import { EMOTIONAL_HEALING_MANTRAS_TA as EH_MANTRAS_TA, EMOTIONAL_HEALING_SANKALPS_TA as EH_SANKALPS_TA, EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_TA } from "../config/locales/ta/EmotionalHealing-ta";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_TA, FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_TA, FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_TA } from "../config/locales/ta/FocusMotivation-ta";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_TA, GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_TA, GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_TA } from "../config/locales/ta/GratitudePositivity-ta";
import { HEALTH_WELL_BEING_MANTRASS_TA as HW_MANTRAS_TA, HEALTH_WELL_BEING_SANKALPS_TA as HW_SANKALPS_TA, HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_TA } from "../config/locales/ta/HealthWellbeing-ta";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_TA, SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_TA, SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_TA } from "../config/locales/ta/SpiritualGrowth-ta";

// Import category arrays (GU)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_GU, PEACE_CALM_SANKALPS as PC_SANKALPS_GU, PEACE_CALM_PRACTICES as PC_PRACTICES_GU } from "../config/locales/gu/PeaceClam-gu";
import { CARRER_ABUNDANCE_MANTRAS_GU_PART1 as CP_MANTRAS_GU, CARRER_ABUNDANCE_SANKALPS_GUJARATI as CP_SANKALPS_GU, CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_GU } from "../config/locales/gu/CareerProsperity-gu";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_GU, EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_GU, EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_GU } from "../config/locales/gu/EmotionalHealing-gu";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_GU, FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_GU, FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_GU } from "../config/locales/gu/FocusMotivation-gu";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_GU, GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_GU, GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_GU } from "../config/locales/gu/GratitudePositivity-gu";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_GU, HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_GU, HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_GU } from "../config/locales/gu/HealthWellbeing-gu";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_GU, SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_GU, SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_GU } from "../config/locales/gu/SpiritualGrowth-gu";

// Import category arrays (KN)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_KN, PEACE_CALM_SANKALPS_KN as PC_SANKALPS_KN, PEACE_CALM_PRACTICES as PC_PRACTICES_KN } from "../config/locales/kn/PeaceClam-kn";
import { CARRER_ABUNDANCE_MANTRAS_KN_PART1 as CP_MANTRAS_KN, CARRER_ABUNDANCE_SANKALPS_KANNADA as CP_SANKALPS_KN, CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_KN } from "../config/locales/kn/CareerProsperity-kn";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_KN, EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_KN, EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_KN } from "../config/locales/kn/EmotionalHealing-kn";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_KN, FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_KN, FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_KN } from "../config/locales/kn/FocusMotivation-kn";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_KN, GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_KN, GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_KN } from "../config/locales/kn/GratitudePositivity-kn";
import { HEALTH_WELL_BEING_MANTRASS_KN as HW_MANTRAS_KN, HEALTH_WELL_BEING_SANKALPS_KN as HW_SANKALPS_KN, HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_KN } from "../config/locales/kn/HealthWellbeing-kn";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_KN, SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_KN, SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_KN } from "../config/locales/kn/SpiritualGrowth-kn";

// Import category arrays (ML)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_ML, PEACE_CALM_SANKALPS as PC_SANKALPS_ML, PEACE_CALM_PRACTICES as PC_PRACTICES_ML } from "../config/locales/ml/PeaceClam-ml";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_ML, CARRER_ABUNDANCE_SANKALPS_MALAYALAM as CP_SANKALPS_ML, CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_ML } from "../config/locales/ml/CareerProsperity-ml";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_ML, EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_ML, EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_ML } from "../config/locales/ml/EmotionalHealing-ml";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_ML, FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_ML, FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_ML } from "../config/locales/ml/FocusMotivation-ml";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_ML, GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_ML, GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_ML } from "../config/locales/ml/GratitudePositivity-ml";
import { HEALTH_WELL_BEING_MANTRASS_ML as HW_MANTRAS_ML, HEALTH_WELL_BEING_SANKALPS_ML as HW_SANKALPS_ML, HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_ML } from "../config/locales/ml/HealthWellbeing-ml";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_ML, SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_ML, SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_ML } from "../config/locales/ml/SpiritualGrowth-ml";

// Import category arrays (MR)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_MR, PEACE_CALM_SANKALPS as PC_SANKALPS_MR, PEACE_CALM_PRACTICES as PC_PRACTICES_MR } from "../config/locales/mr/PeaceClam-mr";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_MR, CARRER_ABUNDANCE_SANKALPS as CP_SANKALPS_MR, CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_MR } from "../config/locales/mr/CareerProsperity-mr";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_MR, EMOTIONAL_HEALING_SANKALPS_MR as EH_SANKALPS_MR, EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_MR } from "../config/locales/mr/EmotionalHealing-mr";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_MR, FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_MR, FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_MR } from "../config/locales/mr/FocusMotivation-mr";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_MR, GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_MR, GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_MR } from "../config/locales/mr/GratitudePositivity-mr";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_MR, HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_MR, HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_MR } from "../config/locales/mr/HealthWellbeing-mr";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_MR, SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_MR, SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_MR } from "../config/locales/mr/SpiritualGrowth-mr";

// Import category arrays (OR)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_OR, PEACE_CALM_SANKALPS as PC_SANKALPS_OR, PEACE_CALM_PRACTICES as PC_PRACTICES_OR } from "../config/locales/or/PeaceClam-or";
import { CARRER_ABUNDANCE_MANTRAS_OD_PART1 as CP_MANTRAS_OR, CARRER_ABUNDANCE_SANKALPS_ODIA as CP_SANKALPS_OR, CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_OR } from "../config/locales/or/CareerProsperity-or";
import { EMOTIONAL_HEALING_MANTRAS_OR as EH_MANTRAS_OR, EMOTIONAL_HEALING_SANKALPS_OR as EH_SANKALPS_OR, EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_OR } from "../config/locales/or/EmotionalHealing-or";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_OR, FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_OR, FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_OR } from "../config/locales/or/FocusMotivation-or";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_OR, GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_OR, GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_OR } from "../config/locales/or/GratitudePositivity-or";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_OR, HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_OR, HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_OR } from "../config/locales/or/HealthWellbeing-or";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_OR, SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_OR, SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_OR } from "../config/locales/or/SpiritualGrowth-or";

// Import category arrays (BN)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_BN, PEACE_CALM_SANKALPS as PC_SANKALPS_BN, PEACE_CALM_PRACTICES as PC_PRACTICES_BN } from "../config/locales/bn/PeaceClam-bn";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_BN, CARRER_ABUNDANCE_SANKALPS as CP_SANKALPS_BN, CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_BN } from "../config/locales/bn/CareerProsperity-bn";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_BN, EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_BN, EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_BN } from "../config/locales/bn/EmotionalHealing-bn";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_BN, FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_BN, FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_BN } from "../config/locales/bn/FocusMotivation-bn";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_BN, GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_BN, GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_BN } from "../config/locales/bn/GratitudePositivity-bn";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_BN, HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_BN, HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_BN } from "../config/locales/bn/HealthWellbeing-bn";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_BN, SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_BN, SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_BN } from "../config/locales/bn/SpiritualGrowth-bn";

// Merge category mantras
const CATEGORY_MANTRAS_EN = [
  ...(PC_MANTRAS_EN || []),
  ...(CP_MANTRAS_EN || []),
  ...(EH_MANTRAS_EN || []),
  ...(FM_MANTRAS_EN || []),
  ...(GP_MANTRAS_EN || []),
  ...(HW_MANTRAS_EN || []),
  ...(SG_MANTRAS_EN || []),
];

const CATEGORY_MANTRAS_HI = [
  ...(PC_MANTRAS_HI || []),
  ...(CP_MANTRAS_HI || []),
  ...(EH_MANTRAS_HI || []),
  ...(FM_MANTRAS_HI || []),
  ...(GP_MANTRAS_HI || []),
  ...(HW_MANTRAS_HI || []),
  ...(SG_MANTRAS_HI || []),
];

const CATEGORY_MANTRAS_TE = [
  ...(PC_MANTRAS_TE || []),
  ...(CP_MANTRAS_TE || []),
  ...(EH_MANTRAS_TE || []),
  ...(FM_MANTRAS_TE || []),
  ...(GP_MANTRAS_TE || []),
  ...(HW_MANTRAS_TE || []),
  ...(SG_MANTRAS_TE || []),
];

// Merge category sankalps
const CATEGORY_SANKALPS_EN = [
  ...(PC_SANKALPS_EN || []),
  ...(CP_SANKALPS_EN || []),
  ...(EH_SANKALPS_EN || []),
  ...(FM_SANKALPS_EN || []),
  ...(GP_SANKALPS_EN || []),
  ...(HW_SANKALPS_EN || []),
  ...(SG_SANKALPS_EN || []),
];

const CATEGORY_SANKALPS_HI = [
  ...(PC_SANKALPS_HI || []),
  ...(CP_SANKALPS_HI || []),
  ...(EH_SANKALPS_HI || []),
  ...(FM_SANKALPS_HI || []),
  ...(GP_SANKALPS_HI || []),
  ...(HW_SANKALPS_HI || []),
  ...(SG_SANKALPS_HI || []),
];

const CATEGORY_SANKALPS_TE = [
  ...(PC_SANKALPS_TE || []),
  ...(CP_SANKALPS_TE || []),
  ...(EH_SANKALPS_TE || []),
  ...(FM_SANKALPS_TE || []),
  ...(GP_SANKALPS_TE || []),
  ...(HW_SANKALPS_TE || []),
  ...(SG_SANKALPS_TE || []),
];

// Merge category practices
const CATEGORY_PRACTICES_EN = [
  ...(PC_PRACTICES_EN || []),
  ...(CP_PRACTICES_EN || []),
  ...(EH_PRACTICES_EN || []),
  ...(FM_PRACTICES_EN || []),
  ...(GP_PRACTICES_EN || []),
  ...(HW_PRACTICES_EN || []),
  ...(SG_PRACTICES_EN || []),
];

const CATEGORY_PRACTICES_HI = [
  ...(PC_PRACTICES_HI || []),
  ...(CP_PRACTICES_HI || []),
  ...(EH_PRACTICES_HI || []),
  ...(FM_PRACTICES_HI || []),
  ...(GP_PRACTICES_HI || []),
  ...(HW_PRACTICES_HI || []),
  ...(SG_PRACTICES_HI || []),
];

const CATEGORY_PRACTICES_TE = [
  ...(PC_PRACTICES_TE || []),
  ...(CP_PRACTICES_TE || []),
  ...(EH_PRACTICES_TE || []),
  ...(FM_PRACTICES_TE || []),
  ...(GP_PRACTICES_TE || []),
  ...(HW_PRACTICES_TE || []),
  ...(SG_PRACTICES_TE || []),
];

// Helper to create category arrays for any language
const createCategoryArrays = (prefix: string) => {
  // Use evaluation logic to avoid repetition if possible, but static for safety in TS
  // We'll define them explicitly to avoid 'any' or complex mapping
  return {
    mantras: [],
    sankalps: [],
    practices: []
  };
};

const CATEGORY_MANTRAS_TA = [...(PC_MANTRAS_TA || []), ...(CP_MANTRAS_TA || []), ...(EH_MANTRAS_TA || []), ...(FM_MANTRAS_TA || []), ...(GP_MANTRAS_TA || []), ...(HW_MANTRAS_TA || []), ...(SG_MANTRAS_TA || [])];
const CATEGORY_SANKALPS_TA = [...(PC_SANKALPS_TA || []), ...(CP_SANKALPS_TA || []), ...(EH_SANKALPS_TA || []), ...(FM_SANKALPS_TA || []), ...(GP_SANKALPS_TA || []), ...(HW_SANKALPS_TA || []), ...(SG_SANKALPS_TA || [])];
const CATEGORY_PRACTICES_TA = [...(PC_PRACTICES_TA || []), ...(CP_PRACTICES_TA || []), ...(EH_PRACTICES_TA || []), ...(FM_PRACTICES_TA || []), ...(GP_PRACTICES_TA || []), ...(HW_PRACTICES_TA || []), ...(SG_PRACTICES_TA || [])];

const CATEGORY_MANTRAS_GU = [...(PC_MANTRAS_GU || []), ...(CP_MANTRAS_GU || []), ...(EH_MANTRAS_GU || []), ...(FM_MANTRAS_GU || []), ...(GP_MANTRAS_GU || []), ...(HW_MANTRAS_GU || []), ...(SG_MANTRAS_GU || [])];
const CATEGORY_SANKALPS_GU = [...(PC_SANKALPS_GU || []), ...(CP_SANKALPS_GU || []), ...(EH_SANKALPS_GU || []), ...(FM_SANKALPS_GU || []), ...(GP_SANKALPS_GU || []), ...(HW_SANKALPS_GU || []), ...(SG_SANKALPS_GU || [])];
const CATEGORY_PRACTICES_GU = [...(PC_PRACTICES_GU || []), ...(CP_PRACTICES_GU || []), ...(EH_PRACTICES_GU || []), ...(FM_PRACTICES_GU || []), ...(GP_PRACTICES_GU || []), ...(HW_PRACTICES_GU || []), ...(SG_PRACTICES_GU || [])];

const CATEGORY_MANTRAS_KN = [...(PC_MANTRAS_KN || []), ...(CP_MANTRAS_KN || []), ...(EH_MANTRAS_KN || []), ...(FM_MANTRAS_KN || []), ...(GP_MANTRAS_KN || []), ...(HW_MANTRAS_KN || []), ...(SG_MANTRAS_KN || [])];
const CATEGORY_SANKALPS_KN = [...(PC_SANKALPS_KN || []), ...(CP_SANKALPS_KN || []), ...(EH_SANKALPS_KN || []), ...(FM_SANKALPS_KN || []), ...(GP_SANKALPS_KN || []), ...(HW_SANKALPS_KN || []), ...(SG_SANKALPS_KN || [])];
const CATEGORY_PRACTICES_KN = [...(PC_PRACTICES_KN || []), ...(CP_PRACTICES_KN || []), ...(EH_PRACTICES_KN || []), ...(FM_PRACTICES_KN || []), ...(GP_PRACTICES_KN || []), ...(HW_PRACTICES_KN || []), ...(SG_PRACTICES_KN || [])];

const CATEGORY_MANTRAS_ML = [...(PC_MANTRAS_ML || []), ...(CP_MANTRAS_ML || []), ...(EH_MANTRAS_ML || []), ...(FM_MANTRAS_ML || []), ...(GP_MANTRAS_ML || []), ...(HW_MANTRAS_ML || []), ...(SG_MANTRAS_ML || [])];
const CATEGORY_SANKALPS_ML = [...(PC_SANKALPS_ML || []), ...(CP_SANKALPS_ML || []), ...(EH_SANKALPS_ML || []), ...(FM_SANKALPS_ML || []), ...(GP_SANKALPS_ML || []), ...(HW_SANKALPS_ML || []), ...(SG_SANKALPS_ML || [])];
const CATEGORY_PRACTICES_ML = [...(PC_PRACTICES_ML || []), ...(CP_PRACTICES_ML || []), ...(EH_PRACTICES_ML || []), ...(FM_PRACTICES_ML || []), ...(GP_PRACTICES_ML || []), ...(HW_PRACTICES_ML || []), ...(SG_PRACTICES_ML || [])];

const CATEGORY_MANTRAS_MR = [...(PC_MANTRAS_MR || []), ...(CP_MANTRAS_MR || []), ...(EH_MANTRAS_MR || []), ...(FM_MANTRAS_MR || []), ...(GP_MANTRAS_MR || []), ...(HW_MANTRAS_MR || []), ...(SG_MANTRAS_MR || [])];
const CATEGORY_SANKALPS_MR = [...(PC_SANKALPS_MR || []), ...(CP_SANKALPS_MR || []), ...(EH_SANKALPS_MR || []), ...(FM_SANKALPS_MR || []), ...(GP_SANKALPS_MR || []), ...(HW_SANKALPS_MR || []), ...(SG_SANKALPS_MR || [])];
const CATEGORY_PRACTICES_MR = [...(PC_PRACTICES_MR || []), ...(CP_PRACTICES_MR || []), ...(EH_PRACTICES_MR || []), ...(FM_PRACTICES_MR || []), ...(GP_PRACTICES_MR || []), ...(HW_PRACTICES_MR || []), ...(SG_PRACTICES_MR || [])];

const CATEGORY_MANTRAS_OR = [...(PC_MANTRAS_OR || []), ...(CP_MANTRAS_OR || []), ...(EH_MANTRAS_OR || []), ...(FM_MANTRAS_OR || []), ...(GP_MANTRAS_OR || []), ...(HW_MANTRAS_OR || []), ...(SG_MANTRAS_OR || [])];
const CATEGORY_SANKALPS_OR = [...(PC_SANKALPS_OR || []), ...(CP_SANKALPS_OR || []), ...(EH_SANKALPS_OR || []), ...(FM_SANKALPS_OR || []), ...(GP_SANKALPS_OR || []), ...(HW_SANKALPS_OR || []), ...(SG_SANKALPS_OR || [])];
const CATEGORY_PRACTICES_OR = [...(PC_PRACTICES_OR || []), ...(CP_PRACTICES_OR || []), ...(EH_PRACTICES_OR || []), ...(FM_PRACTICES_OR || []), ...(GP_PRACTICES_OR || []), ...(HW_PRACTICES_OR || []), ...(SG_PRACTICES_OR || [])];

const CATEGORY_MANTRAS_BN = [...(PC_MANTRAS_BN || []), ...(CP_MANTRAS_BN || []), ...(EH_MANTRAS_BN || []), ...(FM_MANTRAS_BN || []), ...(GP_MANTRAS_BN || []), ...(HW_MANTRAS_BN || []), ...(SG_MANTRAS_BN || [])];
const CATEGORY_SANKALPS_BN = [...(PC_SANKALPS_BN || []), ...(CP_SANKALPS_BN || []), ...(EH_SANKALPS_BN || []), ...(FM_SANKALPS_BN || []), ...(GP_SANKALPS_BN || []), ...(HW_SANKALPS_BN || []), ...(SG_SANKALPS_BN || [])];
const CATEGORY_PRACTICES_BN = [...(PC_PRACTICES_BN || []), ...(CP_PRACTICES_BN || []), ...(EH_PRACTICES_BN || []), ...(FM_PRACTICES_BN || []), ...(GP_PRACTICES_BN || []), ...(HW_PRACTICES_BN || []), ...(SG_PRACTICES_BN || [])];

// Combined mantra catalogs (main + category)
const COMBINED_MANTRAS: Record<string, any[]> = {
  en: [...(CATALOGS.en || []), ...CATEGORY_MANTRAS_EN],
  hi: [...(CATALOGS.hi || []), ...CATEGORY_MANTRAS_HI],
  te: [...(CATALOGS.te || []), ...CATEGORY_MANTRAS_TE],
  ta: [...(CATALOGS.ta || []), ...CATEGORY_MANTRAS_TA],
  gu: [...(CATALOGS.gu || []), ...CATEGORY_MANTRAS_GU],
  kn: [...(CATALOGS.kn || []), ...CATEGORY_MANTRAS_KN],
  ml: [...(CATALOGS.ml || []), ...CATEGORY_MANTRAS_ML],
  mr: [...(CATALOGS.mr || []), ...CATEGORY_MANTRAS_MR],
  or: [...(CATALOGS.or || []), ...CATEGORY_MANTRAS_OR],
  bn: [...(CATALOGS.bn || []), ...CATEGORY_MANTRAS_BN],
};

// Combined sankalp catalogs (category only for now)
const COMBINED_SANKALPS: Record<string, any[]> = {
  en: CATEGORY_SANKALPS_EN,
  hi: CATEGORY_SANKALPS_HI,
  te: CATEGORY_SANKALPS_TE,
  ta: CATEGORY_SANKALPS_TA,
  gu: CATEGORY_SANKALPS_GU,
  kn: CATEGORY_SANKALPS_KN,
  ml: CATEGORY_SANKALPS_ML,
  mr: CATEGORY_SANKALPS_MR,
  or: CATEGORY_SANKALPS_OR,
  bn: CATEGORY_SANKALPS_BN,
};

// Combined practice catalogs (category only for now)
const COMBINED_PRACTICES: Record<string, any[]> = {
  en: CATEGORY_PRACTICES_EN,
  hi: CATEGORY_PRACTICES_HI,
  te: CATEGORY_PRACTICES_TE,
  ta: CATEGORY_PRACTICES_TA,
  gu: CATEGORY_PRACTICES_GU,
  kn: CATEGORY_PRACTICES_KN,
  ml: CATEGORY_PRACTICES_ML,
  mr: CATEGORY_PRACTICES_MR,
  or: CATEGORY_PRACTICES_OR,
  bn: CATEGORY_PRACTICES_BN,
};

// 🌟 UNIVERSAL CATALOG - Combines EVERYTHING for ID-based search
const UNIVERSAL_MANTRAS: Record<string, any[]> = {
  en: CATEGORY_MANTRAS_EN,
  hi: CATEGORY_MANTRAS_HI,
  te: CATEGORY_MANTRAS_TE,
  ta: CATEGORY_MANTRAS_TA,
  gu: CATEGORY_MANTRAS_GU,
  kn: CATEGORY_MANTRAS_KN,
  ml: CATEGORY_MANTRAS_ML,
  mr: CATEGORY_MANTRAS_MR,
  or: CATEGORY_MANTRAS_OR,
  bn: CATEGORY_MANTRAS_BN,
};

const UNIVERSAL_SANKALPS: Record<string, any[]> = {
  en: CATEGORY_SANKALPS_EN,
  hi: CATEGORY_SANKALPS_HI,
  te: CATEGORY_SANKALPS_TE,
  ta: CATEGORY_SANKALPS_TA,
  gu: CATEGORY_SANKALPS_GU,
  kn: CATEGORY_SANKALPS_KN,
  ml: CATEGORY_SANKALPS_ML,
  mr: CATEGORY_SANKALPS_MR,
  or: CATEGORY_SANKALPS_OR,
  bn: CATEGORY_SANKALPS_BN,
};

const UNIVERSAL_PRACTICES: Record<string, any[]> = {
  en: CATEGORY_PRACTICES_EN,
  hi: CATEGORY_PRACTICES_HI,
  te: CATEGORY_PRACTICES_TE,
  ta: CATEGORY_PRACTICES_TA,
  gu: CATEGORY_PRACTICES_GU,
  kn: CATEGORY_PRACTICES_KN,
  ml: CATEGORY_PRACTICES_ML,
  mr: CATEGORY_PRACTICES_MR,
  or: CATEGORY_PRACTICES_OR,
  bn: CATEGORY_PRACTICES_BN,
};

const UNIVERSAL_CATALOG: Record<string, any[]> = {};
const ALL_SUPPORTED_LANGS = ['en', 'hi', 'te', 'ta', 'gu', 'kn', 'ml', 'mr', 'or', 'bn'];

ALL_SUPPORTED_LANGS.forEach((lang) => {
  UNIVERSAL_CATALOG[lang] = [
    ...(UNIVERSAL_MANTRAS[lang] || []),
    ...(CATALOGS[lang] || []),
    ...(UNIVERSAL_SANKALPS[lang] || []),
    ...(UNIVERSAL_PRACTICES[lang] || []),
    ...SANATAN_PRACTICES_FINAL,
  ];
});

export const getTranslatedPractice = (p: any, t: any) => {
  if (!p) return { name: "", desc: "", mantra: "", meaning: "" };

  const langKey = String(i18n.language || "en").split("-")[0].toLowerCase();

  // 🔹 Flatten nested details (API sometimes nests 3–5 levels deep)
  let details = p.details;
  while (details?.details) {
    details = details.details;
  }
  const item = { ...p, ...details };

  // 🌟 UNIVERSAL SEARCH - Try finding in universal catalog first (by ID only)
  const universalCatalog = UNIVERSAL_CATALOG[langKey] || UNIVERSAL_CATALOG.en;
  const searchId = item.practice_id || item.id;

  if (searchId) {
    // 🌟 MASTER JSON LOOKUP (following Vue pattern)
    const lang = langKey.split("-")[0];
    const sData = LOCALE_DATA.sankalps[lang] || LOCALE_DATA.sankalps.en;
    const pData = LOCALE_DATA.practices[lang] || LOCALE_DATA.practices.en;

    // Clean prefix for JSON key lookup
    const cleanSearchId = String(searchId).replace(/^(sankalp|mantra|practice)\./, "");

    const sNameKey = `sankalps.${cleanSearchId}.short`;
    const sDescKey = `sankalps.${cleanSearchId}.tooltip`;
    const sSuggestedKey = `sankalps.${cleanSearchId}.suggested`;
    const pNameKey = `practices.${cleanSearchId}.name`;
    const pDescKey = `practices.${cleanSearchId}.description`;
    const pMantraKey = `practices.${cleanSearchId}.mantra`;
    const pMeaningKey = `practices.${cleanSearchId}.meaning`;

    if (sData && sData[sNameKey]) {
      return {
        name: sData[sNameKey],
        desc: sData[sSuggestedKey] || sData[sDescKey] || item.description || "",
        mantra: "",
        meaning: "",
        summary: sData[sDescKey] || "",
        insight: sData[`sankalps.${cleanSearchId}.insight`] || "",
        benefits: sData[`sankalps.${cleanSearchId}.benefits`] || [],
        duration: sData[`sankalps.${cleanSearchId}.duration`] || "",
        steps: sData[`sankalps.${cleanSearchId}.steps`] || "",
        howToLive: sData[`sankalps.${cleanSearchId}.howToLive`] || "",
        essence: sData[`sankalps.${cleanSearchId}.essence`] || "",
        line: sData[`sankalps.${cleanSearchId}.root`] || "",
        iast: "",
        tags: [],
        suggested_practice: sData[sSuggestedKey] || ""
      };
    }

    if (pData && pData[pNameKey]) {
      return {
        name: pData[pNameKey],
        desc: pData[pDescKey] || item.description || "",
        mantra: pData[pMantraKey] || item.mantra || item.devanagari || "",
        meaning: pData[pMeaningKey] || item.meaning || "",
        summary: pData[pDescKey] || "",
        insight: pData[`practices.${cleanSearchId}.insight`] || "",
        benefits: pData[`practices.${cleanSearchId}.benefits`] || [],
        duration: pData[`practices.${cleanSearchId}.duration`] || "",
        steps: pData[`practices.${cleanSearchId}.steps`] || "",
        howToLive: pData[`practices.${cleanSearchId}.howToLive`] || "",
        essence: pData[`practices.${cleanSearchId}.essence`] || "",
        line: "",
        iast: pData[`practices.${cleanSearchId}.iast`] || "",
        tags: pData[`practices.${cleanSearchId}.tags`] || [],
        suggested_practice: ""
      };
    }

    const found = universalCatalog.find((entry) => entry.id === searchId);
    const fallback = UNIVERSAL_CATALOG.en.find((entry) => entry.id === searchId);
    const universalMatch = found || fallback;

    if (universalMatch) {
      return {
        name: universalMatch.title || universalMatch.text || universalMatch.name || item.name || "Unnamed Practice",
        desc: universalMatch.meaning || universalMatch.summary || universalMatch.line ||
          (Array.isArray(universalMatch.explanation) ? universalMatch.explanation.join(" ") : universalMatch.explanation) ||
          universalMatch.description || item.description || "",
        mantra: universalMatch.devanagari || item.devanagari || "",
        meaning: universalMatch.meaning || item.meaning || "",
        summary: universalMatch.summary || "",
        insight: universalMatch.insight || "",
        benefits: universalMatch.benefits || [],
        duration: universalMatch.duration || "",
        steps: universalMatch.steps || "",
        howToLive: universalMatch.howToLive || "",
        essence: universalMatch.essence || "",
        line: universalMatch.line || "",
        iast: universalMatch.iast || "",
        tags: universalMatch.tags || [],
        suggested_practice: universalMatch.suggested_practice || ""
      };
    }


  }

  // 🪔 1️⃣ Sankalp (Yoga Sutra / Gita)
  const isSankalp = (
    item.i18n?.short ||
    item.type === "sankalp" ||
    item.details?.type === "sankalp" ||
    item.source === "sankalp" ||
    item.id?.startsWith("sankalp_") ||
    item.id?.startsWith("sankalp.") ||
    item.practice_id?.startsWith("sankalp.")
  );

  if (isSankalp) {
    // Try to find the sankalp in the localized catalog
    const localizedSankalpsCatalog = COMBINED_SANKALPS[langKey] || COMBINED_SANKALPS.en;
    const rawId = item.practice_id || item.id || details?.id || "";
    const cleanId = rawId.replace(/^(sankalp|mantra|practice)\./, "");

    // Find sankalp by ID in the catalog
    // Try rawId first (with prefix), then cleanId (without prefix)
    const localizedSankalp = localizedSankalpsCatalog.find((s) => s.id === rawId || s.id === cleanId);
    const fallbackSankalp = COMBINED_SANKALPS.en.find((s) => s.id === rawId || s.id === cleanId);
    const active = localizedSankalp || fallbackSankalp;

    // If found in catalog, use those values
    if (active) {
      return {
        name: active.title || item.name || "Unnamed Practice",
        desc: active.line || item.description || "",
        mantra: "",
        meaning: ""
      };
    }

    // Fallback to translation keys if not found in catalog
    const shortKey = item.i18n?.short || (cleanId ? `sankalps.${cleanId}.short` : null);
    const suggestedKey = item.i18n?.suggested || (cleanId ? `sankalps.${cleanId}.suggested` : null);
    const tooltipKey = item.i18n?.tooltip || (cleanId ? `sankalps.${cleanId}.tooltip` : null);

    const name =
      (shortKey && t(shortKey)) ||
      item.short_text ||
      item.name ||
      "Unnamed Practice";

    const desc =
      (suggestedKey && t(suggestedKey)) ||
      (tooltipKey && t(tooltipKey)) ||
      item.suggested_practice ||
      item.tooltip ||
      item.description ||
      "";

    return { name, desc, mantra: "", meaning: "" };
  }

  // 🕉️ 2️⃣ Mantra
  const isMantra = (
    item.id?.startsWith("mantra.") ||
    item.practice_id?.startsWith("mantra.") ||
    item.source === "mantra" ||
    item.text ||
    item.devanagari ||
    item.details?.type === "mantra"
  );

  if (isMantra) {
    const localizedCatalog = COMBINED_MANTRAS[langKey] || COMBINED_MANTRAS.en;
    const searchId = item.practice_id || item.id;

    const localizedMantra = localizedCatalog.find((m) => m.id === searchId);
    const fallbackMantra = COMBINED_MANTRAS.en.find((m) => m.id === searchId);
    const active = localizedMantra || fallbackMantra || item;

    const name =
      active.title ||      // Category mantras use 'title'
      active.text ||       // mantras.json use 'text'
      item.title ||
      item.text ||
      item.name ||
      item.devanagari ||
      active.devanagari ||
      "Unnamed Mantra";

    const desc =
      active.meaning ||    // Category mantras use 'meaning' for short description
      (Array.isArray(active.explanation)
        ? active.explanation.join(" ")
        : Array.isArray(item.explanation)
          ? item.explanation.join(" ")
          : active.explanation || item.explanation || item.description || "");

    return {
      name,
      desc,
      mantra: active.devanagari || item.devanagari || "",
      meaning: active.meaning || item.meaning || ""
    };
  }

  // 🧘 3️⃣ Custom Practices (NO TRANSLATION)
  if (
    item.source === "custom" ||
    String(item.practice_id || "").startsWith("custom_")
  ) {
    return {
      name: item.name?.trim() || "Custom Practice",
      desc: item.description?.trim() || "",
      mantra: item.mantra || item.devanagari || "",
      meaning: item.meaning || "",
    };
  }

  // 🪷 4️⃣ Library / Sanatan Practices (from category files)
  if (item.source === "practice" || item.source === "library") {
    const localizedPracticesCatalog = COMBINED_PRACTICES[langKey] || COMBINED_PRACTICES.en;
    const searchId = item.practice_id || item.id;

    const localizedPractice = localizedPracticesCatalog.find((p) => p.id === searchId);
    const fallbackPractice = COMBINED_PRACTICES.en.find((p) => p.id === searchId);
    const active = localizedPractice || fallbackPractice;

    if (active) {
      return {
        name: active.title || item.name || "Unnamed Practice",
        desc: active.summary || item.description || "",
        mantra: "",
        meaning: ""
      };
    }
  }

  // 🌐 5️⃣ Fallback to i18n translation keys
  const cleanId = item.id?.replace(/^(sankalp|mantra|practice)\./, "");
  const nameKey = `practices.${item.id}.name`;
  const descKey = `practices.${item.id}.description`;
  const mantraKey = `practices.${item.id}.mantra`;
  const meaningKey = `practices.${item.id}.meaning`;

  const translatedName = t(nameKey, { defaultValue: "" });
  const sankalpName = t(`sankalps.${item.id}.short`, { defaultValue: "" });
  const hasTranslation = (translatedName && translatedName !== nameKey) || (sankalpName && sankalpName !== `sankalps.${item.id}.short`);

  const name =
    hasTranslation
      ? (translatedName && translatedName !== nameKey ? translatedName : sankalpName)
      : item.name === "Unnamed Practice" && item.i18n?.short
        ? t(item.i18n.short)
        : item.name;

  const desc =
    hasTranslation
      ? (t(descKey, { defaultValue: "" }) || t(`sankalps.${item.id}.tooltip`, { defaultValue: item.description || "" }))
      : item.description || "";

  const mantra = t(mantraKey, { defaultValue: item.mantra || item.devanagari || "" });
  const meaning = t(meaningKey, { defaultValue: item.meaning || "" });

  return {
    name,
    desc,
    mantra,
    meaning,
    summary: t(`practices.${item.id}.summary`, { defaultValue: item.summary || "" }),
    insight: t(`practices.${item.id}.insight`, { defaultValue: item.insight || "" }),
    benefits: item.benefits || [],
    duration: t(`practices.${item.id}.duration`, { defaultValue: item.duration || "" }),
    steps: t(`practices.${item.id}.steps`, { defaultValue: item.steps || "" }),
    howToLive: t(`practices.${item.id}.howToLive`, { defaultValue: item.howToLive || "" }),
    essence: t(`practices.${item.id}.essence`, { defaultValue: item.essence || "" }),
    line: t(`practices.${item.id}.line`, { defaultValue: item.line || "" }),
    iast: t(`practices.${item.id}.iast`, { defaultValue: item.iast || "" }),
    tags: item.tags || [],
    suggested_practice: t(`practices.${item.id}.suggested_practice`, { defaultValue: item.suggested_practice || "" })
  };
};









// export const getTranslatedPractice = (p: any, t: any) => {
//   if (!p) return { name: "", desc: "" };

//   // 🪔 1️⃣ Sankalpa or i18n-based items
//   if (p.i18n?.short) {
//     return {
//       name: t(p.i18n.short, { defaultValue: p.short_text || p.name }),
//       desc:
//         t(p.i18n.suggested, {
//           defaultValue:
//             p.tooltip || p.suggested_practice || p.description || "",
//         }) || "",
//     };
//   }

//   // 🕉️ 2️⃣ Mantra catalog items (usually have devanagari or explanation array)
//   if (p.id?.startsWith("mantra.")) {
//     return {
//       name: p.devanagari || p.text || p.name,
//       desc:
//         Array.isArray(p.explanation) && p.explanation.length > 0
//           ? p.explanation.join(" ")
//           : p.explanation || p.description || "",
//     };
//   }

//   // 🪷 3️⃣ Check dynamically if translation exists in JSON (no prefix assumptions)
//   const nameKey = `practices.${p.id}.name`;
//   const descKey = `practices.${p.id}.description`;

//   // Check if a translation exists (not the untranslated key itself)
//   const translatedName = t(nameKey, { defaultValue: "" });
//   const hasTranslation = translatedName !== nameKey;

//   if (hasTranslation) {
//     return {
//       name: translatedName || p.name,
//       desc:
//         t(descKey, { defaultValue: p.description || "" }) ||
//         p.description ||
//         "",
//     };
//   }

//   // 🪶 4️⃣ Fallback for any unlisted / custom practice
//   return {
//     name: p.name || "Custom Practice",
//     desc: p.description || "A personal practice crafted with your intention.",
//   };
// };




// // src/utils/getTranslatedPractice.ts
// export const getTranslatedPractice = (p, t) => {
//   if (!p) return { name: "", desc: "" };

//   // 🪔 Sankalp Type
//   if (p.i18n?.short) {
//     return {
//       name: t(p.i18n.short) || p.short_text || p.name,
//       desc:
//         t(p.i18n.suggested) ||
//         t(p.i18n.tooltip) ||
//         p.tooltip ||
//         p.suggested_practice ||
//         "",
//     };
//   }

//   // 🕉️ Mantra Type
//   if (p.id?.startsWith("mantra.")) {
//     return {
//       name: p.devanagari || p.text || p.name,
//       desc:
//         Array.isArray(p.explanation) && p.explanation.length > 0
//           ? p.explanation[0]
//           : p.explanation || "",
//     };
//   }

//   // 🪷 Sanatan Practice Type
//   if (p.id && p.id.startsWith("japa_")) {
//     return {
//       name: t(`practices.${p.id}.name`, { defaultValue: p.name }),
//       desc: t(`practices.${p.id}.description`, {
//         defaultValue: p.description,
//       }),
//     };
//   }

//   // 🪶 Custom Practice (user-created)
//   return {
//     name: p.name || "Custom Practice",
//     desc: p.description || "A personal practice crafted with your intention.",
//   };
// };
