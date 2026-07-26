import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';

export default function ProfileScreen() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Username</ThemedText>
          <ThemedText themeColor="textSecondary">{user?.username}</ThemedText>
          <ThemedText type="smallBold" style={styles.cardSpacing}>
            Email
          </ThemedText>
          <ThemedText themeColor="textSecondary">{user?.email}</ThemedText>
        </ThemedView>

        <Pressable
          disabled={logout.isPending}
          onPress={() => logout.mutate()}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <ThemedText type="smallBold">{logout.isPending ? 'Logging out…' : 'Log out'}</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  cardSpacing: {
    marginTop: Spacing.two,
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5484D',
  },
  pressed: {
    opacity: 0.7,
  },
});
