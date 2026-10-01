import { NoProgramsView } from '@/pages/Home/components/views/NoProgramsView';
import { ProgramsListView } from '@/pages/Home/components/views/ProgramsListView';
import { useMyPrograms } from '@/pages/Home/hooks/useMyPrograms';

export function ProgramsSection() {
  const { programs, isLoading } = useMyPrograms();

  if (isLoading || programs.length === 0) return <NoProgramsView />;

  return <ProgramsListView programs={programs} />;
}
