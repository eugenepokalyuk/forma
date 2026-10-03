// Акцентные градиенты — системная пара жёлтый→оранжевый (как в iOS
// Dark Mode), плюс зелёный для «успеха/завершено».
export const gradients = {
  accent: ['#FFD60A', '#FF9F0A'] as const,
  accentPressed: ['#FFC700', '#E68E00'] as const,
  positive: ['#30D158', '#26A63F'] as const,
  scrim: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Континуальные, «сквозные» радиусы — ближе к тому, как iOS скругляет
// виджеты и карточки (крупнее, чем классический Material).
export const radius = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 34,
  pill: 999,
} as const;

// Тональная система элевации вместо тяжёлых теней: карточки почти без
// тени (их «поднимает» разница фона), тень остаётся только у по-настоящему
// плавающих элементов (таб-бар, модалки, акцентная кнопка).
export const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 10,
  },
  glow: {
    shadowColor: '#FF9F0A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 7,
  },
} as const;

export const motion = {
  fast: 160,
  base: 280,
  slow: 440,
  // Более «резиновый», пружинный отклик — как в системных анимациях iOS.
  springy: { type: 'spring' as const, damping: 20, stiffness: 260, mass: 0.9 },
  springSoft: { type: 'spring' as const, damping: 22, stiffness: 180, mass: 1 },
};

// Кнопки не меньше 48pt — ими пользуются потными руками в зале.
export const hitTarget = 48;

// Отступ от края экрана — отдельная величина от spacing.md: тот используется
// повсюду для внутренних гэпов/паддингов карточек, и раздувать его нельзя,
// а вот сам «рамочный» отступ экрана должен быть уже, чтобы контент шёл
// почти во всю ширину, а не тонул в полях.
export const screenPadding = 8;
