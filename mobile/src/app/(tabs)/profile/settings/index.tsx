import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useLogoutAll } from '@/hooks/use-logout-all';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';

type SettingsRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export default function SettingsScreen() {
  const theme = useTheme();
  const logoutAll = useLogoutAll();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows: SettingsRow[] = [
    {
      icon: 'person-circle-outline',
      label: 'Edit Profile',
      onPress: () => router.push('/profile/settings/edit-profile'),
    },
    {
      icon: 'options-outline',
      label: 'Preferences',
      onPress: () => router.push('/profile/settings/preferences'),
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => router.push('/profile/settings/about'),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {rows.map((row) => (
            <Pressable
              key={row.label}
              onPress={row.onPress}
              style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}>
              <ThemedView type="backgroundElement" style={styles.navRowInner}>
                <View style={styles.navRowLeft}>
                  <Ionicons name={row.icon} size={20} color={theme.text} />
                  <ThemedText type="smallBold">{row.label}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </ThemedView>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
            Session
          </ThemedText>
          <Pressable
            disabled={logoutAll.isPending}
            onPress={() => setConfirmOpen(true)}
            style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.navRowInner}>
              <View style={styles.navRowLeft}>
                <Ionicons name="log-out-outline" size={20} color={theme.danger} />
                <ThemedText type="smallBold" themeColor="danger">
                  {logoutAll.isPending ? 'Logging out…' : 'Log out of all devices'}
                </ThemedText>
              </View>
            </ThemedView>
          </Pressable>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.version}>
          SpendWise v{Constants.expoConfig?.version ?? '1.0.0'}
        </ThemedText>
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="Log out of all devices"
        message="This will end every active session, including this one. You'll need to log in again."
        confirmLabel="Log out everywhere"
        destructive
        loading={logoutAll.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          logoutAll.mutate(undefined, {
            onSuccess: () => showToast('Logged out of all devices'),
            onError: () => showToast("Couldn't log out of all devices"),
          });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    marginBottom: -Spacing.one,
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
  pressed: {
    opacity: 0.7,
  },
  version: {
    textAlign: 'center',
  },
});
