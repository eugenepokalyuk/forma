// Компоненты модуля — отдельный вход, чтобы импорт логики из index.ts
// не тянул за собой UI (moti, reanimated и т.п.) — например, в тестах.
export * from './components/ProgramCard';
export * from './components/ProgramPreviewCard';
export * from './components/ProgramReactions';
