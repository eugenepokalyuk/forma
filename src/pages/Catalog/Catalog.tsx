import { router } from 'expo-router';
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
import { ProgramCard, ProgramPreviewCard } from '@/modules/programs/ui';
import { CatalogGenderSwitch } from '@/pages/Catalog/components/CatalogGenderSwitch';
import { ProgramMediumCard } from '@/pages/Catalog/components/ProgramMediumCard';
import { COLORS } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';
import { useRefresh } from '@/shared/lib/hooks/useRefresh';

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

// Высота обложки закреплённой программы в каталоге.
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
  // на бэке) — если есть, идёт баннером первым в списке, под шапкой.
  const previewProgram = data?.find((p) => p.catalogLayout === 'preview');
  const rows = React.useMemo(
    () => buildCatalogRows((data ?? []).filter((p) => p !== previewProgram)),
    [data, previewProgram],
  );

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

  // Шапка с переключателем закреплена над списком, как в ленте; обложка
  // закреплённой программы — первый элемент списка, под статус-бар не заходит.
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
        // gap списка действует и между обложкой и первым рядом — под
        // обложкой его убираем: от начала секции до программ ровно SHEET_OVERLAP.
        ListHeaderComponentStyle={
          previewProgram ? { marginBottom: -ROW_GAP } : undefined
        }
        ListHeaderComponent={
          previewProgram ? (
            <View>
              <ProgramPreviewCard
                program={previewProgram}
                onPress={() => router.push(ROUTES.program(previewProgram.id))}
                bottomOverlap={SHEET_OVERLAP}
                height={PREVIEW_HEIGHT}
              />

              {/* Всё ниже обложки — секция, которая заходит на неё снизу. */}
              <View style={styles.sheetTop} />
            </View>
          ) : null
        }
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
              <ProgramCard program={item.program} />
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
  sheetTop: {
    height: SHEET_OVERLAP,
    marginTop: -SHEET_OVERLAP,
    backgroundColor: COLORS.Background.primary,
    borderTopLeftRadius: SHEET_OVERLAP,
    borderTopRightRadius: SHEET_OVERLAP,
  },
  mediumRow: {
    flexDirection: 'row',
    gap: MEDIUM_GAP,
  },
  mediumItem: {
    flex: 1,
  },
});
