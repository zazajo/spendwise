import { router } from 'expo-router';

import { ExpenseForm } from '@/components/expense-form';
import { ThemedView } from '@/components/themed-view';
import { useCreateExpense } from '@/hooks/use-create-expense';
import type { ExpenseFormValues } from '@/types/expense';

const DEFAULT_VALUES: ExpenseFormValues = {
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  category: null,
  payment_method: null,
  payment_status: 'completed',
  location: '',
  notes: '',
};

export default function NewExpenseScreen() {
  const createExpense = useCreateExpense();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ExpenseForm
        mode="create"
        defaultValues={DEFAULT_VALUES}
        submitLabel="Add expense"
        isSubmitting={createExpense.isPending}
        submitError={createExpense.isError}
        onSubmit={(values) => {
          createExpense.mutate(
            {
              amount: values.amount,
              description: values.description,
              date: values.date,
              category: values.category,
              payment_method: values.payment_method,
              notes: values.notes ?? '',
              location: values.location ?? '',
            },
            { onSuccess: () => router.back() }
          );
        }}
      />
    </ThemedView>
  );
}
