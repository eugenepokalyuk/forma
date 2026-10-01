export type BroCondition =
  | 'always'
  | 'morning'
  | 'water_low'
  | 'workout_today'
  | 'rest_day'
  | 'onboarding'
  | 'return_after_pause'
  | 'pro_promo';

export type BroAction =
  | 'none'
  | 'water'
  | 'onboarding'
  | 'workout'
  | 'subscription'
  | 'achievements'
  | 'programs';

export interface BroPhrase {
  id: number;
  category: string;
  categoryLabel: string;
  text: string;
  title: string;
  condition: BroCondition;
  action: BroAction;
  actionLabel: string;
  priority: number;
}
