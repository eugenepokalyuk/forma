import { View } from 'react-native';

import type { UserProgram } from '@/modules/programs';
import { Section } from '@/shared/ui';
import { spacing } from '@/theme';

import { HomeProgramCard } from '@/pages/Home/components/HomeProgramCard';

// Свои карточки программ на главной — со стартом следующей тренировки,
// а не карточки каталога.
export function ProgramsListView({ programs }: { programs: UserProgram[] }) {
  return (
    <Section padding>
      <View style={{ gap: spacing.md }}>
        {/* Без FadeInItem: стекло не рисуется в полупрозрачном родителе. */}
        {programs.map((item) => (
          <HomeProgramCard key={item.id} userProgram={item} />
        ))}
      </View>
    </Section>
  );
}
