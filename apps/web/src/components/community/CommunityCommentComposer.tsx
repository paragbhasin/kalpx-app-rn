import { communityCommentSchema } from "@kalpx/validation";
import { Send } from "lucide-react";
import React, { useState } from "react";

interface CommunityCommentComposerProps {
  postId: number | string;
  isAuthenticated: boolean;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (content: string) => void;
  onRequireAuth?: () => void;
  placeholder?: string;
  submitLabel?: string;
  variant?: "default" | "inline";
  autoFocus?: boolean;
  leadingAvatarSrc?: string;
  leadingAvatarLabel?: string;
}

export function CommunityCommentComposer({
  postId: _postId,
  isAuthenticated,
  submitting = false,
  error = null,
  onSubmit,
  onRequireAuth,
  placeholder = "Write a comment…",
  submitLabel = "Post",
  variant = "default",
  autoFocus = false,
  leadingAvatarSrc,
  leadingAvatarLabel = "K",
}: CommunityCommentComposerProps) {
  const [content, setContent] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
    const result = communityCommentSchema.safeParse({ content });
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message ?? "Invalid comment");
      return;
    }
    setValidationError(null);
    onSubmit(content.trim());
    setContent("");
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "#fdf8ef",
          border: "1.5px solid #f0e8d8",
          cursor: "pointer",
          textAlign: "center",
        }}
        onClick={onRequireAuth}
      >
        <p style={{ fontSize: 13, color: "#b06840", margin: 0 }}>
          Sign in to leave a comment
        </p>
      </div>
    );
  }

  const displayError = validationError ?? error;

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 16,
            border: `1.5px solid ${displayError ? "#fca5a5" : "#e1c48d"}`,
            background: "#fff",
            padding: "8px 8px 8px 14px",
            marginBottom: 50,
          }}
        >
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            maxLength={1000}
            autoFocus={autoFocus}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              color: "#2d1a0e",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            style={{
              width: 25,
              height: 25,
              borderRadius: "50%",
              border: "none",
              background: submitting || !content.trim() ? "#ead39a" : "#e8c66c",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: submitting || !content.trim() ? "not-allowed" : "pointer",
              flexShrink: 0,
            }}
            aria-label={submitLabel}
          >
            <Send size={15} fill="currentColor" />
          </button>
        </div>
        {displayError && (
          <p style={{ fontSize: 12, color: "#b91c1c", marginTop: 6 }}>
            {displayError}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {leadingAvatarSrc ? (
          <img
            src={leadingAvatarSrc}
            alt="Your avatar"
            style={{
              width: 25,
              height: 25,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 25,
              height: 25,
              borderRadius: "50%",
              background: "#f3e8cf",
              color: "#9c7b2f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {leadingAvatarLabel.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 16,
            border: `1.5px solid ${displayError ? "#fca5a5" : "#d8dee8"}`,
            background: "#fff",
            padding: "8px 8px 8px 16px",
          }}
        >
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            maxLength={1000}
            autoFocus={autoFocus}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              color: "#2d1a0e",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            style={{
              width: 25,
              height: 25,
              borderRadius: "50%",
              border: "none",
              background: submitting || !content.trim() ? "#ead39a" : "#e8c66c",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: submitting || !content.trim() ? "not-allowed" : "pointer",
              flexShrink: 0,
            }}
            aria-label={submitLabel}
          >
            <Send size={15} fill="currentColor" />
          </button>
        </div>
      </div>
      {displayError && (
        <p style={{ fontSize: 12, color: "#b91c1c", marginTop: 6 }}>
          {displayError}
        </p>
      )}
    </form>
  );
}
