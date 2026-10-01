export type TypographyVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'caption';

interface VariantStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing: number;
  fontFamily?: string;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
}

// Заголовочные варианты — Sofia Sans Extra Condensed (грузится в _layout.tsx
// через useFonts); текстовые (subtitle и ниже) — оставляем системный шрифт,
// то есть SF Pro на iOS, без explicit fontFamily.
const HEADING_FONT = {
  bold: 'SofiaSansExtraCondensed_700Bold',
  extraBold: 'SofiaSansExtraCondensed_800ExtraBold',
} as const;

// Курсивные начертания заголовочного шрифта — отдельные файлы. iOS не
// наклоняет кастомный шрифт сам по fontStyle: 'italic', поэтому курсив —
// только через эти fontFamily (загружаются в app/_layout).
export const HEADING_ITALIC = {
  bold: 'SofiaSansExtraCondensed_700Bold_Italic',
  extraBold: 'SofiaSansExtraCondensed_800ExtraBold_Italic',
} as const;

// ВАЖНО: для вариантов с кастомным fontFamily fontWeight держим на '400'.
// Каждый вес шрифта из @expo-google-fonts — отдельный статический файл
// (ExtraBold ≠ вариант той же семьи, а собственная «семья» сама по себе);
// если рядом с fontFamily указать fontWeight: '700'/'800', iOS пытается
// подобрать НАЧЕРТАНИЕ этого веса внутри семьи с таким именем, не находит
// и молча подставляет системный шрифт — снаружи выглядит так, будто
// кастomный шрифт не применился вовсе.
export const TYPOGRAPHY: Record<TypographyVariant, VariantStyle> = {
  hero: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '400',
    letterSpacing: -1.2,
    fontFamily: HEADING_FONT.extraBold,
    textTransform: 'uppercase',
  },
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400',
    letterSpacing: -0.6,
    fontFamily: HEADING_FONT.extraBold,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: -0.3,
    fontFamily: HEADING_FONT.bold,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: -0.2,
    fontFamily: HEADING_FONT.bold,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '500', letterSpacing: 0 },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
};
