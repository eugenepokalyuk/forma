import { requireOptionalNativeModule } from 'expo';
import type * as ExpoAudio from 'expo-audio';

// Сигнал конца отдыха. Смешивается с музыкой пользователя (interruptionMode
// по умолчанию — mixWithOthers), не ставя её на паузу.
const REST_END_SOUND = require('@/assets/sounds/beep.wav');

// expo-audio — нативный модуль. В сборке без него (dev-клиент, собранный до
// его добавления) обычный импорт бросает исключение ещё при загрузке
// маршрутов и роняет всё приложение. Подключаем только если модуль есть,
// иначе тренировка просто идёт без звука.
const audio: typeof ExpoAudio | null = requireOptionalNativeModule('ExpoAudio')
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- импорт только при наличии нативного модуля
    require('expo-audio')
  : null;

const noop = () => {};

// Возвращает функцию, проигрывающую сигнал с начала.
export const useRestEndSound: () => () => void = audio
  ? () => {
      const player = audio.useAudioPlayer(REST_END_SOUND);
      return () => {
        void player.seekTo(0).then(() => player.play());
      };
    }
  : () => noop;
