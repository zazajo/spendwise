import { router, useLocalSearchParams } from 'expo-router';

import { ExpenseForm } from '@/components/expense-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpense } from '@/hooks/use-expense';
import { showToast } from '@/hooks/use-toast';
import { useUpdateExpense } from '@/hooks/use-update-expense';
import type { ExpenseFormValues } from '@/types/expense';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = Number(id);
  const { data: expense, isLoading } = useExpense(expenseId);
  const updateExpense = useUpdateExpense(expenseId);

  if (isLoading || !expense) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  const defaultValues: ExpenseFormValues = {
    amount: expense.amount,
    description: expense.description,
    date: expense.date,
    category: expense.category,
    payment_method: expense.payment_method,
    payment_status: expense.payment_status,
    location: expense.location,
    notes: expense.notes,
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ExpenseForm
        mode="edit"
        defaultValues={defaultValues}
        submitLabel="Save changes"
        isSubmitting={updateExpense.isPending}
        submitError={updateExpense.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          updateExpense.mutate(
            {
              amount: values.amount,
              description: values.description,
              date: values.date,
              category: values.category,
              payment_method: values.payment_method,
              payment_status: values.payment_status,
              notes: values.notes ?? '',
              location: values.location ?? '',
            },
            {
              onSuccess: () => {
                showToast('Expense updated');
                router.back();
              },
            }
          );
        }}
      />
    </ThemedView>
  );
}
