import { ListGroup, ListRow, Section } from '@/shared/ui';
import { useAuthStore } from '@/modules/auth';

export function SignOutSection() {
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Section>
      <ListGroup>
        <ListRow
          icon="logout"
          title="Выйти"
          destructive
          onPress={() => void signOut()}
          showChevron={false}
          isFirst
          isLast
        />
      </ListGroup>
    </Section>
  );
}
