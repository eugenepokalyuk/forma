import type { LocalLog } from '../store';

// Номер следующего подхода — первый свободный, а не «сделано + 1»: после
// отмены подхода из середины (сделаны 1, 2, 3 → отменили 2) следующим
// записывается 2-й, а не повторно 3-й.
export function nextSetNumber(exerciseId: string, logs: LocalLog[]): number {
  const done = new Set(
    logs
      .filter((l) => l.exerciseId === exerciseId && !l.skipped)
      .map((l) => l.setNumber),
  );
  let n = 1;
  while (done.has(n)) n += 1;
  return n;
}
