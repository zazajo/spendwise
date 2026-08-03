import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { StatTile } from '@/components/analytics/stat-tile';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ProgressBar } from '@/components/progress-bar';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useCategoryAnalysis } from '@/hooks/use-category-analysis';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/format';

const MONTH_FORMAT = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

export default function CategoryAnalysisScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const [monthDate, setMonthDate] = useState(() => new Date());

  const { data, isLoading, isError, isRefetching, refetch } = useCategoryAnalysis(monthDate);

  const canGoForward = useMemo(() => {
    const today = new Date();
    return monthDate.getFullYear() < today.getFullYear() || monthDate.getMonth() < today.getMonth();
  }, [monthDate]);

  function shiftMonth(delta: number) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <View style={styles.monthNav}>
          <Pressable onPress={() => shiftMonth(-1)} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </Pressable>
          <ThemedText type="smallBold">{MONTH_FORMAT.format(monthDate)}</ThemedText>
          <Pressable onPress={() => canGoForward && shiftMonth(1)} hitSlop={8} disabled={!canGoForward}>
            <Ionicons name="chevron-forward" size={22} color={canGoForward ? theme.text : theme.border} />
          </Pressable>
        </View>

        {isLoading ? (
          <Card style={{ gap: Spacing.three }}>
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
          </Card>
        ) : isError || !data ? (
          <ErrorState message="Couldn't load category analysis." onRetry={refetch} />
        ) : data.categories.length === 0 ? (
          <Card>
            <EmptyState icon="pie-chart-outline" title="No spending this month" />
          </Card>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatTile
                label="Highest category"
                value={data.highest?.name ?? '—'}
                sublabel={data.highest ? formatCurrency(data.highest.total, currency) : undefined}
                valueColor={theme.danger}
              />
              <StatTile
                label="Lowest category"
                value={data.lowest?.name ?? '—'}
                sublabel={data.lowest ? formatCurrency(data.lowest.total, currency) : undefined}
                valueColor={theme.success}
              />
            </View>

            <Card style={styles.totalCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Total spent
              </ThemedText>
              <ThemedText type="title" style={styles.totalAmount}>
                {formatCurrency(data.totalAmount, currency)}
              </ThemedText>
            </Card>

            <Card style={{ gap: Spacing.three }}>
              {data.categories.map((category) => (
                <View key={String(category.id)} style={styles.row}>
                  <View style={styles.labelRow}>
                    <View style={[styles.dot, { backgroundColor: category.color }]} />
                    <ThemedText type="small" style={styles.name} numberOfLines={1}>
                      {category.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {category.percentage.toFixed(1)}%
                    </ThemedText>
                    <ThemedText type="smallBold">{formatCurrency(category.total, currency)}</ThemedText>
                  </View>
                  <ProgressBar progress={category.percentage} color={category.color} height={6} />
                </View>
              ))}
            </Card>
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  totalCard: {
    gap: Spacing.half,
  },
  totalAmount: {
    fontSize: 32,
    lineHeight: 38,
  },
  row: {
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
  },
});
