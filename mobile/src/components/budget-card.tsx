import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BudgetStatusBadge } from '@/components/budget-status-badge';
import { Card } from '@/components/card';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { DEFAULT_CATEGORY_ICON } from '@/constants/category-options';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useTheme } from '@/hooks/use-theme';
import { BUDGET_PERIODS, type Budget } from '@/types/budget';
import { getBudgetStatusLevel, type BudgetStatusLevel } from '@/utils/budget';
import { formatCurrency } from '@/utils/format';

type BudgetCardProps = {
  budget: Budget;
  onPress: () => void;
};

const STATUS_COLOR_KEY: Record<BudgetStatusLevel, 'success' | 'warning' | 'danger'> = {
  safe: 'success',
  warning: 'warning',
  critical: 'danger',
  exceeded: 'danger',
};

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const currency = useCurrency();
  const theme = useTheme();
  const status = getBudgetStatusLevel(budget.percentage_used);
  const statusColor = theme[STATUS_COLOR_KEY[status]];
  const periodLabel = BUDGET_PERIODS.find((option) => option.value === budget.period)?.label ?? budget.period;
  const iconName = (budget.category_details.icon ||
    DEFAULT_CATEGORY_ICON) as keyof typeof Ionicons.glyphMap;
  const remaining = Number(budget.remaining_amount);
  const isOver = remaining < 0;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? [styles.card, styles.pressed] : styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.identity}>
              <View style={[styles.iconCircle, { backgroundColor: budget.category_details.color }]}>
                <Ionicons name={iconName} size={18} color="#ffffff" />
              </View>
              <View>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {budget.category_name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {periodLabel}
                </ThemedText>
              </View>
            </View>
            <BudgetStatusBadge status={status} />
          </View>

          <ProgressBar progress={budget.percentage_used} color={statusColor} />

          <View style={styles.footerRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {formatCurrency(budget.spent_amount, currency)} of {formatCurrency(budget.amount, currency)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {budget.percentage_used_display}
            </ThemedText>
          </View>

          <ThemedText
            type="smallBold"
            style={[styles.remaining, isOver && { color: theme.danger }]}>
            {isOver
              ? `${formatCurrency(Math.abs(remaining), currency)} over budget`
              : `${formatCurrency(remaining, currency)} left`}
          </ThemedText>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remaining: {
    textAlign: 'right',
  },
});
