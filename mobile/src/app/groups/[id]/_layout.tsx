import { Stack } from 'expo-router';

export default function GroupDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Group' }} />
      <Stack.Screen name="members" options={{ title: 'Members' }} />
      <Stack.Screen name="balances" options={{ title: 'Balances' }} />
      <Stack.Screen name="expenses/new" options={{ title: 'Add Expense', presentation: 'modal' }} />
      <Stack.Screen name="expenses/[expenseId]" options={{ title: 'Expense' }} />
      <Stack.Screen
        name="expenses/edit/[expenseId]"
        options={{ title: 'Edit Expense', presentation: 'modal' }}
      />
    </Stack>
  );
}
