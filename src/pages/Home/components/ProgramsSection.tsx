import { NoProgramsView } from '@/pages/Home/components/views/NoProgramsView';
import { ProgramsListView } from '@/pages/Home/components/views/ProgramsListView';
import { useUserPrograms } from '@/pages/Home/hooks/useUserPrograms';

export function ProgramsSection() {
  const { programs, isLoading } = useUserPrograms();

  if (isLoading || programs.length === 0) return <NoProgramsView />;

  return <ProgramsListView programs={programs} />;
}
