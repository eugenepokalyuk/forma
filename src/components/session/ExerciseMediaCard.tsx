import { Image } from 'expo-image';
import * as React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import type { Exercise } from '@/api';
import { Icon, Typography } from '@/components/ui';
import { COLORS, radius } from '@/theme';

const MEDIA_BG = '#F2F2F4';
const MEDIA_PLACEHOLDER_TEXT = '#9A9AA1';

export function ExerciseMediaCard({ exercise }: { exercise: Exercise }) {
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const hasImage = !!exercise.thumbnailUrl;

  return (
    <>
      <Pressable
        style={styles.mediaCard}
        disabled={!hasImage}
        onPress={() => setViewerOpen(true)}
        accessibilityRole={hasImage ? 'imagebutton' : undefined}
        accessibilityLabel={
          hasImage ? 'Открыть изображение упражнения' : undefined
        }
      >
        {hasImage ? (
          <Image
            source={{ uri: exercise.thumbnailUrl! }}
            style={styles.mediaImage}
            contentFit="contain"
          />
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Typography
              variant="display"
              color={MEDIA_PLACEHOLDER_TEXT}
              style={{ fontSize: 48 }}
            >
              {exercise.name.charAt(0).toUpperCase()}
            </Typography>
          </View>
        )}

        {hasImage ? (
          <View style={styles.mediaExpandHint}>
            <Icon name="arrow-expand" size={16} color={COLORS.White} />
          </View>
        ) : null}
      </Pressable>

      <Modal
        visible={viewerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerOpen(false)}
      >
        <Pressable
          style={styles.viewerBackdrop}
          onPress={() => setViewerOpen(false)}
        >
          {exercise.thumbnailUrl ? (
            <Image
              source={{ uri: exercise.thumbnailUrl }}
              style={styles.viewerImage}
              contentFit="contain"
            />
          ) : null}

          <Pressable
            style={styles.viewerClose}
            onPress={() => setViewerOpen(false)}
            hitSlop={16}
          >
            <Icon name="close" size={24} color={COLORS.White} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mediaCard: {
    width: '100%',
    height: 350,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: MEDIA_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImage: {
    width: '100%',
    height: 350,
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaExpandHint: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '80%',
  },
  viewerClose: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
