import { requireOptionalNativeModule } from 'expo';
import type * as ExpoGlassEffect from 'expo-glass-effect';
import { Platform } from 'react-native';

import { COLORS } from '@/theme';

// Liquid Glass (iOS 26+). Модуль подключаем, только если он есть в сборке:
// expo-glass-effect обращается к нативной части уже при загрузке, и в сборке
// без него (до пересборки) это роняло бы приложение. На Android, старых iOS
// и без модуля GlassView = null — компоненты рисуют свой обычный вид.
const glass: typeof ExpoGlassEffect | null =
  Platform.OS === 'ios' && requireOptionalNativeModule('ExpoGlassEffect')
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- импорт только при наличии нативного модуля
      require('expo-glass-effect')
    : null;

// Нейтральный оттенок стекла — у полей ввода и у кнопок без цвета
// (второстепенная, неактивная): один на всех, чтобы они не отличались по
// яркости. Затемнённый — иначе на другом стекле (GlassCard, шторка) элемент
// сливается с подложкой: стекло не преломляет стекло.
export const GLASS_NEUTRAL_TINT = 'rgba(0, 0, 0, 0.24)';

// Рамка поля на стекле вне фокуса: у стеклянной кнопки своей рамки нет,
// только блик стекла по краю — у поля так же. Ширину рамки поле оставляет
// (высота не прыгает), а цвет — фокусный с нулевой альфой, чтобы переход в
// жёлтую рамку не проходил через тёмный.
export const GLASS_IDLE_BORDER = `${COLORS.Stroke.accent}00`;

export const GlassView =
  glass && glass.isLiquidGlassAvailable() ? glass.GlassView : null;
