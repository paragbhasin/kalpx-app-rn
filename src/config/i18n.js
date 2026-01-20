import * as Localization from "expo-localization";
import i18n from "i18next";
import merge from "lodash.merge"; // deep merge utility
import { initReactI18next } from "react-i18next";
import moment from "moment";

// Import moment locales for internationalization
import 'moment/locale/hi';
import 'moment/locale/te';
import 'moment/locale/ta';
import 'moment/locale/bn';
import 'moment/locale/gu';
import 'moment/locale/kn';
import 'moment/locale/ml';
import 'moment/locale/mr';
// Note: Skipping 'or' (Odia) per user request

// Import your translations
import bn from "./locales/bn/bn.json";
import festivalsBn from "./locales/bn/festivals-bn.json";
import mantrasBn from "./locales/bn/mantras-bn.json";
import practicesBn from "./locales/bn/practices-bn.json";
import sankalpsBn from "./locales/bn/sankalps-bn.json";
import wisdomBn from "./locales/bn/wisdom-bn.json";

// Hindi Category Imports
import {
  PEACE_CALM_MANTRAS as hi_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as hi_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as hi_PEACE_CALM_SANKALPS,
} from "./locales/hi/PeaceCalm-hi";
import {
  CARRER_ABUNDANCE_MANTRAS as hi_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as hi_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as hi_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/hi/CareerProsperity-hi";
import {
  EMOTIONAL_HEALING_MANTRAS as hi_EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES as hi_EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS as hi_EMOTIONAL_HEALING_SANKALPS,
} from "./locales/hi/EmotionalHealing-hi";
import {
  FOCUS_MOTIVATION_MANTRAS as hi_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as hi_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as hi_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/hi/FocusMotivation-hi";
import {
  GRATITUDE_POSTIVITY_MANTRAS as hi_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as hi_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as hi_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/hi/GratitudePositivity-hi";
import {
  HEALTH_WELL_BEING_MANTRASS as hi_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as hi_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as hi_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/hi/HealthWellbeing-hi";
import {
  SPIRITUAL_GROWTH_MANTRAS as hi_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as hi_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as hi_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/hi/SpiritualGrowth-hi";

// Telugu Category Imports
import {
  PEACE_CALM_MANTRAS as te_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as te_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as te_PEACE_CALM_SANKALPS,
} from "./locales/te/PeaceClam-te";
import {
  CARRER_ABUNDANCE_MANTRAS as te_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as te_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as te_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/te/CareerProsperity-te";
import {
  EMOTIONAL_HEALING_MANTRAS as te_EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES as te_EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS as te_EMOTIONAL_HEALING_SANKALPS,
} from "./locales/te/EmotionalHealing-te";
import {
  FOCUS_MOTIVATION_MANTRAS as te_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as te_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as te_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/te/FocusMotivation-te";
import {
  GRATITUDE_POSTIVITY_MANTRAS as te_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as te_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as te_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/te/GratitudePositivity-te";
import {
  HEALTH_WELL_BEING_MANTRASS as te_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as te_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as te_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/te/HealthWellbeing-te";
import {
  SPIRITUAL_GROWTH_MANTRAS as te_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as te_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as te_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/te/SpiritualGrowth-te";

// Bengali Category Imports
import {
  PEACE_CALM_MANTRAS as bn_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as bn_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as bn_PEACE_CALM_SANKALPS,
} from "./locales/bn/PeaceClam-bn";
import {
  CARRER_ABUNDANCE_MANTRAS as bn_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as bn_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as bn_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/bn/CareerProsperity-bn";
import {
  EMOTIONAL_HEALING_MANTRAS as bn_EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES as bn_EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS as bn_EMOTIONAL_HEALING_SANKALPS,
} from "./locales/bn/EmotionalHealing-bn";
import {
  FOCUS_MOTIVATION_MANTRAS as bn_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as bn_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as bn_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/bn/FocusMotivation-bn";
import {
  GRATITUDE_POSTIVITY_MANTRAS as bn_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as bn_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as bn_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/bn/GratitudePositivity-bn";
import {
  HEALTH_WELL_BEING_MANTRASS as bn_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as bn_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as bn_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/bn/HealthWellbeing-bn";
import {
  SPIRITUAL_GROWTH_MANTRAS as bn_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as bn_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as bn_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/bn/SpiritualGrowth-bn";

// Gujarati Category Imports
import {
  PEACE_CALM_MANTRAS as gu_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as gu_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as gu_PEACE_CALM_SANKALPS,
} from "./locales/gu/PeaceClam-gu";
import {
  CARRER_ABUNDANCE_MANTRAS as gu_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as gu_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as gu_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/gu/CareerProsperity-gu";
import {
  EMOTIONAL_HEALING_MANTRAS as gu_EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES as gu_EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS as gu_EMOTIONAL_HEALING_SANKALPS,
} from "./locales/gu/EmotionalHealing-gu";
import {
  FOCUS_MOTIVATION_MANTRAS as gu_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as gu_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as gu_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/gu/FocusMotivation-gu";
import {
  GRATITUDE_POSTIVITY_MANTRAS as gu_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as gu_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as gu_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/gu/GratitudePositivity-gu";
import {
  HEALTH_WELL_BEING_MANTRASS as gu_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as gu_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as gu_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/gu/HealthWellbeing-gu";
import {
  SPIRITUAL_GROWTH_MANTRAS as gu_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as gu_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as gu_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/gu/SpiritualGrowth-gu";

// Kannada Category Imports
import {
  PEACE_CALM_MANTRAS as kn_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as kn_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as kn_PEACE_CALM_SANKALPS,
} from "./locales/kn/PeaceClam-kn";
import {
  CARRER_ABUNDANCE_MANTRAS as kn_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as kn_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as kn_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/kn/CareerProsperity-kn";
import {
  FOCUS_MOTIVATION_MANTRAS as kn_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as kn_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as kn_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/kn/FocusMotivation-kn";
import {
  GRATITUDE_POSTIVITY_MANTRAS as kn_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as kn_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as kn_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/kn/GratitudePositivity-kn";
import {
  HEALTH_WELL_BEING_MANTRASS as kn_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as kn_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as kn_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/kn/HealthWellbeing-kn";
import {
  SPIRITUAL_GROWTH_MANTRAS as kn_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as kn_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as kn_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/kn/SpiritualGrowth-kn";

// Malayalam Category Imports
import {
  PEACE_CALM_MANTRAS as ml_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as ml_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as ml_PEACE_CALM_SANKALPS,
} from "./locales/ml/PeaceClam-ml";
import {
  CARRER_ABUNDANCE_MANTRAS as ml_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as ml_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as ml_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/ml/CareerProsperity-ml";
import {
  FOCUS_MOTIVATION_MANTRAS as ml_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as ml_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as ml_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/ml/FocusMotivation-ml";
import {
  GRATITUDE_POSTIVITY_MANTRAS as ml_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as ml_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as ml_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/ml/GratitudePositivity-ml";
import {
  HEALTH_WELL_BEING_MANTRASS as ml_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as ml_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as ml_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/ml/HealthWellbeing-ml";
import {
  SPIRITUAL_GROWTH_MANTRAS as ml_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as ml_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as ml_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/ml/SpiritualGrowth-ml";

// Marathi Category Imports
import {
  PEACE_CALM_MANTRAS as mr_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as mr_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as mr_PEACE_CALM_SANKALPS,
} from "./locales/mr/PeaceClam-mr";
import {
  CARRER_ABUNDANCE_MANTRAS as mr_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as mr_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as mr_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/mr/CareerProsperity-mr";
import {
  EMOTIONAL_HEALING_MANTRAS as mr_EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES as mr_EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS as mr_EMOTIONAL_HEALING_SANKALPS,
} from "./locales/mr/EmotionalHealing-mr";
import {
  FOCUS_MOTIVATION_MANTRAS as mr_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as mr_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as mr_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/mr/FocusMotivation-mr";
import {
  GRATITUDE_POSTIVITY_MANTRAS as mr_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as mr_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as mr_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/mr/GratitudePositivity-mr";
import {
  HEALTH_WELL_BEING_MANTRASS as mr_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as mr_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as mr_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/mr/HealthWellbeing-mr";
import {
  SPIRITUAL_GROWTH_MANTRAS as mr_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as mr_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as mr_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/mr/SpiritualGrowth-mr";

// Odia Category Imports
import {
  PEACE_CALM_MANTRAS as or_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as or_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as or_PEACE_CALM_SANKALPS,
} from "./locales/or/PeaceClam-or";
import {
  CARRER_ABUNDANCE_MANTRAS as or_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as or_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as or_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/or/CareerProsperity-or";
import {
  EMOTIONAL_HEALING_MANTRAS as or_EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES as or_EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS as or_EMOTIONAL_HEALING_SANKALPS,
} from "./locales/or/EmotionalHealing-or";
import {
  FOCUS_MOTIVATION_MANTRAS as or_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as or_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as or_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/or/FocusMotivation-or";
import {
  GRATITUDE_POSTIVITY_MANTRAS as or_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as or_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as or_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/or/GratitudePositivity-or";
import {
  HEALTH_WELL_BEING_MANTRASS as or_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as or_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as or_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/or/HealthWellbeing-or";
import {
  SPIRITUAL_GROWTH_MANTRAS as or_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as or_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as or_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/or/SpiritualGrowth-or";

// Tamil Category Imports
import {
  PEACE_CALM_MANTRAS as ta_PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES as ta_PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS as ta_PEACE_CALM_SANKALPS,
} from "./locales/ta/PeaceCalm-ta";
import {
  CARRER_ABUNDANCE_MANTRAS as ta_CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES as ta_CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS as ta_CARRER_ABUNDANCE_SANKALPS,
} from "./locales/ta/CareerProsperity-ta";
import {
  EMOTIONAL_HEALING_MANTRAS as ta_EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES as ta_EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS as ta_EMOTIONAL_HEALING_SANKALPS,
} from "./locales/ta/EmotionalHealing-ta";
import {
  FOCUS_MOTIVATION_MANTRAS as ta_FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES as ta_FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS as ta_FOCUS_MOTIVATION_SANKALPS,
} from "./locales/ta/FocusMotivation-ta";
import {
  GRATITUDE_POSTIVITY_MANTRAS as ta_GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES as ta_GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS as ta_GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/ta/GratitudePositivity-ta";
import {
  HEALTH_WELL_BEING_MANTRASS as ta_HEALTH_WELL_BEING_MANTRAS,
  HEALTH_WELL_BEING_PRACTICES as ta_HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS as ta_HEALTH_WELL_BEING_SANKALPS,
} from "./locales/ta/HealthWellbeing-ta";
import {
  SPIRITUAL_GROWTH_MANTRAS as ta_SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES as ta_SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS as ta_SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/ta/SpiritualGrowth-ta";

import {
  CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS,
} from "./locales/en/CareerProsperity";
import {
  EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS,
} from "./locales/en/EmotionalHealing";
import en from "./locales/en/en.json";
import festivalsEn from "./locales/en/festivals-en.json";
import {
  FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS,
} from "./locales/en/FocusMotivation";
import {
  GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/en/GratitudePositivity";
import {
  HEALTH_WELL_BEING_MANTRASS,
  HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS,
} from "./locales/en/HealthWellbeing";
import mantrasEn from "./locales/en/mantras-en.json";
import {
  PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS,
} from "./locales/en/PeaceCalm";
import practicesEn from "./locales/en/practices-en.json";
import sankalpsEn from "./locales/en/sankalps-en.json";
import {
  SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/en/SpiritualGrowth";

import templesEn from "./locales/en/temples_en.json";
import wisdomEn from "./locales/en/wisdom-en.json";
import festivalsGu from "./locales/gu/festivals-gu.json";
import gu from "./locales/gu/gu.json";
import mantrasGu from "./locales/gu/mantras-gu.json";
import practicesGu from "./locales/gu/practices-gu.json";
import sankalpsGu from "./locales/gu/sankalps-gu.json";
import wisdomGu from "./locales/gu/wisdom-gu.json";
import festivalsHi from "./locales/hi/festivals-hi.json";
import hi from "./locales/hi/hi.json";
import mantrasHi from "./locales/hi/mantras-hi.json";
import practicesHi from "./locales/hi/practices-hi.json";
import sankalpsHi from "./locales/hi/sankalps-hi.json";
import templesHi from "./locales/hi/temples_hi.json";
import wisdomHi from "./locales/hi/wisdom-hi.json";
import festivalsKn from "./locales/kn/festivals-kn.json";
import kn from "./locales/kn/kn.json";
import mantrasKn from "./locales/kn/mantras-kn.json";
import practicesKn from "./locales/kn/practices-kn.json";
import sankalpsKn from "./locales/kn/sankalps-kn.json";
import wisdomKn from "./locales/kn/wisdom-kn.json";
import festivalsMl from "./locales/ml/festivals-ml.json";
import mantrasMl from "./locales/ml/mantras-ml.json";
import ml from "./locales/ml/ml.json";
import practicesMl from "./locales/ml/practices-ml.json";
import sankalpsMl from "./locales/ml/sankalps-ml.json";
import wisdomMl from "./locales/ml/wisdom-ml.json";
import festivalsMr from "./locales/mr/festivals-mr.json";
import mantrasMr from "./locales/mr/matras-mr.json";
import mr from "./locales/mr/mr.json";
import practicesMr from "./locales/mr/practices-mr.json";
import sankalpsMr from "./locales/mr/sankalps-mr.json";
import wisdomMr from "./locales/mr/wisdom-mr.json";
import festivalsOr from "./locales/or/festivals-or.json";
import mantrasOr from "./locales/or/mantras-or.json";
import or from "./locales/or/or.json";
import practicesOr from "./locales/or/practices-or.json";
import sankalpsOr from "./locales/or/sankalps-or.json";
import wisdomOr from "./locales/or/wisdom-or.json";
import festivalsTa from "./locales/ta/festivals-ta.json";
import mantrasTa from "./locales/ta/mantras-ta.json";
import practicesTa from "./locales/ta/practices-ta.json";
import sankalpsTa from "./locales/ta/sankalps-ta.json";
import ta from "./locales/ta/ta.json";
import wisdomTa from "./locales/ta/wisdom-ta.json";
import festivalsTe from "./locales/te/festivals-te.json";
import mantrasTe from "./locales/te/mantras-te.json";
import practicesTe from "./locales/te/practices-te.json";
import sankalpsTe from "./locales/te/sankalps-te.json";
import te from "./locales/te/te.json";
import templesTe from "./locales/te/temples_te.json";
import wisdomTe from "./locales/te/wisdom-te.json";

// Safely get device language
const deviceLanguage =
  Array.isArray(Localization.getLocales()) &&
  Localization.getLocales().length > 0
    ? Localization.getLocales()[0].languageCode // e.g. "en"
    : "en";

const convertArrayToTranslation = (arr, categoryKey) => {
  const obj = {};
  if (!arr) return obj;
  arr.forEach((item) => {
    if (item.id) obj[item.id] = { ...item, category: categoryKey };
  });
  return obj;
};

const getCategoryTranslations = (
  peaceP,
  peaceM,
  peaceS,
  spiritualP,
  spiritualM,
  spiritualS,
  careerP,
  careerM,
  careerS,
  focusP,
  focusM,
  focusS,
  healingP,
  healingM,
  healingS,
  gratitudeP,
  gratitudeM,
  gratitudeS,
  healthP,
  healthM,
  healthS
) => {
  return {
    ...convertArrayToTranslation(peaceP, "peace-calm"),
    ...convertArrayToTranslation(peaceM, "peace-calm"),
    ...convertArrayToTranslation(peaceS, "peace-calm"),
    ...convertArrayToTranslation(spiritualP, "spiritual-growth"),
    ...convertArrayToTranslation(spiritualM, "spiritual-growth"),
    ...convertArrayToTranslation(spiritualS, "spiritual-growth"),
    ...convertArrayToTranslation(careerP, "career"),
    ...convertArrayToTranslation(careerM, "career"),
    ...convertArrayToTranslation(careerS, "career"),
    ...convertArrayToTranslation(focusP, "focus"),
    ...convertArrayToTranslation(focusM, "focus"),
    ...convertArrayToTranslation(focusS, "focus"),
    ...convertArrayToTranslation(healingP, "healing"),
    ...convertArrayToTranslation(healingM, "healing"),
    ...convertArrayToTranslation(healingS, "healing"),
    ...convertArrayToTranslation(gratitudeP, "gratitude"),
    ...convertArrayToTranslation(gratitudeM, "gratitude"),
    ...convertArrayToTranslation(gratitudeS, "gratitude"),
    ...convertArrayToTranslation(healthP, "health"),
    ...convertArrayToTranslation(healthM, "health"),
    ...convertArrayToTranslation(healthS, "health"),
  };
};

// ✅ Deep merge translations to avoid overwriting nested objects
const translations = {
  en: merge(
    {},
    en,
    templesEn,
    mantrasEn,
    festivalsEn,
    sankalpsEn,
    wisdomEn,
    practicesEn,
    getCategoryTranslations(
      PEACE_CALM_PRACTICES,
      PEACE_CALM_MANTRAS,
      PEACE_CALM_SANKALPS,
      SPIRITUAL_GROWTH_PRACTICES,
      SPIRITUAL_GROWTH_MANTRAS,
      SPIRITUAL_GROWTH_SANKALPS,
      CARRER_ABUNDANCE_PRACTICES,
      CARRER_ABUNDANCE_MANTRAS,
      CARRER_ABUNDANCE_SANKALPS,
      FOCUS_MOTIVATION_PRACTICES,
      FOCUS_MOTIVATION_MANTRAS,
      FOCUS_MOTIVATION_SANKALPS,
      EMOTIONAL_HEALING_PRACTICES,
      EMOTIONAL_HEALING_MANTRAS,
      EMOTIONAL_HEALING_SANKALPS,
      GRATITUDE_POSTIVITY_PRACTICES,
      GRATITUDE_POSTIVITY_MANTRAS,
      GRATITUDE_POSTIVITY_SANKALPS,
      HEALTH_WELL_BEING_PRACTICES,
      HEALTH_WELL_BEING_MANTRASS,
      HEALTH_WELL_BEING_SANKALPS
    )
  ),
  hi: merge(
    {},
    hi,
    templesHi,
    mantrasHi,
    festivalsHi,
    sankalpsHi,
    wisdomHi,
    practicesHi,
    getCategoryTranslations(
      hi_PEACE_CALM_PRACTICES,
      hi_PEACE_CALM_MANTRAS,
      hi_PEACE_CALM_SANKALPS,
      hi_SPIRITUAL_GROWTH_PRACTICES,
      hi_SPIRITUAL_GROWTH_MANTRAS,
      hi_SPIRITUAL_GROWTH_SANKALPS,
      hi_CARRER_ABUNDANCE_PRACTICES,
      hi_CARRER_ABUNDANCE_MANTRAS,
      hi_CARRER_ABUNDANCE_SANKALPS,
      hi_FOCUS_MOTIVATION_PRACTICES,
      hi_FOCUS_MOTIVATION_MANTRAS,
      hi_FOCUS_MOTIVATION_SANKALPS,
      hi_EMOTIONAL_HEALING_PRACTICES,
      hi_EMOTIONAL_HEALING_MANTRAS,
      hi_EMOTIONAL_HEALING_SANKALPS,
      hi_GRATITUDE_POSTIVITY_PRACTICES,
      hi_GRATITUDE_POSTIVITY_MANTRAS,
      hi_GRATITUDE_POSTIVITY_SANKALPS,
      hi_HEALTH_WELL_BEING_PRACTICES,
      hi_HEALTH_WELL_BEING_MANTRAS,
      hi_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  te: merge(
    {},
    te,
    templesTe,
    mantrasTe,
    sankalpsTe,
    festivalsTe,
    wisdomTe,
    practicesTe,
    getCategoryTranslations(
      te_PEACE_CALM_PRACTICES,
      te_PEACE_CALM_MANTRAS,
      te_PEACE_CALM_SANKALPS,
      te_SPIRITUAL_GROWTH_PRACTICES,
      te_SPIRITUAL_GROWTH_MANTRAS,
      te_SPIRITUAL_GROWTH_SANKALPS,
      te_CARRER_ABUNDANCE_PRACTICES,
      te_CARRER_ABUNDANCE_MANTRAS,
      te_CARRER_ABUNDANCE_SANKALPS,
      te_FOCUS_MOTIVATION_PRACTICES,
      te_FOCUS_MOTIVATION_MANTRAS,
      te_FOCUS_MOTIVATION_SANKALPS,
      te_EMOTIONAL_HEALING_PRACTICES,
      te_EMOTIONAL_HEALING_MANTRAS,
      te_EMOTIONAL_HEALING_SANKALPS,
      te_GRATITUDE_POSTIVITY_PRACTICES,
      te_GRATITUDE_POSTIVITY_MANTRAS,
      te_GRATITUDE_POSTIVITY_SANKALPS,
      te_HEALTH_WELL_BEING_PRACTICES,
      te_HEALTH_WELL_BEING_MANTRAS,
      te_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  ta: merge(
    {},
    ta,
    mantrasTa,
    sankalpsTa,
    festivalsTa,
    wisdomTa,
    practicesTa,
    getCategoryTranslations(
      ta_PEACE_CALM_PRACTICES,
      ta_PEACE_CALM_MANTRAS,
      ta_PEACE_CALM_SANKALPS,
      ta_SPIRITUAL_GROWTH_PRACTICES,
      ta_SPIRITUAL_GROWTH_MANTRAS,
      ta_SPIRITUAL_GROWTH_SANKALPS,
      ta_CARRER_ABUNDANCE_PRACTICES,
      ta_CARRER_ABUNDANCE_MANTRAS,
      ta_CARRER_ABUNDANCE_SANKALPS,
      ta_FOCUS_MOTIVATION_PRACTICES,
      ta_FOCUS_MOTIVATION_MANTRAS,
      ta_FOCUS_MOTIVATION_SANKALPS,
      ta_EMOTIONAL_HEALING_PRACTICES,
      ta_EMOTIONAL_HEALING_MANTRAS,
      ta_EMOTIONAL_HEALING_SANKALPS,
      ta_GRATITUDE_POSTIVITY_PRACTICES,
      ta_GRATITUDE_POSTIVITY_MANTRAS,
      ta_GRATITUDE_POSTIVITY_SANKALPS,
      ta_HEALTH_WELL_BEING_PRACTICES,
      ta_HEALTH_WELL_BEING_MANTRAS,
      ta_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  bn: merge(
    {},
    bn,
    mantrasBn,
    sankalpsBn,
    festivalsBn,
    wisdomBn,
    practicesBn,
    getCategoryTranslations(
      bn_PEACE_CALM_PRACTICES,
      bn_PEACE_CALM_MANTRAS,
      bn_PEACE_CALM_SANKALPS,
      bn_SPIRITUAL_GROWTH_PRACTICES,
      bn_SPIRITUAL_GROWTH_MANTRAS,
      bn_SPIRITUAL_GROWTH_SANKALPS,
      bn_CARRER_ABUNDANCE_PRACTICES,
      bn_CARRER_ABUNDANCE_MANTRAS,
      bn_CARRER_ABUNDANCE_SANKALPS,
      bn_FOCUS_MOTIVATION_PRACTICES,
      bn_FOCUS_MOTIVATION_MANTRAS,
      bn_FOCUS_MOTIVATION_SANKALPS,
      bn_EMOTIONAL_HEALING_PRACTICES,
      bn_EMOTIONAL_HEALING_MANTRAS,
      bn_EMOTIONAL_HEALING_SANKALPS,
      bn_GRATITUDE_POSTIVITY_PRACTICES,
      bn_GRATITUDE_POSTIVITY_MANTRAS,
      bn_GRATITUDE_POSTIVITY_SANKALPS,
      bn_HEALTH_WELL_BEING_PRACTICES,
      bn_HEALTH_WELL_BEING_MANTRAS,
      bn_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  gu: merge(
    {},
    gu,
    mantrasGu,
    sankalpsGu,
    festivalsGu,
    wisdomGu,
    practicesGu,
    getCategoryTranslations(
      gu_PEACE_CALM_PRACTICES,
      gu_PEACE_CALM_MANTRAS,
      gu_PEACE_CALM_SANKALPS,
      gu_SPIRITUAL_GROWTH_PRACTICES,
      gu_SPIRITUAL_GROWTH_MANTRAS,
      gu_SPIRITUAL_GROWTH_SANKALPS,
      gu_CARRER_ABUNDANCE_PRACTICES,
      gu_CARRER_ABUNDANCE_MANTRAS,
      gu_CARRER_ABUNDANCE_SANKALPS,
      gu_FOCUS_MOTIVATION_PRACTICES,
      gu_FOCUS_MOTIVATION_MANTRAS,
      gu_FOCUS_MOTIVATION_SANKALPS,
      gu_EMOTIONAL_HEALING_PRACTICES,
      gu_EMOTIONAL_HEALING_MANTRAS,
      gu_EMOTIONAL_HEALING_SANKALPS,
      gu_GRATITUDE_POSTIVITY_PRACTICES,
      gu_GRATITUDE_POSTIVITY_MANTRAS,
      gu_GRATITUDE_POSTIVITY_SANKALPS,
      gu_HEALTH_WELL_BEING_PRACTICES,
      gu_HEALTH_WELL_BEING_MANTRAS,
      gu_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  kn: merge(
    {},
    kn,
    mantrasKn,
    sankalpsKn,
    festivalsKn,
    wisdomKn,
    practicesKn,
    getCategoryTranslations(
      kn_PEACE_CALM_PRACTICES,
      kn_PEACE_CALM_MANTRAS,
      kn_PEACE_CALM_SANKALPS,
      kn_SPIRITUAL_GROWTH_PRACTICES,
      kn_SPIRITUAL_GROWTH_MANTRAS,
      kn_SPIRITUAL_GROWTH_SANKALPS,
      kn_CARRER_ABUNDANCE_PRACTICES,
      kn_CARRER_ABUNDANCE_MANTRAS,
      kn_CARRER_ABUNDANCE_SANKALPS,
      kn_FOCUS_MOTIVATION_PRACTICES,
      kn_FOCUS_MOTIVATION_MANTRAS,
      kn_FOCUS_MOTIVATION_SANKALPS,
      [], // healingP
      [], // healingM
      [], // healingS
      kn_GRATITUDE_POSTIVITY_PRACTICES,
      kn_GRATITUDE_POSTIVITY_MANTRAS,
      kn_GRATITUDE_POSTIVITY_SANKALPS,
      kn_HEALTH_WELL_BEING_PRACTICES,
      kn_HEALTH_WELL_BEING_MANTRAS,
      kn_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  ml: merge(
    {},
    ml,
    mantrasMl,
    sankalpsMl,
    festivalsMl,
    wisdomMl,
    practicesMl,
    getCategoryTranslations(
      ml_PEACE_CALM_PRACTICES,
      ml_PEACE_CALM_MANTRAS,
      ml_PEACE_CALM_SANKALPS,
      ml_SPIRITUAL_GROWTH_PRACTICES,
      ml_SPIRITUAL_GROWTH_MANTRAS,
      ml_SPIRITUAL_GROWTH_SANKALPS,
      ml_CARRER_ABUNDANCE_PRACTICES,
      ml_CARRER_ABUNDANCE_MANTRAS,
      ml_CARRER_ABUNDANCE_SANKALPS,
      ml_FOCUS_MOTIVATION_PRACTICES,
      ml_FOCUS_MOTIVATION_MANTRAS,
      ml_FOCUS_MOTIVATION_SANKALPS,
      [], // healingP
      [], // healingM
      [], // healingS
      ml_GRATITUDE_POSTIVITY_PRACTICES,
      ml_GRATITUDE_POSTIVITY_MANTRAS,
      ml_GRATITUDE_POSTIVITY_SANKALPS,
      ml_HEALTH_WELL_BEING_PRACTICES,
      ml_HEALTH_WELL_BEING_MANTRAS,
      ml_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  mr: merge(
    {},
    mr,
    mantrasMr,
    sankalpsMr,
    festivalsMr,
    wisdomMr,
    practicesMr,
    getCategoryTranslations(
      mr_PEACE_CALM_PRACTICES,
      mr_PEACE_CALM_MANTRAS,
      mr_PEACE_CALM_SANKALPS,
      mr_SPIRITUAL_GROWTH_PRACTICES,
      mr_SPIRITUAL_GROWTH_MANTRAS,
      mr_SPIRITUAL_GROWTH_SANKALPS,
      mr_CARRER_ABUNDANCE_PRACTICES,
      mr_CARRER_ABUNDANCE_MANTRAS,
      mr_CARRER_ABUNDANCE_SANKALPS,
      mr_FOCUS_MOTIVATION_PRACTICES,
      mr_FOCUS_MOTIVATION_MANTRAS,
      mr_FOCUS_MOTIVATION_SANKALPS,
      mr_EMOTIONAL_HEALING_PRACTICES,
      mr_EMOTIONAL_HEALING_MANTRAS,
      mr_EMOTIONAL_HEALING_SANKALPS,
      mr_GRATITUDE_POSTIVITY_PRACTICES,
      mr_GRATITUDE_POSTIVITY_MANTRAS,
      mr_GRATITUDE_POSTIVITY_SANKALPS,
      mr_HEALTH_WELL_BEING_PRACTICES,
      mr_HEALTH_WELL_BEING_MANTRAS,
      mr_HEALTH_WELL_BEING_SANKALPS
    )
  ),
  or: merge(
    {},
    or,
    mantrasOr,
    sankalpsOr,
    festivalsOr,
    wisdomOr,
    practicesOr,
    getCategoryTranslations(
      or_PEACE_CALM_PRACTICES,
      or_PEACE_CALM_MANTRAS,
      or_PEACE_CALM_SANKALPS,
      or_SPIRITUAL_GROWTH_PRACTICES,
      or_SPIRITUAL_GROWTH_MANTRAS,
      or_SPIRITUAL_GROWTH_SANKALPS,
      or_CARRER_ABUNDANCE_PRACTICES,
      or_CARRER_ABUNDANCE_MANTRAS,
      or_CARRER_ABUNDANCE_SANKALPS,
      or_FOCUS_MOTIVATION_PRACTICES,
      or_FOCUS_MOTIVATION_MANTRAS,
      or_FOCUS_MOTIVATION_SANKALPS,
      or_EMOTIONAL_HEALING_PRACTICES,
      or_EMOTIONAL_HEALING_MANTRAS,
      or_EMOTIONAL_HEALING_SANKALPS,
      or_GRATITUDE_POSTIVITY_PRACTICES,
      or_GRATITUDE_POSTIVITY_MANTRAS,
      or_GRATITUDE_POSTIVITY_SANKALPS,
      or_HEALTH_WELL_BEING_PRACTICES,
      or_HEALTH_WELL_BEING_MANTRAS,
      or_HEALTH_WELL_BEING_SANKALPS
    )
  ),
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: deviceLanguage,
  fallbackLng: "en",
  debug: true, // optional, shows missing keys in console
  resources: {
    en: { translation: translations.en },
    hi: { translation: translations.hi },
    te: { translation: translations.te },
    ta: { translation: translations.ta },
    bn: { translation: translations.bn },
    gu: { translation: translations.gu },
    kn: { translation: translations.kn },
    ml: { translation: translations.ml },
    mr: { translation: translations.mr },
    or: { translation: translations.or },
  },
  interpolation: {
    escapeValue: false, // react already escapes
  },
  saveMissing: true, // optional: sends missing keys to console
});

// Sync moment locale on language change
i18n.on('languageChanged', (lng) => {
  if (!lng) return;
  const lang = lng.split('-')[0].toLowerCase();
  
  if (lang !== 'or') { // Skip Odia as per user request
    moment.locale(lang);
    
    // For non-English languages, ensure we don't use localized digits if they were enabled
    if (lang !== 'en') {
      moment.updateLocale(lang, {
        postformat: (val) => val,
        preparse: (val) => val
      });
    }
  } else {
    moment.locale('en'); // Fallback to English for unsupported/skipped locales
  }
});

// Set initial moment locale and force English digits
const langCode = i18n.language ? i18n.language.split('-')[0].toLowerCase() : deviceLanguage;
if (langCode !== 'or') {
  moment.locale(langCode);
  const localesToFix = ['hi', 'te', 'ta', 'bn', 'gu', 'kn', 'ml', 'mr'];
  localesToFix.forEach(lang => {
    moment.updateLocale(lang, {
      postformat: (val) => val,
      preparse: (val) => val
    });
  });
}

export default i18n;
