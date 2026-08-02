import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="categories/index" options={{ title: 'Categories' }} />
      <Stack.Screen name="categories/new" options={{ title: 'Add Category', presentation: 'modal' }} />
      <Stack.Screen name="categories/[id]" options={{ title: 'Category' }} />
      <Stack.Screen
        name="categories/edit/[id]"
        options={{ title: 'Edit Category', presentation: 'modal' }}
      />
      <Stack.Screen name="recurring/index" options={{ title: 'Recurring Expenses' }} />
      <Stack.Screen name="recurring/list" options={{ title: 'Recurring Expenses' }} />
      <Stack.Screen name="recurring/new" options={{ title: 'New Recurring Expense', presentation: 'modal' }} />
      <Stack.Screen name="recurring/[id]" options={{ title: 'Recurring Expense' }} />
      <Stack.Screen
        name="recurring/edit/[id]"
        options={{ title: 'Edit Recurring Expense', presentation: 'modal' }}
      />
    </Stack>
  );
}
