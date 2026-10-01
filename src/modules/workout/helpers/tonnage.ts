import type { LocalLog } from '../store';

export function tonnage(logs: LocalLog[]): number {
  return logs.reduce((sum, l) => sum + (l.weight ?? 0) * (l.repsDone ?? 0), 0);
}
