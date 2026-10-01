// См. forma-python/programs (ReactionTypeListView) — те же 4 реакции на
// программу/сессию, что и на сайте (см. ProgramCard).
export type ReactionValue = 'fire' | 'liked' | 'meh' | 'hard';

export interface ReactionType {
  value: ReactionValue;
  label: string;
  emoji: string;
  order: number;
}
