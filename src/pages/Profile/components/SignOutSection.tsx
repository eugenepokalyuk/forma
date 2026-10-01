import { useDeleteAccount, useSignOut } from '@/modules/auth';
import { ListGroup, ListRow, Section } from '@/shared/ui';

export function SignOutSection() {
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();

  return (
    <Section padding>
      <ListGroup>
        <ListRow
          icon="logout"
          title="Выйти"
          destructive
          onPress={signOut}
          showChevron={false}
          isFirst
        />

        <ListRow
          icon="account-remove-outline"
          title={
            deleteAccount.deleting ? 'Удаляем аккаунт…' : 'Удалить аккаунт'
          }
          destructive
          onPress={deleteAccount.deleting ? undefined : deleteAccount.confirm}
          showChevron={false}
          isLast
        />
      </ListGroup>
    </Section>
  );
}
