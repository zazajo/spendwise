import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BudgetStatusBadge } from '@/components/budget-status-badge';
import { Card } from '@/components/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ExpenseListItem } from '@/components/expense-list-item';
import { ProgressBar } from '@/components/progress-bar';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_CATEGORY_ICON } from '@/constants/category-options';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useBudget } from '@/hooks/use-budget';
import { useBudgetExpenses } from '@/hooks/use-budget-expenses';
import { useDeleteBudget } from '@/hooks/use-delete-budget';
import { useRefreshBudget } from '@/hooks/use-refresh-budget';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { BUDGET_PERIODS } from '@/types/budget';
import { getBudgetDaysRemaining, getBudgetStatusLevel, type BudgetStatusLevel } from '@/utils/budget';
import { formatCurrency } from '@/utils/format';

const STATUS_COLOR_KEY: Record<BudgetStatusLevel, 'success' | 'warning' | 'danger'> = {
  safe: 'success',
  warning: 'warning',
  critical: 'danger',
  exceeded: 'danger',
};

export default function BudgetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = Number(id);
  const currency = useCurrency();
  const theme = useTheme();

  const { data: budget, isLoading, isError, refetch } = useBudget(budgetId);
  const { data: recentExpenses = [] } = useBudgetExpenses(budget);
  const deleteBudget = useDeleteBudget();
  const refreshBudget = useRefreshBudget();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // spent_amount/percentage_used are cached server-side and don't update when
  // expenses change, so refresh once as soon as this budget is available.
  const refreshedFor = useRef<number | null>(null);
  useEffect(() => {
    if (budget && refreshedFor.current !== budgetId) {
      refreshedFor.current = budgetId;
      refreshBudget.mutate(budgetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, budgetId]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !budget) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ErrorState message="Couldn't load this budget." onRetry={refetch} />
      </ThemedView>
    );
  }

  const status = getBudgetStatusLevel(budget.percentage_used);
  const statusColor = theme[STATUS_COLOR_KEY[status]];
  const periodLabel = BUDGET_PERIODS.find((option) => option.value === budget.period)?.label ?? budget.period;
  const iconName = (budget.category_details.icon ||
    DEFAULT_CATEGORY_ICON) as keyof typeof Ionicons.glyphMap;
  const remaining = Number(budget.remaining_amount);
  const isOver = remaining < 0;
  const daysRemaining = getBudgetDaysRemaining(budget);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: budget.category_details.color }]}>
            <Ionicons name={iconName} size={28} color="#ffffff" />
          </View>
          <ThemedText type="title" style={styles.name}>
            {budget.category_name}
          </ThemedText>
          <View style={styles.badgeRow}>
            <View style={[styles.periodBadge, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">
                {periodLabel}
              </ThemedText>
            </View>
            <BudgetStatusBadge status={status} />
          </View>
        </View>

        <Card style={styles.statsCard}>
          <ProgressBar progress={budget.percentage_used} color={statusColor} height={12} />

          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Budget amount
            </ThemedText>
            <ThemedText type="smallBold">{formatCurrency(budget.amount, currency)}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Spent
            </ThemedText>
            <ThemedText type="smallBold">{formatCurrency(budget.spent_amount, currency)}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Remaining
            </ThemedText>
            <ThemedText type="smallBold" style={isOver ? { color: theme.danger } : undefined}>
              {isOver
                ? `${formatCurrency(Math.abs(remaining), currency)} over`
                : formatCurrency(remaining, currency)}
            </ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Percentage used
            </ThemedText>
            <ThemedText type="smallBold">{budget.percentage_used_display}</ThemedText>
          </View>
          {daysRemaining !== null ? (
            <View style={styles.statRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Days remaining
              </ThemedText>
              <ThemedText type="smallBold">{daysRemaining}</ThemedText>
            </View>
          ) : null}
        </Card>

        <View style={styles.actions}>
          <Pressable
            style={[styles.editButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() =>
              router.push({ pathname: '/budgets/edit/[id]', params: { id: String(budgetId) } })
            }>
            <ThemedText type="smallBold">Edit</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.deleteButton, { backgroundColor: theme.danger }]}
            onPress={() => setConfirmOpen(true)}>
            <ThemedText type="smallBold" style={styles.deleteButtonText}>
              Delete
            </ThemedText>
          </Pressable>
        </View>

        <View>
          <SectionHeader title="Recent expenses" />
          {recentExpenses.length === 0 ? (
            <EmptyState icon="receipt-outline" title="No expenses in this budget yet" />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {recentExpenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  onPress={() =>
                    router.push({ pathname: '/expenses/[id]', params: { id: String(expense.id) } })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete budget"
        message="This can't be undone. Are you sure you want to delete this budget?"
        confirmLabel="Delete"
        destructive
        loading={deleteBudget.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteBudget.mutate(budgetId, {
            onSuccess: () => {
              showToast('Budget deleted');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'center',
  },
  periodBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  statsCard: {
    gap: Spacing.two,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  editButton: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
  },
});
