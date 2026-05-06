import {
  ArrowBigDown,
  ArrowBigUp,
  CircleHelp,
  MessageCircle,
  Reply,
} from "lucide-react";
import React from "react";

interface CommunityReactionBarProps {
  upvoteCount?: number;
  commentCount?: number;
  shareCount?: number;
  isUpvoting?: boolean;
  onUpvote?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onAskQuestion?: () => void;
  userVote?: -1 | 0 | 1 | null;
  compact?: boolean;
}

export function CommunityReactionBar({
  upvoteCount = 0,
  commentCount = 0,
  shareCount = 0,
  isUpvoting = false,
  onUpvote,
  onComment,
  onShare,
  onAskQuestion,
  userVote = null,
  compact = false,
}: CommunityReactionBarProps) {
  const iconSize = compact ? 18 : 20;
  const fontSize = compact ? 16 : 17;
  const pillStyle: React.CSSProperties = {
    borderRadius: 8,
    border: "1px solid #d7d1c7",
    padding: "8px 14px",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#312c27",
    cursor: "pointer",

    boxSizing: "border-box",
    flexShrink: 0,
  };
  const wrapClick =
    (handler?: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      handler?.();
    };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        marginTop: compact ? 8 : 12,
        gap: 8,
        width: "100%",
      }}
    >
      <button
        type="button"
        onClick={wrapClick(onUpvote)}
        disabled={isUpvoting}
        style={{
          ...pillStyle,
          cursor: onUpvote ? "pointer" : "default",
          opacity: isUpvoting ? 0.6 : 1,
          gap: 4,
          minWidth: 108,
          justifyContent: "space-between",
        }}
        aria-label={`Upvote (${upvoteCount})`}
      >
        <ArrowBigUp
          size={iconSize}
          color={userVote === 1 ? "var(--kalpx-cta)" : "#5d5650"}
          fill={userVote === 1 ? "var(--kalpx-cta)" : "none"}
        />
        <span style={{ fontSize, fontWeight: 600, lineHeight: 1 }}>
          {upvoteCount}
        </span>
        <ArrowBigDown size={iconSize} color="#5d5650" />
      </button>

      <button
        type="button"
        onClick={wrapClick(onComment)}
        style={{
          ...pillStyle,
          cursor: onComment ? "pointer" : "default",
          gap: 8,
          minWidth: 98,
        }}
        aria-label={`Comments (${commentCount})`}
      >
        <MessageCircle size={iconSize} />
        <span style={{ fontSize, fontWeight: 500, lineHeight: 1 }}>
          {commentCount}
        </span>
      </button>

      <button
        type="button"
        onClick={wrapClick(onShare)}
        style={{
          ...pillStyle,
          cursor: onShare ? "pointer" : "default",
          gap: 8,
          minWidth: 98,
        }}
        aria-label={`Shares (${shareCount})`}
      >
        <Reply size={iconSize} />
        <span style={{ fontSize, fontWeight: 500, lineHeight: 1 }}>
          {shareCount}
        </span>
      </button>

      <button
        type="button"
        onClick={wrapClick(onAskQuestion)}
        style={{
          ...pillStyle,
          cursor: onAskQuestion ? "pointer" : "default",
          gap: 8,
          minWidth: "fit-content",
          justifyContent: "flex-start",
        }}
        aria-label="Ask question"
      >
        <CircleHelp size={iconSize} />
        <span style={{ fontSize, fontWeight: 500, lineHeight: 1 }}>
          Ask question
        </span>
      </button>
    </div>
  );
}
