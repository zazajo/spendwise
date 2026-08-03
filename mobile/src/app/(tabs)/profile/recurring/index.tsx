import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ExpenseListItem } from '@/components/expense-list-item';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Fab } from '@/components/fab';
import { RecurringCard } from '@/components/recurring/recurring-card';
import { RecurringGenerateRangeModal } from '@/components/recurring/recurring-generate-range-modal';
import { RecurringListSkeleton } from '@/components/recurring/recurring-list-skeleton';
import { RecurringSummaryCards } from '@/components/recurring/recurring-summary-cards';
import { RecurringUpcomingItem } from '@/components/recurring/recurring-upcoming-item';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/use-expense-categories';
import { useGenerateDueRecurring } from '@/hooks/use-generate-due-recurring';
import { useGenerateRangeRecurring } from '@/hooks/use-generate-range-recurring';
import { useRecurringDashboard } from '@/hooks/use-recurring-dashboard';
import { useRecurringExpenses } from '@/hooks/use-recurring-expenses';
import { useRecurringLogs } from '@/hooks/use-recurring-logs';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import {
  getRecurringLifecycleStatus,
  type RecurringExpense,
  type RecurringLifecycleStatus,
} from '@/types/recurring';
import { toISODateString } from '@/utils/format';

const SECTION_META: Record<RecurringLifecycleStatus, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  active: { title: 'Active', icon: 'play-circle-outline' },
  paused: { title: 'Paused', icon: 'pause-circle-outline' },
  completed: { title: 'Completed', icon: 'checkmark-done-circle-outline' },
};

const PREVIEW_COUNT = 3;
const UPCOMING_PREVIEW_COUNT = 6;
const RECENT_LOG_COUNT = 5;

export default function RecurringDashboardScreen() {
  const theme = useTheme();

  const dashboard = useRecurringDashboard();
  const allRecurring = useRecurringExpenses({});
  const logs = useRecurringLogs();
  const { data: categories } = useExpenseCategories();
  const generateDue = useGenerateDueRecurring();
  const generateRange = useGenerateRangeRecurring();
  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState(toISODateString(new Date()));
  const [rangeEnd, setRangeEnd] = useState(toISODateString(new Date()));

  const categoryLookup = useMemo(() => {
    const map = new Map<number, { color: string; icon: string }>();
    for (const category of categories ?? []) {
      map.set(category.id, { color: category.color, icon: category.icon });
    }
    return map;
  }, [categories]);

  const isLoading = dashboard.isLoading || allRecurring.isLoading;
  const isError = dashboard.isError || allRecurring.isError;
  const isRefetching = dashboard.isRefetching || allRecurring.isRefetching || logs.isRefetching;

  const refetchAll = useCallback(() => {
    return Promise.all([dashboard.refetch(), allRecurring.refetch(), logs.refetch()]);
  }, [dashboard, allRecurring, logs]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <RecurringListSkeleton />
        </ScrollView>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load your recurring expenses." onRetry={refetchAll} />
      </ThemedView>
    );
  }

  const allItems = allRecurring.data ?? [];
  const grouped: Record<RecurringLifecycleStatus, RecurringExpense[]> = {
    active: [],
    paused: [],
    completed: [],
  };
  for (const item of allItems) {
    grouped[getRecurringLifecycleStatus(item)].push(item);
  }

  const timeline = [...(dashboard.data?.overdue ?? []), ...(dashboard.data?.upcoming_this_month ?? [])]
    .sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence))
    .slice(0, UPCOMING_PREVIEW_COUNT);

  const recentlyGenerated = (logs.data ?? [])
    .filter((log) => log.status === 'created' && log.expense_details)
    .sort((a, b) => b.processed_date.localeCompare(a.processed_date))
    .slice(0, RECENT_LOG_COUNT);

  const hasDue = (dashboard.data?.summary.overdue_count ?? 0) > 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
        {dashboard.data ? (
          <RecurringSummaryCards
            activeCount={grouped.active.length}
            pausedCount={grouped.paused.length}
            completedCount={grouped.completed.length}
            estimatedMonthlyTotal={dashboard.data.summary.estimated_monthly_total}
            overdueCount={dashboard.data.summary.overdue_count}
          />
        ) : null}

        {hasDue ? (
          <Pressable
            disabled={generateDue.isPending}
            onPress={() =>
              generateDue.mutate(undefined, {
                onSuccess: (result) => showToast(result.message),
              })
            }
            style={({ pressed }) => [
              styles.generateDueButton,
              { backgroundColor: theme.danger },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="flash-outline" size={16} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.generateDueText}>
              {generateDue.isPending ? 'Generating…' : 'Generate all due expenses'}
            </ThemedText>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => setRangeModalOpen(true)}
          style={({ pressed }) => [
            styles.generateRangeButton,
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="calendar-outline" size={16} color={theme.text} />
          <ThemedText type="smallBold">Generate for date range</ThemedText>
        </Pressable>

        <View style={styles.section}>
          <SectionHeader
            title="Upcoming schedule"
            actionLabel="See all"
            onAction={() => router.push('/profile/recurring/list')}
          />
          {timeline.length === 0 ? (
            <EmptyState icon="calendar-outline" title="Nothing scheduled" message="You're all caught up." />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {timeline.map((item) => (
                <RecurringUpcomingItem
                  key={item.id}
                  recurring={item}
                  onPress={() =>
                    router.push({ pathname: '/profile/recurring/[id]', params: { id: String(item.id) } })
                  }
                />
              ))}
            </View>
          )}
        </View>

        {recentlyGenerated.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Recently generated" />
            <View style={{ gap: Spacing.two }}>
              {recentlyGenerated.map((log) => (
                <ExpenseListItem
                  key={log.id}
                  expense={log.expense_details!}
                  onPress={() =>
                    router.push({
                      pathname: '/profile/recurring/[id]',
                      params: { id: String(log.recurring_expense) },
                    })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {(['active', 'paused', 'completed'] as const).map((status) => {
          const items = grouped[status];
          if (items.length === 0) return null;
          const meta = SECTION_META[status];
          return (
            <View key={status} style={styles.section}>
              <SectionHeader
                title={`${meta.title} (${items.length})`}
                actionLabel={items.length > PREVIEW_COUNT ? 'See all' : undefined}
                onAction={() => router.push({ pathname: '/profile/recurring/list', params: { status } })}
              />
              <View style={{ gap: Spacing.two }}>
                {items.slice(0, PREVIEW_COUNT).map((item) => (
                  <RecurringCard
                    key={item.id}
                    recurring={item}
                    categoryColor={categoryLookup.get(item.category)?.color}
                    categoryIcon={categoryLookup.get(item.category)?.icon}
                    onPress={() =>
                      router.push({ pathname: '/profile/recurring/[id]', params: { id: String(item.id) } })
                    }
                  />
                ))}
              </View>
            </View>
          );
        })}

        {allItems.length === 0 ? (
          <EmptyState
            icon="repeat-outline"
            title="No recurring expenses yet"
            message="Automate subscriptions, bills, and other regular payments."
            actionLabel="Create recurring expense"
            onAction={() => router.push('/profile/recurring/new')}
          />
        ) : null}
      </ScrollView>

      <Fab onPress={() => router.push('/profile/recurring/new')} />

      <RecurringGenerateRangeModal
        visible={rangeModalOpen}
        startDate={rangeStart}
        endDate={rangeEnd}
        onChangeStartDate={setRangeStart}
        onChangeEndDate={setRangeEnd}
        isSubmitting={generateRange.isPending}
        onClose={() => setRangeModalOpen(false)}
        onGenerate={() => {
          generateRange.mutate(
            { start_date: rangeStart, end_date: rangeEnd },
            {
              onSuccess: (result) => {
                showToast(result.message);
                setRangeModalOpen(false);
              },
            }
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    gap: Spacing.two,
  },
  generateDueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
  },
  generateDueText: {
    color: '#ffffff',
  },
  generateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
});
