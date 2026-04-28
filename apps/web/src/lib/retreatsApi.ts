import { api } from './api';
import type { RetreatsInterestPayload } from '@kalpx/types';

export async function submitRetreatsInterest(
  userId: number,
  data: RetreatsInterestPayload['data'],
): Promise<void> {
  const payload: RetreatsInterestPayload = { user: userId, type: 'retreats', data };
  await api.post('/interests/', payload);
}
