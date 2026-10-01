import { router } from 'expo-router';
import { View } from 'react-native';

import type { UserProgram } from '@/api';
import { FadeInItem } from '@/components/FadeInItem';
import { ProgramCard } from '@/components/ProgramCard';
import { Section } from '@/components/ui';
import { spacing } from '@/theme';
import { ROUTES } from '@/utils/constants/routes';

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
