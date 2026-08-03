import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const FEATURES = [
  'Expense tracking and categories',
  'Budgets with alerts',
  'Spending analytics and trends',
  'Group expenses and settlements',
  'Recurring expenses and automation',
  'Reports and financial history',
];

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'About' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="wallet" size={32} color="#ffffff" />
          </View>
          <ThemedText type="title" style={styles.appName}>
            SpendWise
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Version {Constants.expoConfig?.version ?? '1.0.0'}
          </ThemedText>
        </View>

        <Card style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            SpendWise helps you track spending, manage budgets, split expenses with friends, and stay on
            top of your financial health - all in one place.
          </ThemedText>
        </Card>

        <Card style={styles.card}>
          <ThemedText type="smallBold">What&apos;s included</ThemedText>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.success} />
              <ThemedText type="small">{feature}</ThemedText>
            </View>
          ))}
        </Card>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Built with React Native, Expo, and Django.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  appName: {
    fontSize: 28,
    lineHeight: 34,
  },
  card: {
    gap: Spacing.two,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  footer: {
    textAlign: 'center',
  },
});
