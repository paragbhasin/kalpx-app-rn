import { WEB_ENV } from "../../lib/env";
import type { CommunityListItem } from "../../engine/communityApi";

const COMMUNITY_BACKGROUNDS: Record<string, string> = {
  "daily-dharma-reflections": new URL(
    "/mobile-assets/community-bg/daily-dharma-reflections.webp",
    import.meta.url,
  ).href,
  "festivals-rituals": new URL(
    "/mobile-assets/community-bg/festival.webp",
    import.meta.url,
  ).href,
  "mantra-chanting-circle": new URL(
    "/mobile-assets/community-bg/mantraandchanting.webp",
    import.meta.url,
  ).href,
  "yoga-pranayama": new URL(
    "/mobile-assets/community-bg/yoga-pranaya.webp",
    import.meta.url,
  ).href,
  "meditation-mindfulness": new URL(
    "/mobile-assets/community-bg/meditationanmindfulness.webp",
    import.meta.url,
  ).href,
  "ayurveda-healing": new URL(
    "/mobile-assets/community-bg/ayurveda-healing.webp",
    import.meta.url,
  ).href,
  "dance-as-devotion": new URL(
    "/mobile-assets/community-bg/dance-devotion.webp",
    import.meta.url,
  ).href,
  "music-bhajans": new URL(
    "/mobile-assets/community-bg/music-bhajans.webp",
    import.meta.url,
  ).href,
  "ramayana-insights": new URL(
    "/mobile-assets/community-bg/ramayana-insights.webp",
    import.meta.url,
  ).href,
  "mahabharata-dialogues": new URL(
    "/mobile-assets/community-bg/mahabharatadialogues.webp",
    import.meta.url,
  ).href,
  "bhakti-devotion": new URL(
    "/mobile-assets/community-bg/bhakthianddevotion.webp",
    import.meta.url,
  ).href,
  "children-dharma": new URL(
    "/mobile-assets/community-bg/children-dharma.webp",
    import.meta.url,
  ).href,
  "sacred-stories": new URL(
    "/mobile-assets/community-bg/sacred-stories.webp",
    import.meta.url,
  ).href,
  "sanatan-modern-life": new URL(
    "/mobile-assets/community-bg/sanatan-modernlife.webp",
    import.meta.url,
  ).href,
  "sanatan-science-philosophy": new URL(
    "/mobile-assets/community-bg/sanatan-science-philosophy.webp",
    import.meta.url,
  ).href,
  "spiritual-travel": new URL(
    "/mobile-assets/community-bg/spiritual-travel.webp",
    import.meta.url,
  ).href,
  "temple-experiences": new URL(
    "/mobile-assets/community-bg/temple-experiences.webp",
    import.meta.url,
  ).href,
  "women-in-sanatan-dharma": new URL(
    "/mobile-assets/community-bg/women-in-santandharma.webp",
    import.meta.url,
  ).href,
  "yoga-pranaya": new URL(
    "/mobile-assets/community-bg/yoga-pranaya.webp",
    import.meta.url,
  ).href,
  "bhakthi-devotion": new URL(
    "/mobile-assets/community-bg/bhakthianddevotion.webp",
    import.meta.url,
  ).href,
  festival: new URL(
    "/mobile-assets/community-bg/festival.webp",
    import.meta.url,
  ).href,
  "mantra-chanting": new URL(
    "/mobile-assets/community-bg/mantraandchanting.webp",
    import.meta.url,
  ).href,
  "sanatan-modernlife": new URL(
    "/mobile-assets/community-bg/sanatan-modernlife.webp",
    import.meta.url,
  ).href,
  "mahabharata-dialog": new URL(
    "/mobile-assets/community-bg/mahabharatadialogues.webp",
    import.meta.url,
  ).href,
  "meditation-and-mindfulness": new URL(
    "/mobile-assets/community-bg/meditationanmindfulness.webp",
    import.meta.url,
  ).href,
  "1": new URL(
    "/mobile-assets/community-bg/daily-dharma-reflections.webp",
    import.meta.url,
  ).href,
  "2": new URL(
    "/mobile-assets/community-bg/festival.webp",
    import.meta.url,
  ).href,
  "3": new URL(
    "/mobile-assets/community-bg/mantraandchanting.webp",
    import.meta.url,
  ).href,
  "4": new URL(
    "/mobile-assets/community-bg/yoga-pranaya.webp",
    import.meta.url,
  ).href,
  "5": new URL(
    "/mobile-assets/community-bg/meditationanmindfulness.webp",
    import.meta.url,
  ).href,
  "6": new URL(
    "/mobile-assets/community-bg/ayurveda-healing.webp",
    import.meta.url,
  ).href,
  "7": new URL(
    "/mobile-assets/community-bg/dance-devotion.webp",
    import.meta.url,
  ).href,
  "8": new URL(
    "/mobile-assets/community-bg/music-bhajans.webp",
    import.meta.url,
  ).href,
  "9": new URL(
    "/mobile-assets/community-bg/ramayana-insights.webp",
    import.meta.url,
  ).href,
  "10": new URL(
    "/mobile-assets/community-bg/mahabharatadialogues.webp",
    import.meta.url,
  ).href,
  "11": new URL(
    "/mobile-assets/community-bg/bhakthianddevotion.webp",
    import.meta.url,
  ).href,
  "12": new URL(
    "/mobile-assets/community-bg/children-dharma.webp",
    import.meta.url,
  ).href,
};

const DEFAULT_COMMUNITY_IMAGE = new URL(
  "/mobile-assets/community-bg/daily-dharma-reflections.webp",
  import.meta.url,
).href;

export function resolveCommunityMediaUrl(value?: string | null): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `${WEB_ENV.imageBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function resolveCommunityImage(community: CommunityListItem): string {
  const remoteImage =
    resolveCommunityMediaUrl(community.media_url) ||
    resolveCommunityMediaUrl(community.image_url) ||
    resolveCommunityMediaUrl(community.icon);
  if (remoteImage) return remoteImage;

  return (
    COMMUNITY_BACKGROUNDS[String(community.slug || "")] ||
    COMMUNITY_BACKGROUNDS[String(community.id || "")] ||
    DEFAULT_COMMUNITY_IMAGE
  );
}

export function getConsistentCommunityStats(communityIdOrSlug: string | number) {
  const idStr = communityIdOrSlug.toString();
  let hash = 0;
  for (let index = 0; index < idStr.length; index += 1) {
    hash = (hash << 5) - hash + idStr.charCodeAt(index);
    hash |= 0;
  }

  const seed = Math.abs(hash);
  const pseudoRandom = (seed * 9301 + 49297) % 233280;
  const ratio = pseudoRandom / 233280;

  return {
    weeklyVisitors: `${Math.floor(ratio * 200) + 50}k`,
    weeklyContribution: `${Math.floor(ratio * 700) + 120}`,
  };
}
