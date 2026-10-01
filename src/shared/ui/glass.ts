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

export const GlassView =
  glass && glass.isLiquidGlassAvailable() ? glass.GlassView : null;
