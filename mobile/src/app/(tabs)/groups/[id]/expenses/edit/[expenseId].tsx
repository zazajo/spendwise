import { router, useLocalSearchParams } from 'expo-router';

import { GroupExpenseForm } from '@/components/groups/group-expense-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useGroup } from '@/hooks/use-group';
import { useGroupExpense } from '@/hooks/use-group-expense';
import { useUpdateGroupExpense } from '@/hooks/use-update-group-expense';
import { showToast } from '@/hooks/use-toast';
import type { GroupExpenseFormValues, SplitInputs } from '@/types/group';
import { buildGroupExpensePayload } from '@/utils/group-splits';

export default function EditGroupExpenseScreen() {
  const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId: string }>();
  const groupId = Number(id);
  const expenseIdNum = Number(expenseId);
  const { user } = useAuth();
  const currency = user?.profile.currency ?? '';

  const group = useGroup(groupId);
  const { data: expense, isLoading: expenseLoading } = useGroupExpense(expenseIdNum);
  const updateExpense = useUpdateGroupExpense(expenseIdNum);

  if (group.isLoading || expenseLoading || !group.data || !expense) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  const allMemberIds = group.data.members.map((member) => member.user);

  const splitInputs: SplitInputs = {};
  for (const split of expense.splits) {
    splitInputs[split.user] =
      expense.split_type === 'percentage' && split.percentage !== null
        ? String(split.percentage)
        : split.amount;
  }

  const defaultValues: GroupExpenseFormValues = {
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    paid_by: expense.paid_by,
    split_type: expense.split_type,
    participantIds: expense.splits.map((split) => split.user),
    splitInputs,
    notes: expense.notes,
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <GroupExpenseForm
        group={group.data}
        currency={currency}
        defaultValues={defaultValues}
        submitLabel="Save changes"
        isSubmitting={updateExpense.isPending}
        submitError={updateExpense.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          const payload = buildGroupExpensePayload(
            {
              group: groupId,
              paid_by: values.paid_by,
              amount: values.amount,
              description: values.description,
              date: values.date,
              notes: values.notes ?? '',
            },
            values.split_type,
            Number(values.amount),
            values.participantIds,
            allMemberIds,
            values.splitInputs
          );

          updateExpense.mutate(payload, {
            onSuccess: () => {
              showToast('Expense updated');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
