import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TrendDirection } from '@/utils/analytics';

type TrendIndicatorProps = {
  direction: TrendDirection;
  label?: string;
  /** For 'up' trends in a spending context, up is bad (danger) unless invertColor is set. */
  invertColor?: boolean;
};

const ICON: Record<TrendDirection, keyof typeof Ionicons.glyphMap> = {
  up: 'trending-up',
  down: 'trending-down',
  stable: 'remove',
};

export function TrendIndicator({ direction, label, invertColor }: TrendIndicatorProps) {
  const theme = useTheme();

  const colorKey =
    direction === 'stable'
      ? 'textSecondary'
      : (direction === 'up') !== Boolean(invertColor)
        ? 'danger'
        : 'success';

  const color = theme[colorKey];

  return (
    <View style={styles.row}>
      <Ionicons name={ICON[direction]} size={14} color={color} />
      {label ? (
        <ThemedText type="small" style={{ color }}>
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
