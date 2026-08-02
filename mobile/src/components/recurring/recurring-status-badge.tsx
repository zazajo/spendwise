import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RECURRING_STATUS_LABEL } from '@/utils/recurring';
import type { RecurringLifecycleStatus } from '@/types/recurring';

type RecurringStatusBadgeProps = {
  status: RecurringLifecycleStatus;
};

export function RecurringStatusBadge({ status }: RecurringStatusBadgeProps) {
  const theme = useTheme();

  const palette: Record<RecurringLifecycleStatus, { bg: string; fg: string }> = {
    active: { bg: theme.successSoft, fg: theme.success },
    paused: { bg: theme.warningSoft, fg: theme.warning },
    completed: { bg: theme.backgroundSelected, fg: theme.textSecondary },
  };

  const { bg, fg } = palette[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <ThemedText type="small" style={[styles.label, { color: fg }]}>
        {RECURRING_STATUS_LABEL[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
  },
});
