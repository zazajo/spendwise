import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ErrorState } from '@/components/error-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteGroupExpense } from '@/hooks/use-delete-group-expense';
import { useGroupExpense } from '@/hooks/use-group-expense';
import { useSettleSplit } from '@/hooks/use-settle-split';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

const SPLIT_TYPE_LABEL: Record<string, string> = {
  equal: 'Equal split',
  percentage: 'Percentage split',
  custom: 'Custom split',
  shares: 'Split by shares',
};

export default function GroupExpenseDetailScreen() {
  const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId: string }>();
  const groupId = Number(id);
  const expenseIdNum = Number(expenseId);
  const { user } = useAuth();
  const currency = useCurrency();
  const theme = useTheme();

  const { data: expense, isLoading, isError, refetch } = useGroupExpense(expenseIdNum);
  const settleSplit = useSettleSplit(groupId);
  const deleteExpense = useDeleteGroupExpense(groupId);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !expense) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ErrorState message="Couldn't load this expense." onRetry={refetch} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.amount}>
          {formatCurrency(expense.amount, currency)}
        </ThemedText>
        <ThemedText type="subtitle">{expense.description}</ThemedText>

        <Card style={styles.infoCard}>
          <InfoRow label="Paid by" value={expense.paid_by_name} />
          <InfoRow label="Date" value={expense.date} />
          <InfoRow label="Split type" value={SPLIT_TYPE_LABEL[expense.split_type] ?? expense.split_type} />
          <InfoRow label="Status" value={expense.is_settled ? 'Settled' : 'Unsettled'} />
          {expense.notes ? <InfoRow label="Notes" value={expense.notes} /> : null}
        </Card>

        <View style={styles.section}>
          <ThemedText type="sectionTitle" style={styles.sectionTitle}>
            Split breakdown
          </ThemedText>
          <Card style={{ gap: Spacing.three }}>
            {expense.splits.map((split) => (
              <View key={split.id} style={styles.splitRow}>
                <View style={styles.splitLeft}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {split.user_name}
                  </ThemedText>
                  {split.percentage !== null ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {split.percentage.toFixed(1)}%
                    </ThemedText>
                  ) : null}
                </View>
                <View style={styles.splitRight}>
                  <ThemedText type="smallBold">{formatCurrency(split.amount, currency)}</ThemedText>
                  {split.is_paid ? (
                    <ThemedText type="small" style={{ color: theme.success }}>
                      Paid
                    </ThemedText>
                  ) : split.user === user?.id ? (
                    <Pressable
                      disabled={settleSplit.isPending}
                      onPress={() => {
                        settleSplit.mutate(
                          { expenseId: expenseIdNum, splitId: split.id },
                          { onSuccess: () => showToast('Marked as paid') }
                        );
                      }}>
                      <ThemedText type="small" style={{ color: theme.primary }}>
                        Mark paid
                      </ThemedText>
                    </Pressable>
                  ) : (
                    <ThemedText type="small" themeColor="textSecondary">
                      Unpaid
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.editButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() =>
              router.push({
                pathname: '/groups/[id]/expenses/edit/[expenseId]',
                params: { id: String(groupId), expenseId: String(expenseIdNum) },
              })
            }>
            <ThemedText type="smallBold">Edit</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.deleteButton, { backgroundColor: theme.danger }]}
            onPress={() => setConfirmDeleteOpen(true)}>
            <ThemedText type="smallBold" style={styles.deleteButtonText}>
              Delete
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmDeleteOpen}
        title="Delete expense"
        message="This can't be undone. Are you sure you want to delete this shared expense?"
        confirmLabel="Delete"
        destructive
        loading={deleteExpense.isPending}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          deleteExpense.mutate(expenseIdNum, {
            onSuccess: () => {
              showToast('Expense deleted');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
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
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  amount: {
    fontSize: 40,
    lineHeight: 46,
  },
  infoCard: {
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitLeft: {
    gap: Spacing.half,
  },
  splitRight: {
    alignItems: 'flex-end',
    gap: Spacing.half,
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
