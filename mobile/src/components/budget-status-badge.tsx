import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BUDGET_STATUS_LABEL, type BudgetStatusLevel } from '@/utils/budget';

type BudgetStatusBadgeProps = {
  status: BudgetStatusLevel;
};

export function BudgetStatusBadge({ status }: BudgetStatusBadgeProps) {
  const theme = useTheme();

  const palette: Record<BudgetStatusLevel, { bg: string; fg: string }> = {
    safe: { bg: theme.successSoft, fg: theme.success },
    warning: { bg: theme.warningSoft, fg: theme.warning },
    critical: { bg: theme.dangerSoft, fg: theme.danger },
    exceeded: { bg: theme.danger, fg: '#ffffff' },
  };

  const { bg, fg } = palette[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <ThemedText type="small" style={[styles.label, { color: fg }]}>
        {BUDGET_STATUS_LABEL[status]}
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
