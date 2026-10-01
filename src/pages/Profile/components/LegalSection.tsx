import { Linking } from 'react-native';

import { LEGAL_LINKS } from '@/shared/constants/links';
import { ListGroup, ListRow, Section } from '@/shared/ui';

export function LegalSection() {
  return (
    <Section title="О приложении">
      <ListGroup>
        <ListRow
          icon="shield-lock-outline"
          title="Политика конфиденциальности"
          onPress={() => void Linking.openURL(LEGAL_LINKS.privacyPolicy)}
          isFirst
        />

        <ListRow
          icon="file-document-outline"
          title="Пользовательское соглашение"
          onPress={() => void Linking.openURL(LEGAL_LINKS.userAgreement)}
          isLast
        />
      </ListGroup>
    </Section>
  );
}
