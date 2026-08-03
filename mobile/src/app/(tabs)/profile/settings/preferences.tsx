import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { useUpdatePreferences } from '@/hooks/use-update-preferences';
import { useThemePreference, type ThemePreference } from '@/providers/theme-provider';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function PreferencesScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { preference, setPreference } = useThemePreference();
  const updatePreferences = useUpdatePreferences(user?.preferences.id ?? 0);

  const [thresholdInput, setThresholdInput] = useState(String(user?.preferences.budget_alert_threshold ?? 80));

  const notificationsEnabled = user?.preferences.notification_enabled ?? true;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Preferences' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <ThemedText type="smallBold">Theme</ThemedText>
          <View style={styles.chipRow}>
            {THEME_OPTIONS.map((option) => {
              const selected = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.backgroundElement },
                    selected && { backgroundColor: theme.primary },
                  ]}>
                  <Ionicons name={option.icon} size={16} color={selected ? '#ffffff' : theme.text} />
                  <ThemedText type="small" style={selected ? styles.chipTextSelected : undefined}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Notifications</ThemedText>
          <Pressable
            disabled={updatePreferences.isPending}
            onPress={() => {
              updatePreferences.mutate(
                { notification_enabled: !notificationsEnabled },
                {
                  onSuccess: () => showToast(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled'),
                }
              );
            }}
            style={[styles.toggleRow, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small">Budget and activity alerts</ThemedText>
            <View
              style={[
                styles.toggleBadge,
                { backgroundColor: notificationsEnabled ? theme.successSoft : theme.backgroundSelected },
              ]}>
              <ThemedText
                type="small"
                style={{ color: notificationsEnabled ? theme.success : theme.textSecondary }}>
                {notificationsEnabled ? 'On' : 'Off'}
              </ThemedText>
            </View>
          </Pressable>
        </View>

        <TextField
          label="Budget alert threshold (%)"
          keyboardType="number-pad"
          value={thresholdInput}
          onChangeText={setThresholdInput}
          onBlur={() => {
            const parsed = Number(thresholdInput);
            if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) {
              showToast('Enter a threshold between 1 and 100');
              setThresholdInput(String(user?.preferences.budget_alert_threshold ?? 80));
              return;
            }
            if (parsed === user?.preferences.budget_alert_threshold) return;
            updatePreferences.mutate(
              { budget_alert_threshold: parsed },
              { onSuccess: () => showToast('Preferences updated') }
            );
          }}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          The default percentage of a budget at which we&apos;ll flag it as a warning if you don&apos;t set
          one explicitly.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  toggleBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  hint: {
    marginTop: -Spacing.two,
  },
});
