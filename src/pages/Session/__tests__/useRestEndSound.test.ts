// Звук конца отдыха не должен ронять приложение в сборке без нативного
// модуля ExpoAudio (старый dev-клиент): там импорт expo-audio бросает.

const load = (nativeModule: object | null, audio: () => object) => {
  let hook!: typeof import('../hooks/useRestEndSound').useRestEndSound;
  jest.isolateModules(() => {
    jest.doMock('expo', () => ({
      requireOptionalNativeModule: () => nativeModule,
    }));
    jest.doMock('expo-audio', audio);
    hook = require('../hooks/useRestEndSound').useRestEndSound;
  });
  return hook;
};

describe('useRestEndSound', () => {
  it('без нативного модуля — не трогает expo-audio и молчит', () => {
    const audioFactory = jest.fn(() => {
      throw new Error("Cannot find native module 'ExpoAudio'");
    });
    const useRestEndSound = load(null, audioFactory);

    expect(() => useRestEndSound()()).not.toThrow();
    expect(audioFactory).not.toHaveBeenCalled();
  });

  it('с нативным модулем — проигрывает сигнал с начала', async () => {
    const player = {
      seekTo: jest.fn(() => Promise.resolve()),
      play: jest.fn(),
    };
    const useRestEndSound = load({}, () => ({
      useAudioPlayer: () => player,
    }));

    useRestEndSound()();
    await Promise.resolve();

    expect(player.seekTo).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalled();
  });
});
