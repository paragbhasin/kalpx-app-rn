import { Mic, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

const EXPANDED_HEIGHT_THRESHOLD = 42;

interface VoiceTextInputProps {
  placeholder?: string;
  initialValue?: string;
  onSend: (text: string, type: "text" | "voice") => void;
  onTextChange?: (text: string) => void;
  voiceAvailable?: boolean;
  disabled?: boolean;
}

export function VoiceTextInput({
  placeholder = "How can I help you?",
  initialValue = "",
  onSend,
  onTextChange,
  voiceAvailable = true,
  disabled = false,
}: VoiceTextInputProps) {
  const [text, setText] = useState(initialValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = "0px";
    const nextHeight = input.scrollHeight;
    input.style.height = `${nextHeight}px`;
    setIsExpanded(text.includes("\n") || nextHeight > EXPANDED_HEIGHT_THRESHOLD);
  }, [text]);

  useEffect(() => {
    onTextChange?.(text);
  }, [onTextChange, text]);

  function handleSend() {
    const next = text.trim();
    if (!next || disabled) return;
    onSend(next, "text");
    setText("");
    setIsExpanded(false);
  }

  function handleVoiceClick() {
    if (disabled) return;
    onSend("", "voice");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          width: "100%",
        }}
      >
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            position: "relative",
            minHeight: 56,
            padding: voiceAvailable ? "14px 52px 14px 18px" : "14px 18px",
            borderRadius: isExpanded ? 24 : 999,
            border: "1px solid rgba(222, 206, 176, 0.95)",
            background: "rgba(255, 252, 246, 0.98)",
            boxShadow: "0 10px 24px rgba(217, 191, 143, 0.18)",
            textAlign: "left",
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? "default" : "text",
          }}
        >
          <textarea
            ref={inputRef}
            value={text}
            disabled={disabled}
            rows={1}
            placeholder={placeholder}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              minHeight: 24,
              maxHeight: 120,
              padding: 0,
              margin: 0,
              border: "none",
              outline: "none",
              resize: "none",
              overflowY: isExpanded ? "auto" : "hidden",
              background: "transparent",
              color: "var(--kalpx-text)",
              fontSize: 16,
              lineHeight: 1.5,
              fontFamily: "var(--kalpx-font-sans)",
            }}
          />

          {voiceAvailable && (
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={disabled}
              aria-label="Use voice input"
              style={{
                position: "absolute",
                right: 12,
                bottom: 10,
                width: 32,
                height: 32,
                borderRadius: 16,
                border: "1px solid rgba(201, 168, 76, 0.18)",
                background: "rgba(200, 154, 71, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#b9892f",
                cursor: disabled ? "default" : "pointer",
              }}
            >
              <Mic size={18} strokeWidth={1.9} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Send reflection"
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            border: "1px solid rgba(222, 206, 176, 0.95)",
            background: "rgba(255, 252, 246, 0.98)",
            boxShadow: "0 10px 24px rgba(217, 191, 143, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b4d28",
            opacity: disabled || !text.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          <SendHorizontal size={22} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
