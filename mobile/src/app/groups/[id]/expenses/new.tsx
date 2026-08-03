import { router, useLocalSearchParams } from 'expo-router';

import { GroupExpenseForm } from '@/components/groups/group-expense-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useCreateGroupExpense } from '@/hooks/use-create-group-expense';
import { useGroup } from '@/hooks/use-group';
import { showToast } from '@/hooks/use-toast';
import type { GroupExpenseFormValues } from '@/types/group';
import { buildGroupExpensePayload } from '@/utils/group-splits';
import { toISODateString } from '@/utils/format';

export default function NewGroupExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const { user } = useAuth();

  const group = useGroup(groupId);
  const createExpense = useCreateGroupExpense();

  if (group.isLoading || !group.data) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  const allMemberIds = group.data.members.map((member) => member.user);
  const defaultValues: GroupExpenseFormValues = {
    description: '',
    amount: '',
    date: toISODateString(new Date()),
    paid_by: user?.id ?? allMemberIds[0],
    split_type: 'equal',
    participantIds: allMemberIds,
    splitInputs: {},
    notes: '',
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <GroupExpenseForm
        group={group.data}
        defaultValues={defaultValues}
        submitLabel="Add expense"
        isSubmitting={createExpense.isPending}
        submitError={createExpense.isError}
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

          createExpense.mutate(payload, {
            onSuccess: () => {
              showToast('Expense added');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
