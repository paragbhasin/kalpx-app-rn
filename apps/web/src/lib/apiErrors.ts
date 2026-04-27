export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as any).response;
    return (
      response?.data?.detail ||
      response?.data?.message ||
      response?.data?.error ||
      _firstFieldError(response?.data) ||
      fallback
    );
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function _firstFieldError(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  for (const value of Object.values(data as Record<string, unknown>)) {
    if (Array.isArray(value) && value[0]) return String(value[0]);
    if (typeof value === 'string') return value;
  }
  return '';
}
