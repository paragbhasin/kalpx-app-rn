import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const heroImage = new URL(
  "/mobile-assets/about-kalpx3.png",
  import.meta.url,
).href;
const postImage = new URL(
  "/mobile-assets/about-kalpx2.webp",
  import.meta.url,
).href;
const commentImage = new URL(
  "/mobile-assets/about-kalpx4.webp",
  import.meta.url,
).href;

export function CommunityAboutKalpxContent() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return (
    <div style={pageWrapStyle}>
      <HeroSection isMobile={isMobile} />

      <FeatureSection
        title="Post"
        text="The Community can share content by posting stories, links, image, and Videos."
        mediaPosition="right"
        isMobile={isMobile}
      >
        <PostPreview />
      </FeatureSection>

      <FeatureSection
        title="Comment"
        text="The Community can share content by posting stories, links, images, and videos."
        mediaPosition="left"
        isMobile={isMobile}
      >
        <CommentPreview />
      </FeatureSection>

      <FeatureSection
        title="Vote"
        text="Components & posts can be Upvoted or downvoted. The most interesting content rises to the top."
        mediaPosition="right"
        isMobile={isMobile}
      >
        <VotePreview />
      </FeatureSection>
    </div>
  );
}

function HeroSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={isMobile ? heroGridMobileStyle : heroGridStyle}>
      <div style={isMobile ? heroTextMobileStyle : heroTextStyle}>
        <h1 style={isMobile ? heroTitleMobileStyle : heroTitleStyle}>
          The heart of your inner journey
        </h1>
        <p style={isMobile ? heroBodyMobileStyle : heroBodyStyle}>
          KalpX is home to countless paths for personal growth, mindful
          practices, and genuine self-discovery. Whether you're exploring
          meditation, building inner resilience, seeking clarity in your career,
          or simply nurturing calm in daily life, there's a guided journey on
          KalpX for you.
        </p>
      </div>

      <div style={heroVisualWrapStyle}>
        <img src={heroImage} alt="About KalpX" style={heroImageStyle} />
      </div>
    </section>
  );
}

function FeatureSection({
  title,
  text,
  children,
  mediaPosition,
  isMobile,
}: {
  title: string;
  text: string;
  children: ReactNode;
  mediaPosition: "left" | "right";
  isMobile: boolean;
}) {
  const media = <div style={visualPanelStyle}>{children}</div>;
  const copy = (
    <div style={isMobile ? featureCopyMobileStyle : featureCopyStyle}>
      <h2 style={isMobile ? featureTitleMobileStyle : featureTitleStyle}>
        {title}
      </h2>
      <p style={isMobile ? featureTextMobileStyle : featureTextStyle}>{text}</p>
    </div>
  );

  return (
    <section style={isMobile ? featureRowMobileStyle : featureRowStyle}>
      {mediaPosition === "left" ? media : copy}
      {mediaPosition === "left" ? copy : media}
    </section>
  );
}

function PostPreview() {
  return <img src={postImage} alt="Community post" style={phonePreviewStyle} />;
}

function CommentPreview() {
  return (
    <div style={commentPanelStyle}>
      <img
        src={commentImage}
        alt="Community comments"
        style={commentPreviewImageStyle}
      />
      <CommentBubble style={{ top: 96, left: -28, maxWidth: 196 }}>
        I Like the fact that everyone is here is so spiritual
      </CommentBubble>
      <CommentBubble style={{ right: -28, top: 168, maxWidth: 170 }}>
        Pure devotion, pure strength. This story never fails to touch the heart.
      </CommentBubble>
    </div>
  );
}

function VotePreview() {
  return (
    <div style={voteWrapStyle}>
      <img src={postImage} alt="Community voting" style={phonePreviewStyle} />
      <div style={voteBadgeStyle}>
        <ArrowDown size={16} color="#D69E2E" />
        <span style={voteBadgeTextStyle}>Vote</span>
        <ArrowUp size={16} color="#D69E2E" />
      </div>
    </div>
  );
}

function CommentBubble({
  children,
  style,
}: {
  children: ReactNode;
  style: CSSProperties;
}) {
  return <div style={{ ...commentBubbleStyle, ...style }}>{children}</div>;
}

const pageWrapStyle = {
  padding: "28px 28px 72px",
  display: "grid",
  gap: 96,
} as const;

const heroGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 560px",
  alignItems: "center",
  columnGap: 72,
} as const;

const heroGridMobileStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  rowGap: 28,
  alignItems: "start",
} as const;

const heroTextStyle = {
  maxWidth: 720,
  textAlign: "center",
  justifySelf: "center",
} as const;

const heroTextMobileStyle = {
  width: "100%",
  maxWidth: "100%",
  textAlign: "left",
  justifySelf: "stretch",
} as const;

const heroTitleStyle = {
  margin: 0,
  color: "#050505",
  fontSize: 28,
  lineHeight: 1.12,
  fontWeight: 800,
  letterSpacing: "-0.04em",
} as const;

const heroTitleMobileStyle = {
  ...heroTitleStyle,
  fontSize: 32,
  lineHeight: 1.06,
} as const;

const heroBodyStyle = {
  margin: "36px auto 0",
  maxWidth: 760,
  color: "#3f4248",
  fontSize: 18,
  lineHeight: 1.45,
  fontWeight: 400,
} as const;

const heroBodyMobileStyle = {
  margin: "24px 0 0",
  maxWidth: "100%",
  color: "#3f4248",
  fontSize: 16,
  lineHeight: 1.55,
  fontWeight: 400,
} as const;

const heroVisualWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

const heroImageStyle = {
  width: "100%",
  maxWidth: 560,
  height: "auto",
  objectFit: "contain",
} as const;

const featureRowStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 620px",
  alignItems: "center",
  columnGap: 92,
  minHeight: 440,
} as const;

const featureRowMobileStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  rowGap: 24,
  alignItems: "start",
} as const;

const featureCopyStyle = {
  maxWidth: 640,
} as const;

const featureCopyMobileStyle = {
  width: "100%",
  maxWidth: "100%",
} as const;

const featureTitleStyle = {
  margin: 0,
  color: "#050505",
  fontSize: 28,
  lineHeight: 1.05,
  fontWeight: 800,
  letterSpacing: "-0.04em",
} as const;

const featureTitleMobileStyle = {
  ...featureTitleStyle,
  fontSize: 32,
  lineHeight: 1.08,
} as const;

const featureTextStyle = {
  margin: "34px 0 0",
  color: "#3f4248",
  fontSize: 18,
  lineHeight: 1.45,
  fontWeight: 400,
} as const;

const featureTextMobileStyle = {
  margin: "18px 0 0",
  color: "#3f4248",
  fontSize: 16,
  lineHeight: 1.55,
  fontWeight: 400,
} as const;

const visualPanelStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
} as const;

const mediaCardStyle = {
  width: "100%",

  borderRadius: 36,
  background: "#fbf3db",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "36px 28px",
  overflow: "hidden",
} as const;

const phonePreviewStyle = {
  width: "100%",
  maxWidth: 370,
  height: "auto",
  objectFit: "contain",
  display: "block",
} as const;

const floatingPostCardStyle = {
  position: "absolute",
  right: 28,
  bottom: 18,
  width: 260,
  borderRadius: 30,
  background: "#fff",
  boxShadow: "0 22px 48px rgba(24, 19, 12, 0.14)",
  padding: "18px 18px 16px",
} as const;

const floatingPostTitleStyle = {
  color: "#161616",
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 700,
  fontFamily: "Georgia, Times New Roman, serif",
  marginBottom: 14,
} as const;

const floatingPostImageFrameStyle = {
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: 12,
  background: "#e4c16d",
} as const;

const floatingPostImageStyle = {
  width: "100%",
  height: 172,
  objectFit: "cover",
  objectPosition: "center 42%",
  display: "block",
} as const;

const ctaButtonStyle = {
  width: "100%",
  minHeight: 44,
  border: "none",
  borderRadius: 8,
  background: "#d9a40a",
  color: "#fff",
  fontSize: 20,
  fontWeight: 700,
  cursor: "default",
} as const;

const commentPanelStyle = {
  width: "100%",
  maxWidth: 520,
  minHeight: 100,
  borderRadius: 28,
  background: "#dfa60a",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px 24px",
} as const;

const commentPreviewImageStyle = {
  width: "100%",
  maxWidth: 300,
  height: "auto",
  objectFit: "contain",
  display: "block",
} as const;

const commentBubbleStyle = {
  position: "absolute",
  background: "#fff",
  border: "2px solid #d9a40a",
  borderRadius: 12,
  boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
  padding: "12px 14px",
  color: "#343434",
  fontSize: 13,
} as const;

const voteWrapStyle = {
  width: "100%",

  borderRadius: 36,
  background: "#fbf3db",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "36px 28px",
} as const;

const voteBadgeStyle = {
  position: "absolute",
  left: 24,
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#fff",
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #ece1bf",
  boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
} as const;

const voteBadgeTextStyle = {
  fontSize: 18,
  lineHeight: 1,
  fontWeight: 700,
  color: "#222",
} as const;
