import { REPORT_REASONS, type ReportReason } from '@/modules/social';
import {
  BottomSheet,
  ListGroup,
  ListRow,
  Typography,
  type IconName,
} from '@/shared/ui';
import { COLORS } from '@/theme';

const REASON_ICONS: Record<ReportReason, IconName> = {
  spam: 'email-alert-outline',
  abuse: 'emoticon-angry-outline',
  nudity: 'eye-off-outline',
  violence: 'alert-octagon-outline',
  other: 'dots-horizontal',
};

interface ReportSheetProps {
  visible: boolean;
  onSelect: (reason: ReportReason) => void;
  onClose: () => void;
}

// Выбор причины жалобы на пост или комментарий.
export function ReportSheet({ visible, onSelect, onClose }: ReportSheetProps) {
  return (
    <BottomSheet visible={visible} title="Пожаловаться" onClose={onClose}>
      <Typography variant="body" color={COLORS.Text.secondary}>
        Модератор проверит жалобу в течение 24 часов. Автор не узнает, кто
        пожаловался.
      </Typography>

      <ListGroup>
        {REPORT_REASONS.map((reason, i) => (
          <ListRow
            key={reason.value}
            icon={REASON_ICONS[reason.value]}
            title={reason.label}
            onPress={() => onSelect(reason.value)}
            isFirst={i === 0}
            isLast={i === REPORT_REASONS.length - 1}
          />
        ))}
      </ListGroup>
    </BottomSheet>
  );
}
