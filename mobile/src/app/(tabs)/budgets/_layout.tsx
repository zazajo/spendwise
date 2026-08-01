import { Stack } from 'expo-router';

export default function BudgetsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Budgets' }} />
      <Stack.Screen name="new" options={{ title: 'Create Budget', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Budget' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Edit Budget', presentation: 'modal' }} />
    </Stack>
  );
}
