import { NoProgramsView } from '@/pages/Home/components/views/NoProgramsView';
import { ProgramsListView } from '@/pages/Home/components/views/ProgramsListView';
import { useMyPrograms } from '@/pages/Home/hooks/useMyPrograms';
import { ErrorState, Section } from '@/shared/ui';

export function ProgramsSection() {
  const { programs, isLoading, isError, refetch } = useMyPrograms();

  // Без этой ветки ошибка загрузки выглядела как «у вас нет программ».
  if (isError && programs.length === 0) {
    return (
      <Section>
        <ErrorState onRetry={refetch} />
      </Section>
    );
  }

  if (isLoading || programs.length === 0) return <NoProgramsView />;

  return <ProgramsListView programs={programs} />;
}
