import { Stack } from 'expo-router';

export default function ExpensesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Expenses' }} />
      <Stack.Screen name="new" options={{ title: 'Add Expense', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Expense' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Expense', presentation: 'modal' }} />
    </Stack>
  );
}
