import { apiClient } from '@/api/client';
import type { BroPhrase } from '@/api/types';

// Фразы Фитнес Бро из админки (forma-python/bro). Условные (morning,
// water_low, streak и т.п.) здесь не разбираем — берём только общий пул
// советов с condition === 'always', см. forma-next buildBroMessages().
export function getBroPhrases() {
  return apiClient.get<BroPhrase[]>('/bro/phrases').then((res) => res.data);
}
