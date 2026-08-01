import { Stack } from 'expo-router';

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Groups' }} />
      <Stack.Screen name="new" options={{ title: 'Create Group', presentation: 'modal' }} />
      <Stack.Screen name="join" options={{ title: 'Join Group', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
