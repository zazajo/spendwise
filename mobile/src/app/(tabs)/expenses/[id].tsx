import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteExpense } from '@/hooks/use-delete-expense';
import { useExpense } from '@/hooks/use-expense';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const { user } = useAuth();
  const currency = user?.profile.currency ?? '';

  const { data: expense, isLoading, isError } = useExpense(expenseId);
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
        <ThemedText themeColor="textSecondary">Couldn&apos;t load this expense.</ThemedText>
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
            style={styles.editButton}
            onPress={() =>
              router.push({ pathname: '/expenses/edit/[id]', params: { id: String(expenseId) } })
            }>
            <ThemedText type="smallBold">Edit</ThemedText>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => setConfirmOpen(true)}>
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
          deleteExpense.mutate(expenseId, { onSuccess: () => router.back() });
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
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
  deleteButton: {
    flex: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#E5484D',
  },
  deleteButtonText: {
    color: '#ffffff',
  },
});
