export interface ProgramAttribution {
  campaign_code: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  referrer: string;
  landed_at: string;
}

export function captureProgramAttribution(campaignCode: string): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const attribution: ProgramAttribution = {
      campaign_code: campaignCode,
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || campaignCode,
      utm_content: params.get('utm_content') || '',
      referrer: document.referrer,
      landed_at: new Date().toISOString(),
    };
    localStorage.setItem('program_attribution', JSON.stringify(attribution));
    localStorage.setItem('pending_program_code', campaignCode);
    localStorage.setItem('pending_program_source', params.get('utm_medium') || 'direct');
  } catch {
    // localStorage unavailable (private browsing iOS) — fail silently
  }
}

export function getPendingProgramCode(): string | null {
  try {
    return localStorage.getItem('pending_program_code');
  } catch {
    return null;
  }
}

export function clearProgramAttribution(): void {
  try {
    localStorage.removeItem('program_attribution');
    localStorage.removeItem('pending_program_code');
    localStorage.removeItem('pending_program_source');
  } catch {
    // ignore
  }
}

export function captureSessionAttribution(
  sessionCode: string,
  utmParams: Record<string, string>,
): void {
  try {
    localStorage.setItem('pending_session_code', sessionCode);
    localStorage.setItem(
      'session_attribution',
      JSON.stringify({
        sessionCode,
        ...utmParams,
        captured_at: new Date().toISOString(),
      }),
    );
  } catch {
    // localStorage unavailable (private browsing iOS) — fail silently
  }
}
