import { ListGroup, ListRow, Section } from '@/components/ui';
import { useAuthStore } from '@/store/auth';

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
