import { router } from 'expo-router';
import { View } from 'react-native';

import type { UserProgram } from '@/modules/programs';
import { FadeInItem, Section } from '@/shared/ui';
import { ProgramCard } from '@/modules/programs/ui';
import { spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

export function ProgramsListView({ programs }: { programs: UserProgram[] }) {
  return (
    <Section padding>
      <View style={{ gap: spacing.sm }}>
        {programs.map((item, index) => (
          <FadeInItem key={item.id} index={index}>
            <ProgramCard program={item.program} />
          </FadeInItem>
        ))}
      </View>
    </Section>
  );
}
