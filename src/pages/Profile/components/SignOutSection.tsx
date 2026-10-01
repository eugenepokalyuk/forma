import { ListGroup, ListRow, Section } from '@/shared/ui';
import { useSignOut } from '@/modules/auth';

export function SignOutSection() {
  const signOut = useSignOut();

  return (
    <Section>
      <ListGroup>
        <ListRow
          icon="logout"
          title="Выйти"
          destructive
          onPress={signOut}
          showChevron={false}
          isFirst
          isLast
        />
      </ListGroup>
    </Section>
  );
}
