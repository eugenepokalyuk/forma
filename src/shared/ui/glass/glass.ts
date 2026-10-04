import { requireOptionalNativeModule } from 'expo';
import type * as ExpoGlassEffect from 'expo-glass-effect';
import { Platform } from 'react-native';

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
// яркости. Лёгкий светлый — иначе на другом стекле (GlassCard, шторка)
// элемент сливается с подложкой: стекло не преломляет стекло.
export const GLASS_NEUTRAL_TINT = 'rgba(255, 255, 255, 0.08)';

export const GlassView =
  glass && glass.isLiquidGlassAvailable() ? glass.GlassView : null;
