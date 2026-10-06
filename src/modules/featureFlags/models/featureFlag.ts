// Ключи флагов — те же, что в админке → «Фича флаги» (FeatureFlag.key).
export type FeatureFlagKey = 'catalog_gender';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
}
