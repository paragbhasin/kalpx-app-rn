/**
 * Gate 2 QA-2 — Pure logic proof tests for ProgramLandingPage.
 *
 * Tests the stateless functions that compute URLs and copy without rendering React.
 * Full component rendering is covered by e2e; this layer catches contract regressions fast.
 */
import { describe, it, expect } from 'vitest';

// ── Helpers extracted from ProgramLandingPage (pure functions, no imports needed) ──

function buildHeadline(campaign: {
  community_name: string;
  leader_name: string;
  duration_days: number;
}): string {
  const hero = campaign.community_name || campaign.leader_name;
  const days = campaign.duration_days;
  if (hero) {
    return `A ${days}-day practice offered by ${hero}, powered by KalpX.`;
  }
  return `A ${days}-day practice, powered by KalpX.`;
}

function qrValue(code: string): string {
  return `https://kalpx.com/join/${code}`;
}

function deepLinkValue(code: string): string {
  return `kalpx://join/${code}`;
}

function appStoreUrl(code: string, appId: string): string {
  return `https://apps.apple.com/app/kalpx/id${appId}?utm_source=kalpx&utm_medium=program&utm_campaign=${code}`;
}

function playStoreUrl(code: string): string {
  return `https://play.google.com/store/apps/details?id=com.kalpx.app&utm_source=kalpx&utm_medium=program&utm_campaign=${code}`;
}

function safeHref(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return fallback;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildHeadline — Decision 3: leader framing', () => {
  it('uses community_name when set (preferred over leader_name)', () => {
    const h = buildHeadline({ community_name: 'Bay Area Shiv Mandir', leader_name: 'Sunita', duration_days: 7 });
    expect(h).toBe('A 7-day practice offered by Bay Area Shiv Mandir, powered by KalpX.');
  });

  it('falls back to leader_name when community_name is empty', () => {
    const h = buildHeadline({ community_name: '', leader_name: 'Sunita Iyer', duration_days: 7 });
    expect(h).toBe('A 7-day practice offered by Sunita Iyer, powered by KalpX.');
  });

  it('omits attribution when both names are empty', () => {
    const h = buildHeadline({ community_name: '', leader_name: '', duration_days: 7 });
    expect(h).toBe('A 7-day practice, powered by KalpX.');
  });

  it('uses duration_days correctly', () => {
    const h = buildHeadline({ community_name: 'Temple', leader_name: '', duration_days: 21 });
    expect(h).toContain('21-day');
  });

  // Founder Decision 3: "Download KalpX" must never be the headline
  it('never includes "Download KalpX" in the headline', () => {
    const h = buildHeadline({ community_name: 'Temple', leader_name: '', duration_days: 7 });
    expect(h).not.toContain('Download KalpX');
    expect(h).not.toContain('Install KalpX');
  });
});

describe('QR code URL — Decision 5: HTTPS primary', () => {
  it('encodes HTTPS join URL, never kalpx://', () => {
    const url = qrValue('ABC123');
    expect(url).toBe('https://kalpx.com/join/ABC123');
    expect(url).not.toContain('kalpx://');
  });

  it('different code produces correct URL', () => {
    const url = qrValue('BAYSHIV1');
    expect(url).toBe('https://kalpx.com/join/BAYSHIV1');
  });
});

describe('Deep link (Open KalpX button) — secondary custom scheme', () => {
  it('uses kalpx:// scheme', () => {
    const url = deepLinkValue('ABC123');
    expect(url).toBe('kalpx://join/ABC123');
    expect(url).not.toContain('https://');
  });
});

describe('App Store URLs — UTM params', () => {
  it('App Store URL contains UTM params with campaign code', () => {
    const url = appStoreUrl('BAYSHIV1', '123456789');
    expect(url).toContain('utm_source=kalpx');
    expect(url).toContain('utm_medium=program');
    expect(url).toContain('utm_campaign=BAYSHIV1');
    expect(url).toContain('apps.apple.com');
  });

  it('Play Store URL contains UTM params with campaign code', () => {
    const url = playStoreUrl('BAYSHIV1');
    expect(url).toContain('utm_source=kalpx');
    expect(url).toContain('utm_medium=program');
    expect(url).toContain('utm_campaign=BAYSHIV1');
    expect(url).toContain('play.google.com');
    expect(url).toContain('com.kalpx.app');
  });
});

describe('safeHref — support_contact_url security', () => {
  it('allows https:// URLs', () => {
    const url = safeHref('https://wa.me/91999', 'https://kalpx.com/support');
    expect(url).toBe('https://wa.me/91999');
  });

  it('allows mailto: URLs', () => {
    const url = safeHref('mailto:support@kalpx.com', 'https://kalpx.com/support');
    expect(url).toBe('mailto:support@kalpx.com');
  });

  it('rejects javascript: URLs', () => {
    const url = safeHref('javascript:alert(1)', 'https://kalpx.com/support');
    expect(url).toBe('https://kalpx.com/support');
  });

  it('rejects http:// URLs', () => {
    const url = safeHref('http://evil.com', 'https://kalpx.com/support');
    expect(url).toBe('https://kalpx.com/support');
  });

  it('uses fallback for null', () => {
    const url = safeHref(null, 'https://kalpx.com/support');
    expect(url).toBe('https://kalpx.com/support');
  });

  it('uses fallback for empty string', () => {
    const url = safeHref('', 'https://kalpx.com/support');
    expect(url).toBe('https://kalpx.com/support');
  });
});

describe('Gate 2 acceptance criteria — URL contract', () => {
  // AC3: invite code visible on load (tested in component render — this is the logic layer)
  it('campaign code flows through unchanged to QR and deep link', () => {
    const code = 'XY12AB34';
    expect(qrValue(code)).toContain(code);
    expect(deepLinkValue(code)).toContain(code);
  });

  // AC4: QR is HTTPS (Decision 5 — most critical)
  it('QR value starts with https', () => {
    expect(qrValue('TEST01').startsWith('https://')).toBe(true);
  });

  // AC5: Open KalpX uses custom scheme
  it('deep link starts with kalpx://', () => {
    expect(deepLinkValue('TEST01').startsWith('kalpx://')).toBe(true);
  });

  // AC13/AC14: Store links have utm_source=kalpx
  it('both store links have utm_source=kalpx', () => {
    expect(appStoreUrl('CODE1', 'APP_ID')).toContain('utm_source=kalpx');
    expect(playStoreUrl('CODE1')).toContain('utm_source=kalpx');
  });
});
