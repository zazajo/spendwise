import { router } from 'expo-router';

import { BudgetForm } from '@/components/budget-form';
import { ThemedView } from '@/components/themed-view';
import { useCreateBudget } from '@/hooks/use-create-budget';
import { showToast } from '@/hooks/use-toast';
import type { BudgetFormValues } from '@/types/budget';
import { toISODateString } from '@/utils/format';

const DEFAULT_VALUES: BudgetFormValues = {
  category: 0,
  amount: '',
  period: 'monthly',
  start_date: toISODateString(new Date()),
  end_date: '',
  alert_threshold: '80',
};

export default function NewBudgetScreen() {
  const createBudget = useCreateBudget();

  return (
    <ThemedView style={{ flex: 1 }}>
      <BudgetForm
        defaultValues={DEFAULT_VALUES}
        submitLabel="Create budget"
        isSubmitting={createBudget.isPending}
        submitError={createBudget.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          createBudget.mutate(values, {
            onSuccess: () => {
              showToast('Budget created');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
