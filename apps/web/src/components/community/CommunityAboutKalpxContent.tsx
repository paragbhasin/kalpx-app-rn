import { ArrowDown, ArrowUp } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

const heroImage = new URL(
  "../../../../mobile/assets/about-kalpx3.png",
  import.meta.url,
).href;
const postImage = new URL(
  "../../../../mobile/assets/about-kalpx2.png",
  import.meta.url,
).href;
const commentImage = new URL(
  "../../../../mobile/assets/about-kalpx4.png",
  import.meta.url,
).href;

export function CommunityAboutKalpxContent() {
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 40 }}>
      <section
        style={{
          padding: "24px 24px 40px",
          background: "#fdfaf2",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: "0 0 16px",
            fontSize: 28,
            fontWeight: 700,
            color: "#1a1a1b",
            fontFamily: "Georgia, serif",
          }}
        >
          The heart of your inner journey
        </h1>
        <p
          style={{
            margin: "0 auto 24px",
            maxWidth: 520,
            fontSize: 15,
            lineHeight: "24px",
            color: "#4a4a4a",
          }}
        >
          KalpX is home to countless paths for personal growth, mindful
          practices, and genuine self-discovery. Whether you’re exploring
          meditation, building inner resilience, seeking clarity in your career,
          or simply nurturing calm in daily life, there’s a guided journey on
          KalpX for you.
        </p>
        <img
          src={heroImage}
          alt="About KalpX"
          style={{
            width: "90%",
            maxWidth: 420,
            height: "auto",
            objectFit: "contain",
          }}
        />
      </section>

      <Section
        title="Post"
        text="The Community can share content by posting stories, links, image, and Videos."
      >
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}
        >
          <img
            src={postImage}
            alt="Community post"
            style={{
              width: "100%",
              maxWidth: 440,
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </Section>

      <Section
        title="Comment"
        text="The Community can share content by posting stories, links, images, and videos."
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            minHeight: 260,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={commentImage}
              alt="Community comments"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            <CommentBubble style={{ top: -10, left: -40 }}>
              I Like the fact that everyone is here is so spiritual
            </CommentBubble>
            <CommentBubble style={{ right: -60, bottom: 20 }}>
              Pure devotion, pure strength. This story never fails to touch the
              heart.
            </CommentBubble>
          </div>
        </div>
      </Section>

      <Section
        title="Vote"
        text="Components & posts can be Upvoted or downvoted. The most interesting content rises to the top."
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            marginBottom: 50,
          }}
        >
          <img
            src={postImage}
            alt="Community voting"
            style={{
              width: "100%",
              maxWidth: 440,
              height: "auto",
              objectFit: "contain",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <ArrowDown size={14} color="#D69E2E" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a202c" }}>
              Vote
            </span>
            <ArrowUp size={14} color="#D69E2E" />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section style={{ padding: "40px 24px 0", background: "#fff" }}>
      <h2
        style={{
          margin: "0 0 12px",
          fontSize: 32,
          fontWeight: 700,
          color: "#1a1a1b",
          fontFamily: "Georgia, serif",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: "0 0 24px",
          fontSize: 15,
          lineHeight: "24px",
          color: "#4a4a4a",
        }}
      >
        {text}
      </p>
      {children}
    </section>
  );
}

function CommentBubble({
  children,
  style,
}: {
  children: ReactNode;
  style: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        maxWidth: 160,
        background: "#fff",
        padding: 10,
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        fontSize: 11,
        lineHeight: "16px",
        color: "#4a5568",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
