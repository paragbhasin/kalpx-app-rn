import type { CommunityComment } from "@kalpx/types";
import { getPostAuthor } from "@kalpx/types";
import { Ellipsis, MessageCircle } from "lucide-react";
import React, { useMemo, useState } from "react";
import { CommunityAuthorRow } from "./CommunityAuthorRow";
import { CommunityCommentComposer } from "./CommunityCommentComposer";

interface CommunityCommentListProps {
  comments: CommunityComment[];
  loading?: boolean;
  currentUserId?: number | string | null;
  currentUserEmail?: string | null;
  currentUsername?: string | null;
  isAuthenticated?: boolean;
  actionLoadingId?: number | string | null;
  onReply?: (comment: CommunityComment) => void;
  onEdit?: (
    commentId: number | string,
    content: string,
  ) => Promise<void> | void;
  onDelete?: (commentId: number | string) => Promise<void> | void;
  onReport?: (commentId: number | string) => Promise<void> | void;
  onRequireAuth?: () => void;
  replyingToId?: number | string | null;
  replySubmitting?: boolean;
  replyError?: string | null;
  onCancelReply?: () => void;
  onSubmitReply?: (content: string) => void;
}

function getCommentText(comment: CommunityComment): string {
  return comment.content ?? comment.body ?? comment.text ?? "";
}

function flattenCount(list: CommunityComment[]): number {
  return list.reduce(
    (total, comment) => total + 1 + flattenCount(comment.children ?? []),
    0,
  );
}

function buildAvatar(author: any) {
  return author?.avatar_url ?? author?.profile_pic ?? author?.avatar;
}

function CommentItem({
  comment,
  depth = 0,
  currentUserId,
  currentUserEmail,
  currentUsername,
  isAuthenticated = false,
  actionLoadingId = null,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onRequireAuth,
  replyingToId,
  replySubmitting = false,
  replyError = null,
  onCancelReply,
  onSubmitReply,
}: {
  comment: CommunityComment;
  depth?: number;
  currentUserId?: number | string | null;
  currentUserEmail?: string | null;
  currentUsername?: string | null;
  isAuthenticated?: boolean;
  actionLoadingId?: number | string | null;
  onReply?: (comment: CommunityComment) => void;
  onEdit?: (
    commentId: number | string,
    content: string,
  ) => Promise<void> | void;
  onDelete?: (commentId: number | string) => Promise<void> | void;
  onReport?: (commentId: number | string) => Promise<void> | void;
  onRequireAuth?: () => void;
  replyingToId?: number | string | null;
  replySubmitting?: boolean;
  replyError?: string | null;
  onCancelReply?: () => void;
  onSubmitReply?: (content: string) => void;
}) {
  const text = getCommentText(comment);
  const author = getPostAuthor({
    creator: comment.creator,
    author: comment.author,
  });
  const avatar = buildAvatar(author);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [draft, setDraft] = useState(text);
  const creator = comment.creator ?? comment.author ?? null;
  const creatorId = creator?.id ?? null;
  const creatorEmail = (creator as any)?.email ?? null;
  const creatorUsername = creator?.username ?? null;
  const normalizedCurrentEmail = currentUserEmail?.trim().toLowerCase() ?? null;
  const normalizedCreatorEmail = creatorEmail?.trim().toLowerCase() ?? null;
  const normalizedCurrentUsername =
    currentUsername?.trim().toLowerCase() ?? null;
  const normalizedCreatorUsername =
    creatorUsername?.trim().toLowerCase() ?? null;
  const isOwner =
    (currentUserId != null &&
      creatorId != null &&
      String(currentUserId) === String(creatorId)) ||
    (!!normalizedCurrentEmail &&
      !!normalizedCreatorEmail &&
      normalizedCurrentEmail === normalizedCreatorEmail) ||
    (!!normalizedCurrentUsername &&
      !!normalizedCreatorUsername &&
      normalizedCurrentUsername === normalizedCreatorUsername);
  const isBusy =
    actionLoadingId != null && String(actionLoadingId) === String(comment.id);
  const replies = comment.children ?? [];
  const isReplyingHere =
    replyingToId != null && String(replyingToId) === String(comment.id);

  const ensureAuthed = () => {
    if (isAuthenticated) return true;
    onRequireAuth?.();
    return false;
  };

  const handleReply = () => {
    if (!ensureAuthed()) return;
    if (isReplyingHere) {
      onCancelReply?.();
      return;
    }
    onReply?.(comment);
  };

  const handleSaveEdit = async () => {
    const next = draft.trim();
    if (!next || next === text) {
      setIsEditing(false);
      setDraft(text);
      return;
    }
    await onEdit?.(comment.id, next);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!ensureAuthed()) return;
    setDeleteConfirmOpen(false);
    await onDelete?.(comment.id);
  };

  const handleReport = async () => {
    setMenuOpen(false);
    if (!ensureAuthed()) return;
    const ok = window.confirm("Report this comment?");
    if (!ok) return;
    await onReport?.(comment.id);
  };

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 18 : 0,
        paddingLeft: depth > 0 ? 14 : 0,
        borderLeft: depth > 0 ? "1px solid #ece1cb" : "none",
        marginBottom: 14,
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <CommunityAuthorRow
              author={author ? { ...author, avatar_url: avatar } : author}
              timestamp={comment.created_at}
              compact
            />
          </div>

          <button
            onClick={() => setMenuOpen((value) => !value)}
            style={{
              background: "none",
              border: "none",
              color: "#7d7d7d",
              padding: 0,
              cursor: "pointer",
              marginTop: 2,
              flexShrink: 0,
            }}
            aria-label="Comment actions"
          >
            <Ellipsis size={18} />
          </button>
        </div>

        {menuOpen && (
          <>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close comment menu"
              style={{
                position: "fixed",
                inset: 0,
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                zIndex: 20,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 26,
                right: 0,
                minWidth: 110,
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: 12,
                boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
                zIndex: 30,
                overflow: "hidden",
              }}
            >
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                    }}
                    style={commentMenuItemStyle}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                    style={{
                      ...commentMenuItemStyle,
                      color: "#ff3b30",
                      borderTop: "1px solid #f1f1f1",
                    }}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    void handleReport();
                  }}
                  style={{ ...commentMenuItemStyle, color: "#ff3b30" }}
                >
                  Report
                </button>
              )}
            </div>
          </>
        )}

        {deleteConfirmOpen && (
          <>
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              aria-label="Close delete modal"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                border: "none",
                padding: 0,
                margin: 0,
                zIndex: 40,
              }}
            />
            <div
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "calc(100% - 32px)",
                maxWidth: 360,
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
                padding: 20,
                zIndex: 50,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#2d1a0e",
                  marginBottom: 8,
                }}
              >
                Delete comment
              </div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#6b6258",
                  margin: "0 0 18px",
                }}
              >
                Are you sure you want to delete this comment?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  style={{
                    border: "1px solid #d8d0c2",
                    background: "#fff",
                    color: "#4a433d",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={isBusy}
                  style={{
                    border: "none",
                    background: "#ff3b30",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isBusy ? "not-allowed" : "pointer",
                    opacity: isBusy ? 0.65 : 1,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isEditing ? (
        <div style={{ marginTop: 8, marginBottom: 40 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1.5px solid #e1c48d",
              borderRadius: 10,
              padding: "10px 12px",
              fontFamily: "inherit",
              fontSize: 14,
              color: "#2d1a0e",
              resize: "vertical",
              outline: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 8,
            }}
          >
            <button
              onClick={() => {
                setIsEditing(false);
                setDraft(text);
              }}
              style={commentTextButtonStyle}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                void handleSaveEdit();
              }}
              disabled={isBusy || !draft.trim()}
              style={{
                ...commentTextButtonStyle,
                color: "#c69122",
                fontWeight: 700,
                opacity: isBusy || !draft.trim() ? 0.6 : 1,
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p
          style={{
            fontSize: 14,
            color: "#333",
            lineHeight: 1.55,
            marginTop: 8,
            marginBottom: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </p>
      )}

      {!isEditing && (
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button
            onClick={handleReply}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#6f7480",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
            className={isReplyingHere ? "" : "mb-[30px]"}
          >
            <MessageCircle size={14} />
            Reply
          </button>
        </div>
      )}

      {isReplyingHere && (
        <div style={{ marginTop: 14, marginBottom: 8 }}>
          <CommunityCommentComposer
            postId={comment.post ?? ""}
            isAuthenticated={isAuthenticated}
            submitting={replySubmitting}
            error={replyError}
            onSubmit={(content) => onSubmitReply?.(content)}
            onRequireAuth={onRequireAuth}
            placeholder={`Replying to ${author?.username || author?.profile_name || author?.display_name || "user"}...`}
            submitLabel="Reply"
            variant="inline"
            autoFocus
          />
        </div>
      )}

      {replies.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {replies.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              depth={depth + 1}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              currentUsername={currentUsername}
              isAuthenticated={isAuthenticated}
              actionLoadingId={actionLoadingId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              onRequireAuth={onRequireAuth}
              replyingToId={replyingToId}
              replySubmitting={replySubmitting}
              replyError={replyError}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommunityCommentList({
  comments,
  loading = false,
  currentUserId = null,
  currentUserEmail = null,
  currentUsername = null,
  isAuthenticated = false,
  actionLoadingId = null,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onRequireAuth,
  replyingToId = null,
  replySubmitting = false,
  replyError = null,
  onCancelReply,
  onSubmitReply,
}: CommunityCommentListProps) {
  const totalCount = useMemo(() => flattenCount(comments), [comments]);

  if (loading) {
    return (
      <div style={{ padding: "16px 0" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: "#f0e8d8",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  width: 110,
                  height: 13,
                  borderRadius: 4,
                  background: "#f0e8d8",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
            <div
              style={{
                width: "88%",
                height: 13,
                borderRadius: 4,
                background: "#f0e8d8",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: 4,
              }}
            />
            <div
              style={{
                width: "58%",
                height: 13,
                borderRadius: 4,
                background: "#f0e8d8",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p
        style={{
          fontSize: 13,
          color: "#7f8796",
          padding: "22px 0 8px",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  return (
    <div data-count={totalCount}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
          currentUsername={currentUsername}
          isAuthenticated={isAuthenticated}
          actionLoadingId={actionLoadingId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
          onRequireAuth={onRequireAuth}
          replyingToId={replyingToId}
          replySubmitting={replySubmitting}
          replyError={replyError}
          onCancelReply={onCancelReply}
          onSubmitReply={onSubmitReply}
        />
      ))}
    </div>
  );
}

const commentMenuItemStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "none",
  textAlign: "left",
  padding: "12px 16px",
  fontSize: 14,
  color: "#2d1a0e",
  cursor: "pointer",
};

const commentTextButtonStyle: React.CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  fontSize: 13,
  color: "#737373",
  cursor: "pointer",
};
