import { apiRequest } from '@/shared/api/apiRequest';
import type { BroPhrase } from '../models/bro';

// Фразы Фитнес Бро из админки (forma-python/bro). Условные (morning,
// water_low, streak и т.п.) здесь не разбираем — берём только общий пул
// советов с condition === 'always', см. forma-next buildBroMessages().
export function getBroPhrasesApi() {
  return apiRequest<BroPhrase[]>({
    method: 'get',
    url: '/bro/phrases',
  });
}
