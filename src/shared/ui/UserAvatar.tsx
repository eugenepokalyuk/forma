import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Typography } from './Typography';
import { COLORS, gradients } from '@/theme';

interface UserAvatarProps {
  url: string | null;
  name: string;
  size?: number;
  /** ПРО — золотое кольцо + корона сверху. Единственное место в приложении,
   * где статус ПРО виден прямо на аватарке (не только в профиле списком). */
  pro?: boolean;
}

export function UserAvatar({ url, name, size = 44, pro }: UserAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const ringPadding = pro ? 3 : 0;
  const innerSize = size - ringPadding * 2;

  const avatar = url ? (
    <Image
      source={{ uri: url }}
      style={[
        styles.image,
        { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
      ]}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
      ]}
    >
      <Typography variant="label" color={COLORS.Text.secondary}>
        {initial}
      </Typography>
    </View>
  );

  return (
    <View style={{ width: size, height: size }}>
      {pro ? (
        <LinearGradient
          colors={gradients.accent}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              padding: ringPadding,
            },
          ]}
        >
          {avatar}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.plainRing,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          {avatar}
        </View>
      )}

      {pro ? (
        <View style={styles.crownBadge}>
          <Icon name="crown" size={12} color={COLORS.Text.inverse} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
  plainRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
  },
  image: { backgroundColor: COLORS.Surface.secondary },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Surface.secondary,
  },
  crownBadge: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.Surface.accent,
    borderWidth: 2,
    borderColor: COLORS.Background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
