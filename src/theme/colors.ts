import { PALETTE } from './palette';

/**
 * Семантические токены поверх PALETTE — в компонентах используем только их,
 * чтобы следующая правка палитры свелась к правке одного файла (palette.ts).
 */
export const COLORS = {
  White: PALETTE.white,
  Black: PALETTE.black,
  Background: {
    primary: PALETTE.neutral00,
    elevated: PALETTE.neutral10,
  },
  Surface: {
    primary: PALETTE.neutral10,
    secondary: PALETTE.neutral20,
    tertiary: PALETTE.neutral25,
    accent: PALETTE.amber50,
    accentPressed: PALETTE.amber60,
    accentSubdued: 'rgba(255, 214, 10, 0.14)',
    positive: PALETTE.green50,
    positiveSubdued: 'rgba(48, 209, 88, 0.14)',
    negativeSubdued: 'rgba(255, 69, 58, 0.14)',
    tealSubdued: 'rgba(100, 210, 255, 0.14)',
  },
  Text: {
    primary: PALETTE.neutral95,
    secondary: PALETTE.neutral70,
    tertiary: PALETTE.neutral60,
    inverse: PALETTE.neutral00,
    accent: PALETTE.amber50,
    positive: PALETTE.green50,
    negative: PALETTE.red50,
    teal: PALETTE.teal50,
  },
  Icon: {
    primary: PALETTE.neutral95,
    secondary: PALETTE.neutral70,
    tertiary: PALETTE.neutral60,
    accent: PALETTE.amber50,
    inverse: PALETTE.neutral00,
    positive: PALETTE.green50,
    tabActive: PALETTE.amber50,
    tabInactive: PALETTE.neutral70,
  },
  Stroke: {
    hairline: 'rgba(255, 255, 255, 0.06)',
    primary: 'rgba(255, 255, 255, 0.09)',
    secondary: 'rgba(255, 255, 255, 0.16)',
    accent: PALETTE.amber50,
    positive: PALETTE.green50,
    negative: PALETTE.red50,
    // Рамка поля с неверным значением.
    error: 'rgba(255, 0, 0, 0.5)',
  },
  Overlay: {
    scrim: 'rgba(0, 0, 0, 0.92)',
    // Затемнение под шторками (BottomSheet).
    backdrop: 'rgba(0, 0, 0, 0.6)',
    tint: 'rgba(0, 0, 0, 0.36)',
    sheen: 'rgba(255, 255, 255, 0.05)',
  },
} as const;
