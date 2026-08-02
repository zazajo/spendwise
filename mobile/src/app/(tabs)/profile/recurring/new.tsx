import { router } from 'expo-router';

import { RecurringForm } from '@/components/recurring/recurring-form';
import { ThemedView } from '@/components/themed-view';
import { useCreateRecurringExpense } from '@/hooks/use-create-recurring-expense';
import { showToast } from '@/hooks/use-toast';
import type { RecurringFormValues } from '@/types/recurring';
import { toISODateString } from '@/utils/format';

const DEFAULT_VALUES: RecurringFormValues = {
  description: '',
  amount: '',
  category: 0,
  payment_method: null,
  frequency: 'monthly',
  interval: '1',
  start_date: toISODateString(new Date()),
  end_date: '',
  notes: '',
};

export default function NewRecurringExpenseScreen() {
  const createRecurring = useCreateRecurringExpense();

  return (
    <ThemedView style={{ flex: 1 }}>
      <RecurringForm
        defaultValues={DEFAULT_VALUES}
        submitLabel="Create recurring expense"
        isSubmitting={createRecurring.isPending}
        submitError={createRecurring.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          createRecurring.mutate(values, {
            onSuccess: () => {
              showToast('Recurring expense created');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
