import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { Program } from '@/modules/programs';
import { AppHeader } from '@/modules/auth/ui';
import {
  ErrorState,
  FadeInItem,
  ScreenContainer,
  Typography,
  useTabBarClearance,
  useUnderStatusBarScroll,
} from '@/shared/ui';
import { useCatalog } from '@/modules/programs';
import { ProgramCard } from '@/modules/programs/ui';
import { ProgramMediumCard } from '@/pages/Catalog/components/ProgramMediumCard';
import { ProgramPreviewCard } from '@/pages/Catalog/components/ProgramPreviewCard';
import { COLORS, spacing } from '@/theme';

type CatalogRow =
  | { type: 'wide'; key: string; program: Program }
  | { type: 'medium'; key: string; programs: Program[] };

// Порядок программ — с бэка (Program.order, управляется в админке), поэтому
// тут больше не пересортировываем по реакциям. Wide-программы идут своей
// строкой, medium — парами по 1/2 ширины (нечётная последняя занимает
// половину строки, а не растягивается на всю).
function buildCatalogRows(programs: Program[]): CatalogRow[] {
  const rows: CatalogRow[] = [];
  let mediumBuffer: Program[] = [];

  const flushMedium = () => {
    if (mediumBuffer.length > 0) {
      rows.push({
        type: 'medium',
        key: mediumBuffer.map((p) => p.id).join('-'),
        programs: mediumBuffer,
      });
      mediumBuffer = [];
    }
  };

  for (const program of programs) {
    if (program.catalogLayout === 'medium') {
      mediumBuffer.push(program);
      if (mediumBuffer.length === 2) flushMedium();
    } else {
      flushMedium();
      rows.push({ type: 'wide', key: program.id, program });
    }
  }
  flushMedium();

  return rows;
}

// Тот же ProgramCard, что и на главном в «Мои программы» — раньше здесь была
// отдельная карточка с описанием и кнопкой «Добавить»; теперь добавление
// программы делается на её странице (см. pages/Program), а список тут
// один в один как в forma-project Figma (node 5487-2731).
// Насколько секция с программами заходит на обложку снизу; это же —
// расстояние от начала секции до первых программ.
const SHEET_OVERLAP = 20;

export default function CatalogScreen() {
  const tabBarClearance = useTabBarClearance();
  const statusBarScroll = useUnderStatusBarScroll();
  const { data, isLoading, isError, refetch } = useCatalog();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Единственная закреплённая preview-программа (см. Program.catalog_layout
  // на бэке) — если есть, идёт баннером над остальным списком.
  const previewProgram = data?.find((p) => p.catalogLayout === 'preview');
  const rows = React.useMemo(
    () => buildCatalogRows((data ?? []).filter((p) => p !== previewProgram)),
    [data, previewProgram],
  );

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return (
    <ScreenContainer
      edges={['top']}
      loading={isLoading}
      // Обложка сверху во всю высоту — со своим тёмным градиентом.
      statusBarScrim={!previewProgram}
    >
      <FlatList
        {...statusBarScroll.scrollProps}
        progressViewOffset={statusBarScroll.refreshOffset}
        style={styles.list}
        data={rows}
        keyExtractor={(row) => row.key}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={[
          {
            // Обложка начинается от самого верха экрана, под статус-баром.
            paddingTop: previewProgram ? 0 : statusBarScroll.paddingTop,
            paddingBottom: tabBarClearance,
            gap: spacing.md,
          },
          rows.length === 0 && styles.emptyContent,
        ]}
        // gap списка действует и между шапкой и первым элементом — под
        // обложкой его убираем: от начала секции до программ ровно SHEET_OVERLAP.
        ListHeaderComponentStyle={
          previewProgram ? { marginBottom: -spacing.md } : undefined
        }
        ListHeaderComponent={
          previewProgram ? (
            <View>
              <View style={styles.previewWrap}>
                <ProgramPreviewCard
                  program={previewProgram}
                  bottomOverlap={SHEET_OVERLAP}
                />

                {/* Время и батарея читаются на фото. */}
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0)']}
                  style={[
                    styles.previewTopShade,
                    { height: statusBarScroll.paddingTop + 64 },
                  ]}
                />

                <View
                  style={[
                    styles.previewHeaderOverlay,
                    { paddingTop: statusBarScroll.paddingTop },
                  ]}
                >
                  <AppHeader />
                </View>
              </View>

              {/* Всё ниже обложки — секция, которая заходит на неё снизу. */}
              <View style={styles.sheetTop} />
            </View>
          ) : (
            <AppHeader />
          )
        }
        ListEmptyComponent={
          isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <View style={styles.empty}>
              <Typography variant="display" align="center">
                {'Пока пусто'}
              </Typography>

              <Typography
                variant="body"
                color={COLORS.Text.secondary}
                align="center"
                style={{ marginTop: spacing.xs }}
              >
                {'Готовые программы появятся здесь'}
              </Typography>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <FadeInItem index={index} style={styles.itemList}>
            {item.type === 'wide' ? (
              <ProgramCard program={item.program} />
            ) : (
              <View style={styles.mediumRow}>
                {item.programs.map((program) => (
                  <ProgramMediumCard
                    key={program.id}
                    program={program}
                    style={
                      item.programs.length === 2
                        ? styles.mediumItemPaired
                        : styles.mediumItemAlone
                    }
                  />
                ))}
              </View>
            )}
          </FadeInItem>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  itemList: {
    paddingHorizontal: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  previewWrap: {
    position: 'relative',
  },
  previewHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  previewTopShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  sheetTop: {
    height: SHEET_OVERLAP,
    marginTop: -SHEET_OVERLAP,
    backgroundColor: COLORS.Background.primary,
    borderTopLeftRadius: SHEET_OVERLAP,
    borderTopRightRadius: SHEET_OVERLAP,
  },
  mediumRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mediumItemPaired: {
    flex: 1,
  },
  mediumItemAlone: {
    width: '50%',
  },
});
