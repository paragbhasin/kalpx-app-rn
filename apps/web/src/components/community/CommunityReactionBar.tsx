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
  onDownvote?: () => void;
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
  onDownvote,
  onComment,
  onShare,
  onAskQuestion,
  userVote = null,
  compact = false,
}: CommunityReactionBarProps) {
  const iconSize = compact ? 15 : 16;
  const fontSize = compact ? 13 : 14;
  const pillStyle: React.CSSProperties = {
    borderRadius: 8,
    border: "1px solid #d7d1c7",
    padding: "6px 8px",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#312c27",
    cursor: "pointer",

    boxSizing: "border-box",
    flexShrink: 1,
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
        gap: 6,
        width: "100%",
      }}
    >
      <div
        style={{
          ...pillStyle,
          opacity: isUpvoting ? 0.6 : 1,
          gap: 4,
          minWidth: 64,
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          onClick={wrapClick(onUpvote)}
          disabled={isUpvoting}
          style={{
            border: "none",
            background: "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            cursor: onUpvote ? "pointer" : "default",
          }}
          aria-label={`Upvote (${upvoteCount})`}
        >
          <ArrowBigUp
            size={iconSize}
            color={userVote === 1 ? "var(--kalpx-cta)" : "#5d5650"}
            fill={userVote === 1 ? "var(--kalpx-cta)" : "none"}
          />
        </button>
        <span style={{ fontSize, fontWeight: 600, lineHeight: 1 }}>
          {upvoteCount}
        </span>
        <button
          type="button"
          onClick={wrapClick(onDownvote)}
          disabled={isUpvoting}
          style={{
            border: "none",
            background: "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            cursor: onDownvote ? "pointer" : "default",
          }}
          aria-label={`Downvote (${upvoteCount})`}
        >
          <ArrowBigDown
            size={iconSize}
            color={userVote === -1 ? "var(--kalpx-cta)" : "#5d5650"}
            fill={userVote === -1 ? "var(--kalpx-cta)" : "none"}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={wrapClick(onComment)}
        style={{
          ...pillStyle,
          cursor: onComment ? "pointer" : "default",
          gap: 6,
          minWidth: 44,
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
          gap: 6,
          minWidth: 44,
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
          gap: 6,
          minWidth: 0,
          justifyContent: "center",
        }}
        aria-label="Ask question"
      >
        <CircleHelp size={iconSize} style={{ flexShrink: 0 }} />
        <span
          style={{
            fontSize,
            fontWeight: 500,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Ask question
        </span>
      </button>
    </div>
  );
}
