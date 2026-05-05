import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CommunityTopBar } from "../../components/community/CommunityTopBar";
import {
  getTopCommunities,
  type CommunityListItem,
} from "../../engine/communityApi";
import { WEB_ENV } from "../../lib/env";

const PAGE_SIZE = 12;

const COMMUNITY_BACKGROUNDS: Record<string, string> = {
  "daily-dharma-reflections": new URL(
    "../../../../mobile/assets/community-bg/daily-dharma-reflections.jpeg",
    import.meta.url,
  ).href,
  "festivals-rituals": new URL(
    "../../../../mobile/assets/community-bg/festival.jpeg",
    import.meta.url,
  ).href,
  "mantra-chanting-circle": new URL(
    "../../../../mobile/assets/community-bg/mantraandchanting.jpeg",
    import.meta.url,
  ).href,
  "yoga-pranayama": new URL(
    "../../../../mobile/assets/community-bg/yoga-pranaya.jpeg",
    import.meta.url,
  ).href,
  "meditation-mindfulness": new URL(
    "../../../../mobile/assets/community-bg/meditationanmindfulness.jpeg",
    import.meta.url,
  ).href,
  "ayurveda-healing": new URL(
    "../../../../mobile/assets/community-bg/ayurveda-healing.jpeg",
    import.meta.url,
  ).href,
  "dance-as-devotion": new URL(
    "../../../../mobile/assets/community-bg/dance-devotion.jpeg",
    import.meta.url,
  ).href,
  "music-bhajans": new URL(
    "../../../../mobile/assets/community-bg/music-bhajans.jpeg",
    import.meta.url,
  ).href,
  "ramayana-insights": new URL(
    "../../../../mobile/assets/community-bg/ramayana-insights.jpeg",
    import.meta.url,
  ).href,
  "mahabharata-dialogues": new URL(
    "../../../../mobile/assets/community-bg/mahabharatadialogues.jpeg",
    import.meta.url,
  ).href,
  "bhakti-devotion": new URL(
    "../../../../mobile/assets/community-bg/bhakthianddevotion.jpeg",
    import.meta.url,
  ).href,
  "children-dharma": new URL(
    "../../../../mobile/assets/community-bg/children-dharma.jpeg",
    import.meta.url,
  ).href,
  "sacred-stories": new URL(
    "../../../../mobile/assets/community-bg/sacred-stories.jpeg",
    import.meta.url,
  ).href,
  "sanatan-modern-life": new URL(
    "../../../../mobile/assets/community-bg/sanatan-modernlife.jpeg",
    import.meta.url,
  ).href,
  "sanatan-science-philosophy": new URL(
    "../../../../mobile/assets/community-bg/sanatan-science-philosophy.jpeg",
    import.meta.url,
  ).href,
  "spiritual-travel": new URL(
    "../../../../mobile/assets/community-bg/spiritual-travel.jpeg",
    import.meta.url,
  ).href,
  "temple-experiences": new URL(
    "../../../../mobile/assets/community-bg/temple-experiences.jpeg",
    import.meta.url,
  ).href,
  "women-in-sanatan-dharma": new URL(
    "../../../../mobile/assets/community-bg/women-in-santandharma.jpeg",
    import.meta.url,
  ).href,
  "yoga-pranaya": new URL(
    "../../../../mobile/assets/community-bg/yoga-pranaya.jpeg",
    import.meta.url,
  ).href,
  "bhakthi-devotion": new URL(
    "../../../../mobile/assets/community-bg/bhakthianddevotion.jpeg",
    import.meta.url,
  ).href,
  festival: new URL(
    "../../../../mobile/assets/community-bg/festival.jpeg",
    import.meta.url,
  ).href,
  "mantra-chanting": new URL(
    "../../../../mobile/assets/community-bg/mantraandchanting.jpeg",
    import.meta.url,
  ).href,
  "sanatan-modernlife": new URL(
    "../../../../mobile/assets/community-bg/sanatan-modernlife.jpeg",
    import.meta.url,
  ).href,
  "mahabharata-dialog": new URL(
    "../../../../mobile/assets/community-bg/mahabharatadialogues.jpeg",
    import.meta.url,
  ).href,
  "meditation-and-mindfulness": new URL(
    "../../../../mobile/assets/community-bg/meditationanmindfulness.jpeg",
    import.meta.url,
  ).href,
  "1": new URL(
    "../../../../mobile/assets/community-bg/daily-dharma-reflections.jpeg",
    import.meta.url,
  ).href,
  "2": new URL(
    "../../../../mobile/assets/community-bg/festival.jpeg",
    import.meta.url,
  ).href,
  "3": new URL(
    "../../../../mobile/assets/community-bg/mantraandchanting.jpeg",
    import.meta.url,
  ).href,
  "4": new URL(
    "../../../../mobile/assets/community-bg/yoga-pranaya.jpeg",
    import.meta.url,
  ).href,
  "5": new URL(
    "../../../../mobile/assets/community-bg/meditationanmindfulness.jpeg",
    import.meta.url,
  ).href,
  "6": new URL(
    "../../../../mobile/assets/community-bg/ayurveda-healing.jpeg",
    import.meta.url,
  ).href,
  "7": new URL(
    "../../../../mobile/assets/community-bg/dance-devotion.jpeg",
    import.meta.url,
  ).href,
  "8": new URL(
    "../../../../mobile/assets/community-bg/music-bhajans.jpeg",
    import.meta.url,
  ).href,
  "9": new URL(
    "../../../../mobile/assets/community-bg/ramayana-insights.jpeg",
    import.meta.url,
  ).href,
  "10": new URL(
    "../../../../mobile/assets/community-bg/mahabharatadialogues.jpeg",
    import.meta.url,
  ).href,
  "11": new URL(
    "../../../../mobile/assets/community-bg/bhakthianddevotion.jpeg",
    import.meta.url,
  ).href,
  "12": new URL(
    "../../../../mobile/assets/community-bg/children-dharma.jpeg",
    import.meta.url,
  ).href,
};

const DEFAULT_COMMUNITY_IMAGE = new URL(
  "../../../../mobile/assets/community-bg/daily-dharma-reflections.jpeg",
  import.meta.url,
).href;

function resolveMediaUrl(value?: string | null): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `${WEB_ENV.imageBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

function resolveCommunityImage(community: CommunityListItem): string {
  const remoteImage =
    resolveMediaUrl(community.media_url) ||
    resolveMediaUrl(community.image_url) ||
    resolveMediaUrl(community.icon);
  if (remoteImage) return remoteImage;

  return (
    COMMUNITY_BACKGROUNDS[String(community.slug || "")] ||
    COMMUNITY_BACKGROUNDS[String(community.id || "")] ||
    DEFAULT_COMMUNITY_IMAGE
  );
}

export function CommunityTopCommunitiesPage() {
  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const lang =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "en"
      : "en";

  useEffect(() => {
    const loadTopCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopCommunities({ page, page_size: PAGE_SIZE, lang });
        setCommunities(data.results ?? []);
        const count = Number(data.count ?? 0);
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
      } catch {
        setError("Could not load top communities. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadTopCommunities();
  }, [lang, page]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  return (
    <div style={{ minHeight: "100dvh", background: "var(--kalpx-bg)" }}>
      <CommunityTopBar activeLabel="Explore" />

      <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{ padding: "12px 20px 40px" }}>
          {loading && communities.length === 0 && (
            <div
              style={{
                minHeight: 260,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d69e2e",
                fontWeight: 600,
              }}
            >
              Loading communities...
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "20px 0", color: "#9f3a2f" }}>{error}</div>
          )}

          {!error && (
            <div style={{ paddingTop: 16 }}>
              {communities.map((community) => (
                <div
                  key={String(community.id || community.slug)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 0,
                    margin: "0 0 25px",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      color: "#666",
                      fontSize: 18,
                      textAlign: "left",
                      flexShrink: 0,
                    }}
                  >
                    {community.rank || "-"}
                  </div>
                  <img
                    src={resolveCommunityImage(community)}
                    alt={community.name || "Community"}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 30,
                      background: "#f0f0f0",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      color: "#1a1a1a",
                      fontSize: 18,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                  >
                    {community.name || "Community"}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    paddingBottom: 40,
                  }}
                >
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    style={navButtonStyle(page === 1)}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0 8px",
                        fontSize: 18,
                        color: page === pageNumber ? "#D69E2E" : "#888",
                        fontWeight: page === pageNumber ? 700 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={page === totalPages}
                    style={navButtonStyle(page === totalPages)}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function navButtonStyle(disabled: boolean) {
  return {
    border: "none",
    background: "transparent",
    color: "#888",
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  } as const;
}
