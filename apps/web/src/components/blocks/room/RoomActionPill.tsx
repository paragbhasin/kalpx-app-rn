/**
 * RoomActionPill — renders a single room action from the RoomRenderV1 envelope.
 * Handles: runner_mantra, runner_sankalp, runner_practice, teaching, inquiry,
 *          in_room_step, in_room_carry, exit.
 */
import React, { useState } from 'react';

interface RoomAction {
  action_id: string;
  label: string;
  action_type: string;
  action_family?: string;
  runner_payload?: any;
  teaching_payload?: any;
  inquiry_payload?: any;
  step_payload?: any;
  carry_payload?: any;
  exit_payload?: any;
  primary_recommendation?: boolean;
  [key: string]: any;
}

interface Props {
  action: RoomAction;
  roomId: string;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RoomActionPill({ action, roomId, screenData = {}, onAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);

  const isExit = action.action_type === 'exit';
  const isRunner = action.action_type.startsWith('runner_');
  const isTeaching = action.action_type === 'teaching';
  const isInquiry = action.action_type === 'inquiry';
  const isStep = action.action_type === 'in_room_step';
  const isCarry = action.action_type === 'in_room_carry';

  const handleTap = () => {
    if (isExit) {
      onAction?.({ type: 'room_exit', payload: { room_id: roomId } });
      return;
    }

    if (isRunner) {
      const rp = action.runner_payload || {};
      const variant = action.action_type === 'runner_mantra' ? 'mantra'
        : action.action_type === 'runner_sankalp' ? 'sankalp'
        : 'practice';
      const item = rp.item || rp.offering || {};
      onAction?.({
        type: 'start_runner',
        payload: { source: `room_${roomId}`, variant, item },
      });
      return;
    }

    if (isTeaching || isInquiry) {
      setExpanded(!expanded);
      if (!expanded) {
        onAction?.({
          type: isTeaching ? 'room_step_completed' : 'room_inquiry_opened',
          payload: { room_id: roomId, action_id: action.action_id, analytics_key: action.analytics_key },
        });
      }
      return;
    }

    if (isStep) {
      if (!done) {
        setDone(true);
        onAction?.({
          type: 'room_step_completed',
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            template_id: action.step_payload?.template_id,
            writes_event: action.step_payload?.persistence?.writes_event,
          },
        });
      }
      return;
    }

    if (isCarry) {
      if (!done) {
        setDone(true);
        onAction?.({
          type: 'room_carry_captured',
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            label: action.label,
            writes_event: action.carry_payload?.persistence?.writes_event,
          },
        });
      }
      return;
    }

    // Unknown action type — warn
    console.warn('[RoomActionPill] unknown action_type:', action.action_type);
  };

  const pillStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    borderRadius: 12,
    border: isExit ? '1px solid #E8DCC8' : '1px solid #E8DCC8',
    background: isExit ? 'transparent' : done ? 'rgba(201,168,76,0.06)' : '#fff',
    color: isExit ? '#9A8C78' : done ? '#9A8C78' : '#2C2A26',
    fontSize: 15,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  const expandableContent =
    isTeaching ? action.teaching_payload?.body || action.teaching_payload?.text || ''
    : isInquiry ? action.inquiry_payload?.prompt || action.inquiry_payload?.description || ''
    : '';

  return (
    <div data-testid={`room-action-${action.action_id}`}>
      <button style={pillStyle} onClick={handleTap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{action.label}{done ? ' ✓' : ''}</span>
          {action.primary_recommendation && !done && (
            <span style={{ fontSize: 10, color: '#C9A84C', letterSpacing: 1, textTransform: 'uppercase' }}>
              Start here
            </span>
          )}
        </div>
        {action.action_family && (
          <span style={{ fontSize: 11, color: '#9A8C78', letterSpacing: 1, textTransform: 'uppercase' }}>
            {action.action_family}
          </span>
        )}
      </button>

      {expanded && expandableContent && (
        <div
          style={{
            margin: '4px 0 0',
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(201,168,76,0.04)',
            border: '1px solid rgba(201,168,76,0.15)',
          }}
          data-testid={`room-action-expanded-${action.action_id}`}
        >
          <p style={{ fontSize: 15, color: '#3D3930', lineHeight: 1.7 }}>{expandableContent}</p>
        </div>
      )}
    </div>
  );
}
