import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Groups lives on the root stack (not inside the tab bar), so its landing screen
// needs its own way back to the tabs - there's no tab bar underneath to escape with.
function BackToAppButton() {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={({ pressed }) => [{ paddingRight: Spacing.two }, pressed && { opacity: 0.6 }]}>
      <Ionicons name="chevron-back" size={24} color={theme.text} />
    </Pressable>
  );
}

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Groups', headerLeft: () => <BackToAppButton /> }}
      />
      <Stack.Screen name="new" options={{ title: 'Create Group', presentation: 'modal' }} />
      <Stack.Screen name="join" options={{ title: 'Join Group', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
