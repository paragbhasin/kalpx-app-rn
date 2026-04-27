export class KalpxError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'KalpxError';
  }
}

export const ERROR_CODES = {
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  JOURNEY_NOT_FOUND: 'JOURNEY_NOT_FOUND',
  CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
  INVALID_ACTION: 'INVALID_ACTION',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
