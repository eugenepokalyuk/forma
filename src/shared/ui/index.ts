// Дизайн-система: снаружи импортируем только отсюда — '@/shared/ui'.

// Текст, иконки, логотип
export { Typography } from './text/Typography';
export { Icon, type IconName } from './text/Icon';
export { CustomIcon, type CustomIconName } from './text/CustomIcon';
export { Logo } from './text/Logo';
export * from './text/ProBadge';
export * from './text/Badge';

// Кнопки
export * from './buttons/Button';
export * from './buttons/GlassIconButton';
export * from './buttons/TextButton';

// Поля ввода
export { Input } from './inputs/Input';
export { CodeInput } from './inputs/CodeInput';
export * from './inputs/Composer';
export * from './inputs/DismissKeyboard';

// Каркас экрана
export {
  ScreenContainer,
  useUnderStatusBarScroll,
} from './layout/ScreenContainer';
export { Section } from './layout/Section';
export * from './layout/TabBar';
export { Divider } from './layout/Divider';

// Карточки, строки, плитки
export * from './content/Card';
export * from './content/GlassCard';
export { ListRow, ListGroup } from './content/ListRow';
export { StatTile } from './content/StatTile';
export * from './content/UserAvatar';

// Шторки, тосты, состояние ошибки
export * from './feedback/BottomSheet';
export * from './feedback/Toast';
export * from './feedback/ErrorState';
export * from './feedback/EmptyState';

// Появление и фоны
export * from './motion/FadeInCover';
export * from './motion/FadeInItem';
export * from './motion/AuroraBackground';
