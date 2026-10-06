import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Program } from '../models/program';
import { Card, ProBadge, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatProgramSubtitle } from '../helpers/formatProgramSubtitle';
import { ROUTES } from '@/shared/constants/routes';
import { ProgramReactions } from './ProgramReactions';

interface ProgramCardProps {
  program: Program;
  // Высота карточки; закреплённая программа в каталоге — выше обычной.
  height?: number;
}

// Единая карточка программы — раньше в каталоге и в «Мои программы» на
// главном были два разных вида карточек, теперь один компонент везде
// (см. forma-project Figma, node 5487-2731).
export function ProgramCard({ program, height }: ProgramCardProps) {
  const subtitle = formatProgramSubtitle(program);
  const isPro = program.tier === 'pro';

  return (
    <Card
      style={[styles.card, styles.cardClip, height ? { height } : null]}
      onPress={() => router.push(ROUTES.program(program.id))}
    >
      {program.coverImageUrl ? (
        <>
          <Image
            source={{ uri: program.coverImageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={[StyleSheet.absoluteFill, styles.coverTint]} />
        </>
      ) : null}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Typography variant="display" style={styles.title} numberOfLines={2}>
            {program.title}
          </Typography>

          <Typography
            variant="body"
            color={COLORS.Text.secondary}
            style={styles.subtitle}
          >
            {subtitle}
          </Typography>
        </View>
      </View>

      <View style={styles.footer}>
        <ProgramReactions program={program} style={styles.reactions} />

        {isPro ? <ProBadge style={styles.proBadge} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 230,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: COLORS.Surface.primary,
    justifyContent: 'space-between',
    borderWidth: 0,
  },
  cardClip: {
    overflow: 'hidden',
  },
  coverTint: {
    backgroundColor: COLORS.Overlay.tint,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 4,
  },
  // Низ карточки: реакции слева, бейдж ПРО — в правом углу, даже когда
  // реакций нет.
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  // Не помещаются в строку — переносятся вверх, бейдж остаётся в углу.
  reactions: {
    flex: 1,
    flexWrap: 'wrap-reverse',
  },
  // У ProBadge alignSelf: flex-start — держим его в нижнем углу.
  proBadge: { alignSelf: 'flex-end' },
});
