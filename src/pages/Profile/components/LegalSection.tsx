import * as React from 'react';
import { Linking } from 'react-native';

import { IdeaSheet } from '@/pages/Profile/components/IdeaSheet';
import { LEGAL_LINKS } from '@/shared/constants/links';
import { ListGroup, ListRow, Section } from '@/shared/ui';

export function LegalSection() {
  const [ideaOpen, setIdeaOpen] = React.useState(false);

  return (
    <Section title="О приложении" padding>
      <ListGroup>
        <ListRow
          icon="lightbulb-on-outline"
          title="Предложить идею"
          onPress={() => setIdeaOpen(true)}
          isFirst
        />

        <ListRow
          icon="shield-lock-outline"
          title="Политика конфиденциальности"
          onPress={() => void Linking.openURL(LEGAL_LINKS.privacyPolicy)}
        />

        <ListRow
          icon="file-document-outline"
          title="Пользовательское соглашение"
          onPress={() => void Linking.openURL(LEGAL_LINKS.userAgreement)}
          isLast
        />
      </ListGroup>

      <IdeaSheet visible={ideaOpen} onClose={() => setIdeaOpen(false)} />
    </Section>
  );
}
