import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference, type ThemePreference } from '@/providers/theme-provider';

type HubRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  tint: 'primary' | 'success' | 'warning' | 'neutral';
  onPress: () => void;
};

const MONEY_ROWS: HubRow[] = [
  {
    icon: 'people-outline',
    label: 'Groups',
    subtitle: 'Split expenses and settle up',
    tint: 'primary',
    onPress: () => router.push('/groups'),
  },
  {
    icon: 'repeat-outline',
    label: 'Recurring',
    subtitle: 'Subscriptions, bills, and automation',
    tint: 'success',
    onPress: () => router.push('/profile/recurring'),
  },
  {
    icon: 'document-text-outline',
    label: 'Reports',
    subtitle: 'Summaries, exports, and history',
    tint: 'warning',
    onPress: () => router.push('/profile/reports'),
  },
  {
    icon: 'pricetags-outline',
    label: 'Categories',
    subtitle: 'Organize how you track spending',
    tint: 'neutral',
    onPress: () => router.push('/profile/categories'),
  },
];

const APP_ROWS: HubRow[] = [
  {
    icon: 'settings-outline',
    label: 'Settings',
    subtitle: 'Account, preferences, and sessions',
    tint: 'neutral',
    onPress: () => router.push('/profile/settings'),
  },
  {
    icon: 'information-circle-outline',
    label: 'About SpendWise',
    subtitle: 'Version and app info',
    tint: 'neutral',
    onPress: () => router.push('/profile/settings/about'),
  },
];

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();
  const logout = useLogout();

  const firstName = user?.first_name?.trim() ?? '';
  const lastName = user?.last_name?.trim() ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || (user?.username ?? '');
  const initials =
    ((firstName.charAt(0) || user?.username?.charAt(0) || '?') + lastName.charAt(0)).toUpperCase();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Avatar uri={user?.profile.avatar} initials={initials} size={76} />
            </View>
            <ThemedText type="title" style={styles.name} numberOfLines={1}>
              {fullName}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user?.email}
            </ThemedText>
            <Pressable
              onPress={() => router.push('/profile/settings/edit-profile')}
              style={({ pressed }) => [
                styles.editChip,
                { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}>
              <Ionicons name="pencil-outline" size={14} color={theme.primary} />
              <ThemedText type="smallBold" style={{ color: theme.primary }}>
                Edit profile
              </ThemedText>
            </Pressable>
          </View>

          <Card style={styles.appearanceCard}>
            <ThemedText type="smallBold">Appearance</ThemedText>
            <View style={styles.themeChips}>
              {THEME_OPTIONS.map((option) => {
                const selected = preference === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setPreference(option.value)}
                    style={({ pressed }) => [
                      styles.themeChip,
                      { backgroundColor: selected ? theme.primarySoft : theme.backgroundSelected },
                      pressed && styles.pressed,
                    ]}>
                    <Ionicons
                      name={option.icon}
                      size={15}
                      color={selected ? theme.primary : theme.textSecondary}
                    />
                    <ThemedText
                      type="smallBold"
                      style={{ color: selected ? theme.primary : theme.textSecondary }}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <HubSection title="Your money" rows={MONEY_ROWS} />
          <HubSection title="App" rows={APP_ROWS} />

          <Pressable
            disabled={logout.isPending}
            onPress={() => logout.mutate()}
            style={({ pressed }) => [pressed && styles.pressed]}>
            <Card style={styles.logoutRow}>
              <View style={[styles.iconTile, { backgroundColor: theme.dangerSoft }]}>
                <Ionicons name="log-out-outline" size={18} color={theme.danger} />
              </View>
              <ThemedText type="smallBold" themeColor="danger">
                {logout.isPending ? 'Logging out…' : 'Log out'}
              </ThemedText>
            </Card>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.version}>
            SpendWise v{Constants.expoConfig?.version ?? '1.0.0'}
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function HubSection({ title, rows }: { title: string; rows: HubRow[] }) {
  const theme = useTheme();

  const tints: Record<HubRow['tint'], { background: string; foreground: string }> = {
    primary: { background: theme.primarySoft, foreground: theme.primary },
    success: { background: theme.successSoft, foreground: theme.success },
    warning: { background: theme.warningSoft, foreground: theme.warning },
    neutral: { background: theme.backgroundSelected, foreground: theme.text },
  };

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
        {title}
      </ThemedText>
      <Card style={styles.sectionCard}>
        {rows.map((row, index) => (
          <Fragment key={row.label}>
            {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
            <Pressable
              onPress={row.onPress}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View style={[styles.iconTile, { backgroundColor: tints[row.tint].background }]}>
                <Ionicons name={row.icon} size={18} color={tints[row.tint].foreground} />
              </View>
              <View style={styles.rowText}>
                <ThemedText type="smallBold">{row.label}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {row.subtitle}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </Pressable>
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  avatar: {
    marginBottom: Spacing.one,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    marginTop: Spacing.two,
  },
  appearanceCard: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  themeChips: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionCard: {
    padding: Spacing.two,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 36 + Spacing.three + Spacing.two,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two + Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  version: {
    textAlign: 'center',
  },
});
