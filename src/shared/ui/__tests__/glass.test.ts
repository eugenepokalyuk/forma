// Liquid Glass не должен ронять приложение в сборке без нативного модуля
// (до пересборки): там expo-glass-effect бросает уже при загрузке.

const load = (nativeModule: object | null, liquidGlass = true) => {
  const glassFactory = jest.fn(() => ({
    GlassView: 'GlassView',
    isLiquidGlassAvailable: () => liquidGlass,
  }));
  let GlassView: unknown;
  jest.isolateModules(() => {
    jest.doMock('expo', () => ({
      requireOptionalNativeModule: () => nativeModule,
    }));
    jest.doMock('expo-glass-effect', glassFactory);
    GlassView = require('../glass').GlassView;
  });
  return { GlassView, glassFactory };
};

describe('GlassView', () => {
  it('без нативного модуля — обычный вид, expo-glass-effect не загружается', () => {
    const { GlassView, glassFactory } = load(null);
    expect(GlassView).toBeNull();
    expect(glassFactory).not.toHaveBeenCalled();
  });

  it('модуль есть, но iOS ниже 26 — обычный вид', () => {
    expect(load({}, false).GlassView).toBeNull();
  });

  it('iOS 26+ — нативное стекло', () => {
    expect(load({}, true).GlassView).toBe('GlassView');
  });
});
