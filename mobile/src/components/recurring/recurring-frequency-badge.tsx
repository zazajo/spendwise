import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecurringFrequency } from '@/types/recurring';
import { getIntervalLabel } from '@/utils/recurring';

type RecurringFrequencyBadgeProps = {
  frequency: RecurringFrequency;
  interval: number;
};

export function RecurringFrequencyBadge({ frequency, interval }: RecurringFrequencyBadgeProps) {
  const theme = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
      <Ionicons name="repeat" size={12} color={theme.primary} />
      <ThemedText type="small" style={[styles.label, { color: theme.primary }]}>
        {getIntervalLabel(frequency, interval)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
  },
});
