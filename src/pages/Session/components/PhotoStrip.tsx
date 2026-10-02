import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

const THUMB_SIZE = 96;

interface PhotoStripProps {
  uris: string[];
  canAdd: boolean;
  onAdd: () => void;
  onRemove: (uri: string) => void;
}

// Лента выбранных фото: превью с крестиком и плитка «добавить» в конце.
export function PhotoStrip({ uris, canAdd, onAdd, onRemove }: PhotoStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {uris.map((uri) => (
        <View key={uri}>
          <Image source={{ uri }} style={styles.thumb} contentFit="cover" />

          <Pressable
            onPress={() => onRemove(uri)}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel="Убрать фото"
            style={styles.remove}
          >
            <Icon name="close" size={16} color={COLORS.Text.primary} />
          </Pressable>
        </View>
      ))}

      {canAdd ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Добавить фото"
          style={[styles.thumb, styles.add]}
        >
          <Icon name="image-plus" size={28} color={COLORS.Icon.accent} />

          <Typography variant="caption" color={COLORS.Text.secondary}>
            {'Фото'}
          </Typography>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
  },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.Stroke.secondary,
  },
  remove: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Overlay.backdrop,
  },
});
