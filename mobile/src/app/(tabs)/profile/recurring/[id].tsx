import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { RecurringFrequencyBadge } from '@/components/recurring/recurring-frequency-badge';
import { RecurringLogItem } from '@/components/recurring/recurring-log-item';
import { RecurringStatusBadge } from '@/components/recurring/recurring-status-badge';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_CATEGORY_ICON } from '@/constants/category-options';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteRecurringExpense } from '@/hooks/use-delete-recurring-expense';
import { useExpenseCategories } from '@/hooks/use-expense-categories';
import { useGenerateRecurringExpense } from '@/hooks/use-generate-recurring-expense';
import { useRecurringExpense } from '@/hooks/use-recurring-expense';
import { useRecurringLogs } from '@/hooks/use-recurring-logs';
import { usePauseRecurringExpense, useResumeRecurringExpense } from '@/hooks/use-recurring-status';
import { useRecurringUpcoming } from '@/hooks/use-recurring-upcoming';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { getRecurringLifecycleStatus } from '@/types/recurring';
import { formatCurrency } from '@/utils/format';
import { getIntervalLabel } from '@/utils/recurring';

export default function RecurringDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recurringId = Number(id);
  const { user } = useAuth();
  const currency = user?.profile.currency ?? '';
  const theme = useTheme();

  const { data: recurring, isLoading, isError, refetch } = useRecurringExpense(recurringId);
  const { data: categories } = useExpenseCategories();
  const { data: logs } = useRecurringLogs();
  const { data: upcoming } = useRecurringUpcoming(recurringId, 5);

  const deleteRecurring = useDeleteRecurringExpense();
  const pauseRecurring = usePauseRecurringExpense();
  const resumeRecurring = useResumeRecurringExpense();
  const generateNow = useGenerateRecurringExpense();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const category = useMemo(
    () => categories?.find((c) => c.id === recurring?.category),
    [categories, recurring]
  );

  const history = useMemo(
    () => (logs ?? []).filter((log) => log.recurring_expense === recurringId),
    [logs, recurringId]
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !recurring) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ErrorState message="Couldn't load this recurring expense." onRetry={refetch} />
      </ThemedView>
    );
  }

  const status = getRecurringLifecycleStatus(recurring);
  const iconName = (category?.icon || DEFAULT_CATEGORY_ICON) as keyof typeof Ionicons.glyphMap;
  const iconColor = category?.color ?? theme.primary;
  const isBusy =
    pauseRecurring.isPending || resumeRecurring.isPending || generateNow.isPending || deleteRecurring.isPending;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
            <Ionicons name={iconName} size={28} color="#ffffff" />
          </View>
          <ThemedText type="title" style={styles.name}>
            {recurring.description}
          </ThemedText>
          <View style={styles.badgeRow}>
            <RecurringStatusBadge status={status} />
            <RecurringFrequencyBadge frequency={recurring.frequency} interval={recurring.interval} />
          </View>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Amount
            </ThemedText>
            <ThemedText type="smallBold">{formatCurrency(recurring.amount, currency)}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Category
            </ThemedText>
            <ThemedText type="smallBold">{recurring.category_name}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Payment method
            </ThemedText>
            <ThemedText type="smallBold">{recurring.payment_method_name ?? 'Not set'}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Frequency
            </ThemedText>
            <ThemedText type="smallBold">
              {getIntervalLabel(recurring.frequency, recurring.interval)}
            </ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Start date
            </ThemedText>
            <ThemedText type="smallBold">{recurring.start_date}</ThemedText>
          </View>
          {recurring.end_date ? (
            <View style={styles.statRow}>
              <ThemedText type="small" themeColor="textSecondary">
                End date
              </ThemedText>
              <ThemedText type="smallBold">{recurring.end_date}</ThemedText>
            </View>
          ) : null}
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Next due
            </ThemedText>
            <ThemedText type="smallBold">
              {recurring.next_occurrence} ({recurring.next_occurrence_display})
            </ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Last generated
            </ThemedText>
            <ThemedText type="smallBold">{recurring.last_occurrence ?? 'Never'}</ThemedText>
          </View>
          {recurring.notes ? (
            <View style={styles.notesBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                Notes
              </ThemedText>
              <ThemedText type="small">{recurring.notes}</ThemedText>
            </View>
          ) : null}
        </Card>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() =>
              router.push({ pathname: '/profile/recurring/edit/[id]', params: { id: String(recurringId) } })
            }>
            <ThemedText type="smallBold">Edit</ThemedText>
          </Pressable>
          {status !== 'completed' ? (
            <Pressable
              disabled={isBusy}
              style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
              onPress={() => {
                if (status === 'active') {
                  pauseRecurring.mutate(recurringId, { onSuccess: () => showToast('Paused') });
                } else {
                  resumeRecurring.mutate(recurringId, { onSuccess: () => showToast('Resumed') });
                }
              }}>
              <ThemedText type="smallBold">{status === 'active' ? 'Pause' : 'Resume'}</ThemedText>
            </Pressable>
          ) : null}
        </View>

        {status === 'active' ? (
          <Pressable
            disabled={isBusy}
            style={[styles.generateButton, { backgroundColor: theme.primary }]}
            onPress={() =>
              generateNow.mutate(recurringId, {
                onSuccess: (result) => showToast(result.message),
              })
            }>
            <Ionicons name="flash-outline" size={16} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.generateButtonText}>
              {generateNow.isPending ? 'Generating…' : 'Generate now'}
            </ThemedText>
          </Pressable>
        ) : null}

        <Pressable
          disabled={isBusy}
          style={[styles.deleteButton, { backgroundColor: theme.danger }]}
          onPress={() => setConfirmOpen(true)}>
          <ThemedText type="smallBold" style={styles.deleteButtonText}>
            Delete
          </ThemedText>
        </Pressable>

        {upcoming && upcoming.upcoming_dates.length > 0 ? (
          <View>
            <SectionHeader title="Upcoming schedule" />
            <View style={{ gap: Spacing.two }}>
              {upcoming.upcoming_dates.map((entry) => (
                <ThemedView key={entry.date} type="backgroundElement" style={styles.upcomingRow}>
                  <ThemedText type="small">{entry.date}</ThemedText>
                  <ThemedText type="smallBold">{formatCurrency(entry.amount, currency)}</ThemedText>
                </ThemedView>
              ))}
            </View>
          </View>
        ) : null}

        <View>
          <SectionHeader title="Generation history" />
          {history.length === 0 ? (
            <EmptyState icon="time-outline" title="No expenses generated yet" />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {history.map((log) => (
                <RecurringLogItem key={log.id} log={log} currency={currency} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete recurring expense"
        message="This can't be undone. Are you sure you want to delete this recurring expense?"
        confirmLabel="Delete"
        destructive
        loading={deleteRecurring.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteRecurring.mutate(recurringId, {
            onSuccess: () => {
              showToast('Recurring expense deleted');
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
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  statsCard: {
    gap: Spacing.two,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notesBlock: {
    gap: Spacing.half,
    marginTop: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
  },
  generateButtonText: {
    color: '#ffffff',
  },
  deleteButton: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
  },
  upcomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
