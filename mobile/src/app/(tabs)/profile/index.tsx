import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();
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
          onPress={() => router.push('/profile/categories')}
          style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.navRowInner}>
            <View style={styles.navRowLeft}>
              <Ionicons name="pricetags-outline" size={20} color={theme.text} />
              <ThemedText type="smallBold">Categories</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </ThemedView>
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile/recurring')}
          style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.navRowInner}>
            <View style={styles.navRowLeft}>
              <Ionicons name="repeat-outline" size={20} color={theme.text} />
              <ThemedText type="smallBold">Recurring Expenses</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </ThemedView>
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile/reports')}
          style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.navRowInner}>
            <View style={styles.navRowLeft}>
              <Ionicons name="document-text-outline" size={20} color={theme.text} />
              <ThemedText type="smallBold">Reports</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </ThemedView>
        </Pressable>

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
  navRow: {
    borderRadius: Spacing.three,
  },
  navRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
