import { useAuthStore, useDeleteAccount, useSignOut } from '@/modules/auth';
import { ListGroup, ListRow, Section } from '@/shared/ui';

export function SignOutSection() {
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();
  // Выход гостя и есть удаление аккаунта (см. useSignOut) — отдельной строки
  // «Удалить аккаунт» не нужно.
  const isGuest = useAuthStore((s) => !!s.user?.isGuest);

  return (
    <Section padding>
      <ListGroup>
        <ListRow
          icon="logout"
          title={isGuest ? 'Выйти из гостевого режима' : 'Выйти'}
          destructive
          onPress={signOut}
          showChevron={false}
          isFirst
          isLast={isGuest}
        />

        {isGuest ? null : (
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
        )}
      </ListGroup>
    </Section>
  );
}
