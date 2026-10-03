import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS } from '@/theme';

// Тонкая горизонтальная линия-разделитель — переиспользуется везде, где
// раньше каждый экран заводил свой хардкод { height: hairlineWidth, ... }.
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.Stroke.hairline,
    width: '100%',
  },
});
