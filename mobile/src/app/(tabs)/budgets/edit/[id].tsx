import { router, useLocalSearchParams } from 'expo-router';

import { BudgetForm } from '@/components/budget-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBudget } from '@/hooks/use-budget';
import { useUpdateBudget } from '@/hooks/use-update-budget';
import { showToast } from '@/hooks/use-toast';
import type { BudgetFormValues } from '@/types/budget';

export default function EditBudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = Number(id);
  const { data: budget, isLoading } = useBudget(budgetId);
  const updateBudget = useUpdateBudget(budgetId);

  if (isLoading || !budget) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  const defaultValues: BudgetFormValues = {
    category: budget.category,
    amount: budget.amount,
    period: budget.period,
    start_date: budget.start_date,
    end_date: budget.end_date ?? '',
    alert_threshold: String(budget.alert_threshold),
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <BudgetForm
        defaultValues={defaultValues}
        submitLabel="Save changes"
        isSubmitting={updateBudget.isPending}
        submitError={updateBudget.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          updateBudget.mutate(values, {
            onSuccess: () => {
              showToast('Budget updated');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
