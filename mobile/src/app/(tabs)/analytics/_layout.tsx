import { Stack } from 'expo-router';

export default function AnalyticsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Analytics' }} />
      <Stack.Screen name="trends" options={{ title: 'Spending Trends' }} />
      <Stack.Screen name="categories" options={{ title: 'Category Analysis' }} />
      <Stack.Screen name="health" options={{ title: 'Financial Health' }} />
      <Stack.Screen name="anomalies" options={{ title: 'Anomaly Detection' }} />
    </Stack>
  );
}
