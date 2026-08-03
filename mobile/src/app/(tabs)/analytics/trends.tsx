import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { StatTile } from '@/components/analytics/stat-tile';
import { TrendBarChart } from '@/components/analytics/trend-bar-chart';
import { TrendIndicator } from '@/components/analytics/trend-indicator';
import { Card } from '@/components/card';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useSpendingTrends } from '@/hooks/use-spending-trends';
import { useTheme } from '@/hooks/use-theme';
import type { TrendGranularity } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

const GRANULARITY_OPTIONS: { value: TrendGranularity; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function SpendingTrendsScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const [granularity, setGranularity] = useState<TrendGranularity>('monthly');

  const { data, isLoading, isError, isRefetching, refetch } = useSpendingTrends(granularity);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <View style={styles.chipRow}>
          {GRANULARITY_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setGranularity(option.value)}
              style={[
                styles.chip,
                { backgroundColor: theme.backgroundElement },
                granularity === option.value && { backgroundColor: theme.primary },
              ]}>
              <ThemedText
                type="small"
                style={granularity === option.value ? styles.chipTextSelected : undefined}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <Card>
            <Skeleton width="100%" height={180} radius={12} />
          </Card>
        ) : isError || !data ? (
          <ErrorState message="Couldn't load spending trends." onRetry={refetch} />
        ) : (
          <>
            <Card>
              <TrendBarChart buckets={data.buckets} height={180} />
            </Card>

            <View style={styles.trendRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Trend
              </ThemedText>
              <TrendIndicator
                direction={data.trend}
                label={
                  data.trend === 'up' ? 'Spending up' : data.trend === 'down' ? 'Spending down' : 'Stable'
                }
              />
            </View>

            <View style={styles.statsGrid}>
              <StatTile
                label="Highest period"
                value={data.highest ? formatCurrency(data.highest.total, currency) : '—'}
                sublabel={data.highest?.label}
              />
              <StatTile
                label="Lowest period"
                value={data.lowest ? formatCurrency(data.lowest.total, currency) : '—'}
                sublabel={data.lowest?.label}
              />
            </View>
            <StatTile label="Average daily spending" value={formatCurrency(data.averageDaily, currency)} />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
