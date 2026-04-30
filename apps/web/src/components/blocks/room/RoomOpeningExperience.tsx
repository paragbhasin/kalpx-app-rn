interface RoomContext {
  room_purpose_line?: string | null;
  sanatan_insight_line?: string | null;
  why_this_room_line?: string | null;
  bridge_line?: string | null;
}

interface Props {
  envelope: {
    opening_line?: string;
    second_beat_line?: string | null;
    ready_hint?: string;
    section_prompt?: string;
    memory_echo_line?: string | null;
    room_id?: string;
    room_context?: RoomContext | null;
  };
  roomName?: string;
  lifeContextLabel?: string | null;
}

export function RoomOpeningExperience({
  envelope,
  roomName,
  lifeContextLabel,
}: Props) {
  const ctx = envelope.room_context;
  const hasHeader = !!(
    roomName ||
    ctx?.room_purpose_line ||
    lifeContextLabel ||
    ctx?.sanatan_insight_line
  );

  return (
    <div style={{ paddingTop: 10, padding: 10, textAlign: "center" }}>
      {roomName && (
        <p
          data-testid="room-display-name"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#432104",
            margin: "10px 0 6px",
            lineHeight: 1.25,
          }}
        >
          {roomName}
        </p>
      )}

      {ctx?.room_purpose_line && (
        <p
          data-testid="room-purpose-line"
          style={{
            fontSize: 15,
            color: "#8A7968",
            lineHeight: 1.45,
            fontWeight: 300,
          }}
        >
          {ctx.room_purpose_line}
        </p>
      )}

      {lifeContextLabel && (
        <p
          data-testid="room-life-context"
          style={{
            fontSize: 14,
            color: "#9f9f9f",
            lineHeight: 1.35,
            marginTop: 10,
          }}
        >
          {`You chose: ${lifeContextLabel}`}
        </p>
      )}

      {ctx?.sanatan_insight_line && (
        <div
          data-testid="room-sanatan-insight"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            textAlign: "left",
            margin: "8px 0 2px",
            padding: "4px 0",
          }}
        >
          <div
            style={{
              width: 3,
              minHeight: 36,
              borderRadius: 2,
              background: "#c8b49a",

              marginTop: 2,
            }}
          />
          <p
            style={{
              flex: 1,
              fontSize: 12,
              color: "#8A7968",
              lineHeight: 1.45,
              margin: 0,
              textAlign: "center",
            }}
          >
            {ctx.sanatan_insight_line}
          </p>
        </div>
      )}

      {hasHeader && (envelope.opening_line || ctx?.why_this_room_line) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            margin: "10px 0 12px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(201, 168, 76, 0.35)",
            }}
          />
          <img
            src="/lotus_icon.png"
            width={20}
            height={16}
            alt=""
            aria-hidden="true"
            style={{ opacity: 0.6, objectFit: "contain", display: "block" }}
          />
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(201, 168, 76, 0.35)",
            }}
          />
        </div>
      )}

      {ctx?.why_this_room_line && (
        <p
          data-testid="room-why-this-room-line"
          style={{
            fontSize: 13,
            color: "#9f9f9f",
            lineHeight: 1.45,
            marginBottom: 10,
          }}
        >
          {ctx.why_this_room_line}
        </p>
      )}

      {envelope.opening_line && (
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#432104",
            lineHeight: 1.4,
            margin: "0 auto 8px",
            maxWidth: 560,
            padding: "0 24px",
          }}
          data-testid="room-opening-line"
        >
          {envelope.opening_line}
        </p>
      )}

      {envelope.memory_echo_line && (
        <p
          style={{
            fontSize: 13,
            color: "#8B6914",
            fontStyle: "italic",
            lineHeight: 1.45,
            marginBottom: 10,
            padding: "0 28px",
          }}
          data-testid="room-memory-echo-line"
        >
          {envelope.memory_echo_line}
        </p>
      )}
      {envelope.second_beat_line && (
        <p
          style={{
            fontSize: 16,
            color: "#432104",
            lineHeight: 1.45,
            maxWidth: 560,
            padding: "0 24px",
          }}
        >
          {envelope.second_beat_line}
        </p>
      )}
    </div>
  );
}
