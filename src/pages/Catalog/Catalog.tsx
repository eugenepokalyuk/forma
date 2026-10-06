import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { Program } from '@/modules/programs';
import { AppHeader } from '@/modules/auth/ui';
import {
  FadeInItem,
  ListEmpty,
  ScreenContainer,
  useTabBarClearance,
} from '@/shared/ui';
import { useFeatureFlag } from '@/modules/featureFlags';
import {
  filterProgramsByGender,
  useCatalog,
  useCatalogStore,
} from '@/modules/programs';
import { ProgramCard } from '@/modules/programs/ui';
import { CatalogGenderSwitch } from '@/pages/Catalog/components/CatalogGenderSwitch';
import { ProgramMediumCard } from '@/pages/Catalog/components/ProgramMediumCard';
import { useRefresh } from '@/shared/lib/hooks/useRefresh';

type CatalogRow =
  | { type: 'wide'; key: string; program: Program; height?: number }
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
// Высота карточки закреплённой программы — первой в каталоге.
const PREVIEW_HEIGHT = 350;

// Сетка каталога по макету: поля по бокам, зазор между рядами и между
// medium-карточками в ряду.
const GUTTER = 20;
const ROW_GAP = 20;
const MEDIUM_GAP = 12;

export default function CatalogScreen() {
  const tabBarClearance = useTabBarClearance();
  const { data: catalog, isLoading, isError, refetch } = useCatalog();
  // Вкладки «Мужская» / «Женская» — только при включённом флаге в админке;
  // без флага каталог целиком, как раньше.
  const genderSwitchEnabled = useFeatureFlag('catalog_gender');
  const gender = useCatalogStore((s) => s.gender);
  const setGender = useCatalogStore((s) => s.setGender);
  const data = React.useMemo(
    () =>
      catalog && genderSwitchEnabled
        ? filterProgramsByGender(catalog, gender)
        : catalog,
    [catalog, genderSwitchEnabled, gender],
  );
  // Единственная закреплённая preview-программа (см. Program.catalog_layout
  // на бэке) — если есть, идёт первой: такая же карточка, как широкая,
  // только выше.
  const rows = React.useMemo(() => {
    const programs = data ?? [];
    const preview = programs.find((p) => p.catalogLayout === 'preview');
    const rest = buildCatalogRows(programs.filter((p) => p !== preview));
    return preview
      ? [
          {
            type: 'wide' as const,
            key: preview.id,
            program: preview,
            height: PREVIEW_HEIGHT,
          },
          ...rest,
        ]
      : rest;
  }, [data]);

  const { isRefreshing, onRefresh } = useRefresh(refetch);

  const header = (
    <>
      <AppHeader />

      {genderSwitchEnabled ? (
        <CatalogGenderSwitch
          value={gender}
          onChange={setGender}
          style={styles.genderSwitch}
        />
      ) : null}
    </>
  );

  // Шапка с переключателем закреплена над списком, как в ленте.
  return (
    <ScreenContainer edges={['top']} loading={isLoading} header={header}>
      <FlatList
        style={styles.list}
        data={rows}
        keyExtractor={(row) => row.key}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={[
          { paddingBottom: tabBarClearance, gap: ROW_GAP },
          rows.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={
          <ListEmpty
            isError={isError}
            onRetry={refetch}
            title="Пока пусто"
            message="Готовые программы появятся здесь"
          />
        }
        renderItem={({ item, index }) => (
          <FadeInItem index={index} style={styles.itemList}>
            {item.type === 'wide' ? (
              <ProgramCard program={item.program} height={item.height} />
            ) : (
              <View style={styles.mediumRow}>
                {item.programs.map((program) => (
                  <ProgramMediumCard
                    key={program.id}
                    program={program}
                    style={styles.mediumItem}
                  />
                ))}

                {/* Одиночная — на половину ряда, как в паре. */}
                {item.programs.length === 1 ? (
                  <View style={styles.mediumItem} />
                ) : null}
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
    paddingHorizontal: GUTTER,
  },
  genderSwitch: {
    marginHorizontal: GUTTER,
    marginBottom: ROW_GAP,
  },
  emptyContent: {
    flexGrow: 1,
  },
  mediumRow: {
    flexDirection: 'row',
    gap: MEDIUM_GAP,
  },
  mediumItem: {
    flex: 1,
  },
});
