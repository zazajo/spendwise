import { router, useLocalSearchParams } from 'expo-router';

import { RecurringForm } from '@/components/recurring/recurring-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecurringExpense } from '@/hooks/use-recurring-expense';
import { useUpdateRecurringExpense } from '@/hooks/use-update-recurring-expense';
import { showToast } from '@/hooks/use-toast';
import type { RecurringFormValues } from '@/types/recurring';

export default function EditRecurringExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recurringId = Number(id);
  const { data: recurring, isLoading } = useRecurringExpense(recurringId);
  const updateRecurring = useUpdateRecurringExpense(recurringId);

  if (isLoading || !recurring) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  const defaultValues: RecurringFormValues = {
    description: recurring.description,
    amount: recurring.amount,
    category: recurring.category,
    payment_method: recurring.payment_method,
    frequency: recurring.frequency,
    interval: String(recurring.interval),
    start_date: recurring.start_date,
    end_date: recurring.end_date ?? '',
    notes: recurring.notes ?? '',
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <RecurringForm
        defaultValues={defaultValues}
        submitLabel="Save changes"
        isSubmitting={updateRecurring.isPending}
        submitError={updateRecurring.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          updateRecurring.mutate(values, {
            onSuccess: () => {
              showToast('Recurring expense updated');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
