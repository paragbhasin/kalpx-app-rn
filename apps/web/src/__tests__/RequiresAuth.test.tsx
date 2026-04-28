/**
 * Phase 11 — RequiresAuth guard unit tests.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@kalpx/auth', () => ({
  isAuthenticated: vi.fn(),
}));

vi.mock('../lib/webStorage', () => ({
  webStorage: {},
}));

import { RequiresAuth } from '../components/RequiresAuth';
import { isAuthenticated } from '@kalpx/auth';

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderGuard(isAuthed: boolean) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">login</div>} />
        <Route
          path="/protected"
          element={
            <RequiresAuth>
              <div data-testid="protected">protected</div>
            </RequiresAuth>
          }
        />
      </Routes>
    </MemoryRouter>
  );
  void isAuthed; // param unused — caller sets isAuthenticated mock
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RequiresAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing while auth check is pending', () => {
    (isAuthenticated as any).mockReturnValue(new Promise(() => {})); // never resolves
    renderGuard(false);
    expect(screen.queryByTestId('protected')).toBeNull();
    expect(screen.queryByTestId('login-page')).toBeNull();
  });

  it('renders children when authenticated', async () => {
    (isAuthenticated as any).mockResolvedValue(true);
    renderGuard(true);
    await waitFor(() => {
      expect(screen.getByTestId('protected')).toBeTruthy();
    });
  });

  it('redirects to /login when not authenticated', async () => {
    (isAuthenticated as any).mockResolvedValue(false);
    renderGuard(false);
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeTruthy();
      expect(screen.queryByTestId('protected')).toBeNull();
    });
  });
});
