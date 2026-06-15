import React, { useEffect, useRef, useState } from 'react';
import { PHONE_AUTH_COUNTRIES } from '@kalpx/types';

interface Props {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function CountryDialSelector({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = PHONE_AUTH_COUNTRIES.find((c) => c.code === value) ?? PHONE_AUTH_COUNTRIES[0];

  const openDropdown = () => {
    if (disabled) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={openDropdown}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          height: '46px',
          padding: '0 10px',
          border: '1px solid var(--kalpx-border-gold, #e0d5c0)',
          borderRight: 'none',
          borderRadius: '8px 0 0 8px',
          background: 'var(--kalpx-card-bg, #fffdf7)',
          color: 'var(--kalpx-text, #1a1a1a)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          minWidth: '110px',
          boxSizing: 'border-box',
        }}
      >
        <span>{selected.dialCode}</span>
        <span style={{ color: 'var(--kalpx-text-soft, #666)', fontWeight: 400, fontSize: '0.8rem' }}>
          {selected.label}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{
            marginLeft: 'auto',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--kalpx-gold, #c9a84c)',
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 9999,
            listStyle: 'none',
            margin: 0,
            padding: '4px',
            background: 'var(--kalpx-card-bg, #fffdf7)',
            border: '1px solid var(--kalpx-border-gold, #e0d5c0)',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            minWidth: '170px',
          }}
        >
          {PHONE_AUTH_COUNTRIES.map((c) => (
            <li
              key={c.code}
              role="option"
              aria-selected={c.code === value}
              onClick={() => { onChange(c.code); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '7px',
                cursor: 'pointer',
                background: c.code === value ? 'var(--kalpx-chip-bg, #fdf3dc)' : 'transparent',
                color: c.code === value ? 'var(--kalpx-gold, #c9a84c)' : 'var(--kalpx-text, #1a1a1a)',
                fontWeight: c.code === value ? 600 : 400,
                fontSize: '0.9rem',
              }}
              onMouseEnter={(e) => {
                if (c.code !== value) (e.currentTarget as HTMLElement).style.background = 'var(--kalpx-bg, #fff9f0)';
              }}
              onMouseLeave={(e) => {
                if (c.code !== value) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--kalpx-gold, #c9a84c)', minWidth: '36px' }}>
                {c.dialCode}
              </span>
              <span>{c.label}</span>
              {c.code === value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 'auto' }}>
                  <path d="M2 7l3.5 3.5L12 4" stroke="var(--kalpx-gold, #c9a84c)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
