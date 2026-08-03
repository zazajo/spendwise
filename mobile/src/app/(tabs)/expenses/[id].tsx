import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { ErrorState } from '@/components/error-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useDeleteExpense } from '@/hooks/use-delete-expense';
import { useExpense } from '@/hooks/use-expense';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const theme = useTheme();
  const currency = useCurrency();

  const { data: expense, isLoading, isError, refetch } = useExpense(expenseId);
  const deleteExpense = useDeleteExpense();
  const [confirmOpen, setConfirmOpen] = useState(false);

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
          {currency} {expense.amount}
        </ThemedText>
        <ThemedText type="subtitle">{expense.description}</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <DetailRow label="Category" value={expense.category_name ?? 'Uncategorized'} />
          <DetailRow label="Date" value={expense.date} />
          <DetailRow label="Payment method" value={expense.payment_method_name ?? 'None'} />
          <DetailRow label="Status" value={capitalize(expense.payment_status)} />
          {expense.location ? <DetailRow label="Location" value={expense.location} /> : null}
          {expense.notes ? <DetailRow label="Notes" value={expense.notes} /> : null}
        </ThemedView>

        <View style={styles.actions}>
          <Pressable
            style={[styles.editButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() =>
              router.push({ pathname: '/expenses/edit/[id]', params: { id: String(expenseId) } })
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
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete expense"
        message="This can't be undone. Are you sure you want to delete this expense?"
        confirmLabel="Delete"
        destructive
        loading={deleteExpense.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteExpense.mutate(expenseId, {
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
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
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
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
