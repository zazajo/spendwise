import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
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
      <Stack.Screen name="reports/index" options={{ title: 'Reports' }} />
      <Stack.Screen name="reports/history" options={{ title: 'Financial History' }} />
      <Stack.Screen name="reports/new" options={{ title: 'Generate Report', presentation: 'modal' }} />
      <Stack.Screen name="reports/[id]" options={{ title: 'Report' }} />
      <Stack.Screen name="reports/scheduled/index" options={{ title: 'Scheduled Reports' }} />
      <Stack.Screen
        name="reports/scheduled/new"
        options={{ title: 'New Scheduled Report', presentation: 'modal' }}
      />
      <Stack.Screen
        name="reports/scheduled/edit/[id]"
        options={{ title: 'Edit Scheduled Report', presentation: 'modal' }}
      />
      <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
      <Stack.Screen name="settings/edit-profile" options={{ title: 'Edit Profile', presentation: 'modal' }} />
      <Stack.Screen
        name="settings/change-password"
        options={{ title: 'Change Password', presentation: 'modal' }}
      />
      <Stack.Screen name="settings/preferences" options={{ title: 'Preferences' }} />
      <Stack.Screen name="settings/about" options={{ title: 'About' }} />
    </Stack>
  );
}
