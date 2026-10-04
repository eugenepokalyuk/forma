import { isAxiosError } from 'axios';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sendOtpApi } from '@/modules/auth';
import {
  Button,
  Divider,
  FadeInCover,
  GlassCard,
  Icon,
  Input,
  Logo,
  Typography,
  type IconName,
} from '@/shared/ui';
import { COLORS, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';
import { GuestSheet } from '@/pages/Auth/components/GuestSheet';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HERO = require('@/assets/images/auth-hero.webp');
const HERO_ASPECT = 1024 / 700;
// Насколько контейнер с формой наезжает на картинку.
const HERO_OVERLAP = 30;

const FEATURE_DESCRIPTION = 'rgba(255, 255, 255, 0.2)';

const FEATURES: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'human-male-female',
    title: 'Программы для мужчин и женщин',
    description: 'Для разных целей и уровня подготовки',
  },
  {
    icon: 'playlist-plus',
    title: 'Не нашли подходящую программу? Создайте свою',
    description: 'Выбирайте из более чем 1000\u00A0упражнений',
  },
  {
    icon: 'account-multiple-outline',
    title: 'Тренируйтесь с тренером или бадди',
    description: 'Делитесь тренировками и\u00A0результатами',
  },
  {
    icon: 'chart-line',
    title: 'Отслеживайте прогресс в динамике',
    description: 'Вес, подходы и повторения',
  },
  {
    icon: 'forum-outline',
    title: 'Получайте поддержку от сообщества',
    description:
      'Делитесь своими результатами и\u00A0смотрите, как тренируются другие',
  },
  {
    icon: 'swap-horizontal',
    title: 'Заменяйте упражнение',
    description: 'Когда нужный тренажёр занят',
  },
  {
    icon: 'wifi-off',
    title: 'Занимайтесь даже без интернета',
    description: 'Все данные сохраняются офлайн',
  },
];

export default function EmailScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [guestOpen, setGuestOpen] = React.useState(false);

  const valid = EMAIL_RE.test(email.trim());

  // Параллакс картинки, как у обложки программы: при оттягивании вниз рамка
  // растёт вверх и картинка растягивается, при прокрутке — едет вдвое
  // медленнее контента.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });
  const heroFrameStyle = useAnimatedStyle(() => ({
    top: Math.min(scrollY.get(), 0),
  }));
  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(scrollY.get(), 0) * 0.5 }],
  }));

  const onSubmit = async () => {
    if (!valid || loading) return;

    setLoading(true);
    setError(null);

    try {
      await sendOtpApi(email.trim());
      router.push(ROUTES.authCode(email.trim()));
    } catch (e) {
      setError(
        isAxiosError(e)
          ? 'Не получилось отправить код. Проверьте связь.'
          : 'Что-то пошло не так.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        <View style={{ height: width * HERO_ASPECT }}>
          <Animated.View style={[styles.heroFrame, heroFrameStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, heroImageStyle]}>
              <Image
                source={HERO}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />

              <LinearGradient
                colors={['rgba(0,0,0,0)', COLORS.Background.primary]}
                style={styles.heroFade}
              />
            </Animated.View>
          </Animated.View>

          <View style={[styles.brand, { paddingTop: insets.top + spacing.xl }]}>
            <Logo size={32} />

            <Typography variant="display" align="center">
              {'Место вашего\nпрогресса'}
            </Typography>
          </View>
        </View>

        <GlassCard style={styles.form}>
          <Input
            placeholder="Эл. почта"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            returnKeyType="send"
            onSubmitEditing={onSubmit}
            textAlign="center"
          />

          {error ? (
            <Typography variant="label" color={COLORS.Text.negative}>
              {error}
            </Typography>
          ) : null}

          <Button
            title="Войти"
            onPress={onSubmit}
            disabled={!valid}
            loading={loading}
          />

          <Pressable
            onPress={() => setGuestOpen(true)}
            accessibilityRole="button"
            hitSlop={spacing.sm}
            style={styles.guest}
          >
            <Typography
              variant="body"
              color={COLORS.Text.secondary}
              align="center"
            >
              {'Войти без сохранения прогресса'}
            </Typography>
          </Pressable>
        </GlassCard>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <React.Fragment key={f.title}>
              {i > 0 ? <Divider /> : null}

              <View style={styles.feature}>
                <Icon name={f.icon} size={24} color={COLORS.Icon.accent} />

                <View style={styles.featureText}>
                  <Typography variant="body" color={COLORS.White}>
                    {f.title}
                  </Typography>

                  <Typography variant="body" color={FEATURE_DESCRIPTION}>
                    {f.description}
                  </Typography>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      </Animated.ScrollView>

      <GuestSheet visible={guestOpen} onClose={() => setGuestOpen(false)} />

      <FadeInCover />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Background.primary,
  },
  heroFrame: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  form: {
    marginTop: -HERO_OVERLAP,
    marginHorizontal: spacing.md,
  },
  guest: {
    paddingVertical: spacing.sm,
  },
  features: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
  },
});
