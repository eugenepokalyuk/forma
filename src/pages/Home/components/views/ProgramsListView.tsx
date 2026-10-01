import { router } from 'expo-router';
import { View } from 'react-native';

import type { UserProgram } from '@/modules/programs';
import { FadeInItem, Section } from '@/shared/ui';
import { ProgramCard } from '@/modules/programs';
import { spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

export function ProgramsListView({ programs }: { programs: UserProgram[] }) {
  return (
    <Section
      title="Мои программы"
      action={{
        label: 'Каталог',
        onPress: () => router.push(ROUTES.catalog),
      }}
    >
      <View style={{ gap: spacing.sm }}>
        {programs.map((item, index) => (
          <FadeInItem key={item.id} index={index}>
            <ProgramCard program={item.program} active={item.isActive} />
          </FadeInItem>
        ))}
      </View>
    </Section>
  );
}
