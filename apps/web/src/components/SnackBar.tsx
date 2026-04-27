import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hideSnackBar } from '../store/snackBarSlice';

export function SnackBar() {
  const dispatch = useAppDispatch();
  const { visible, message } = useAppSelector((s) => s.snackBar);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => dispatch(hideSnackBar()), 3000);
    return () => clearTimeout(t);
  }, [visible, dispatch]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#2a2a2a',
        color: '#f0ede8',
        padding: '12px 24px',
        borderRadius: 8,
        fontSize: 14,
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {message}
    </div>
  );
}
