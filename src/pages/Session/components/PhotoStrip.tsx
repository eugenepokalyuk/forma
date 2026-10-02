import { Image } from 'expo-image';
import * as React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { Icon, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

const GAP = spacing.sm;
// 4:3, а не квадрат как в ленте: квадрат на всю ширину сдвигает подпись
// за край экрана.
const ASPECT = 3 / 4;

interface PhotoStripProps {
  uris: string[];
  canAdd: boolean;
  onAdd: () => void;
  onRemove: (uri: string) => void;
}

// Выбранные фото — на всю ширину, листаются по одному; плитка «добавить»
// — последним слайдом.
export function PhotoStrip({ uris, canAdd, onAdd, onRemove }: PhotoStripProps) {
  const [width, setWidth] = React.useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  const slide = { width, height: Math.round(width * ASPECT) };

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width + GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.row}
        >
          {uris.map((uri) => (
            <View key={uri} style={slide}>
              <Image source={{ uri }} style={styles.photo} contentFit="cover" />

              <Pressable
                onPress={() => onRemove(uri)}
                hitSlop={spacing.sm}
                accessibilityRole="button"
                accessibilityLabel="Убрать фото"
                style={styles.remove}
              >
                <Icon name="close" size={20} color={COLORS.Text.primary} />
              </Pressable>
            </View>
          ))}

          {canAdd ? (
            <Pressable
              onPress={onAdd}
              accessibilityRole="button"
              accessibilityLabel="Добавить фото"
              style={[slide, styles.add]}
            >
              <Icon name="image-plus" size={40} color={COLORS.Icon.accent} />

              <Typography variant="subtitle" color={COLORS.Text.secondary}>
                {'Добавить фото'}
              </Typography>
            </Pressable>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: GAP },
  photo: { flex: 1, borderRadius: radius.lg },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.Stroke.secondary,
  },
  remove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Overlay.backdrop,
  },
});
