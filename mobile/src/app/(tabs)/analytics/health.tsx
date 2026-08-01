import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { InsightItem } from '@/components/analytics/insight-item';
import { ScoreBreakdownRow } from '@/components/analytics/score-breakdown-row';
import { Card } from '@/components/card';
import { ErrorState } from '@/components/error-state';
import { ProgressBar } from '@/components/progress-bar';
import { SectionHeader } from '@/components/section-header';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAnalyticsDashboard } from '@/hooks/use-analytics-dashboard';
import { useRefreshHealthScore } from '@/hooks/use-refresh-health-score';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { GRADE_COLOR_KEY } from '@/utils/analytics';

const SCORE_COMPONENTS = [
  {
    key: 'budget_adherence_score' as const,
    label: 'Budget adherence',
    explanation: 'How well your spending stays within your active budgets this month.',
  },
  {
    key: 'spending_stability_score' as const,
    label: 'Spending stability',
    explanation: 'How consistent your day-to-day spending has been over the last 30 days.',
  },
  {
    key: 'savings_rate_score' as const,
    label: 'Savings rate',
    explanation: 'How much of your monthly income you keep instead of spending.',
  },
  {
    key: 'expense_consistency_score' as const,
    label: 'Expense consistency',
    explanation: 'How similar this month’s total spending is to last month’s.',
  },
];

export default function FinancialHealthScreen() {
  const theme = useTheme();
  const dashboard = useAnalyticsDashboard();
  const refreshHealth = useRefreshHealthScore();

  if (dashboard.isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={{ gap: Spacing.three }}>
            <Skeleton width={80} height={40} />
            <Skeleton width="100%" height={10} />
          </Card>
          <Skeleton width="100%" height={200} radius={16} />
        </ScrollView>
      </ThemedView>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load your financial health." onRetry={dashboard.refetch} />
      </ThemedView>
    );
  }

  const health = dashboard.data.financial_health;
  const color = theme[GRADE_COLOR_KEY[health.health_grade]];

  const strengths = SCORE_COMPONENTS.filter((component) => health[component.key] >= 70);
  const improvements = SCORE_COMPONENTS.filter((component) => health[component.key] < 70);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={dashboard.isRefetching} onRefresh={dashboard.refetch} />}>
        <Card style={styles.heroCard}>
          <View style={[styles.gradeCircle, { backgroundColor: color }]}>
            <ThemedText type="title" style={styles.gradeText}>
              {health.health_grade}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.scoreNumber}>
            {health.overall_score}
            <ThemedText type="small" themeColor="textSecondary">
              {' '}
              / 100
            </ThemedText>
          </ThemedText>
          <ThemedText type="small" style={{ color }}>
            {health.health_status}
          </ThemedText>
          <ProgressBar progress={health.overall_score} color={color} />

          <Pressable
            disabled={refreshHealth.isPending}
            onPress={() => {
              refreshHealth.mutate(undefined, {
                onSuccess: () => showToast('Health score refreshed'),
              });
            }}
            style={({ pressed }) => [
              styles.refreshButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">
              {refreshHealth.isPending ? 'Refreshing…' : 'Refresh score'}
            </ThemedText>
          </Pressable>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="What affects your score" />
          <Card style={{ gap: Spacing.four }}>
            {SCORE_COMPONENTS.map((component) => (
              <ScoreBreakdownRow
                key={component.key}
                label={component.label}
                explanation={component.explanation}
                score={health[component.key]}
              />
            ))}
          </Card>
        </View>

        {strengths.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Strengths" />
            <Card style={{ gap: Spacing.three }}>
              {strengths.map((component) => (
                <InsightItem key={component.key} icon="checkmark-circle-outline" text={component.label} />
              ))}
            </Card>
          </View>
        ) : null}

        {improvements.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Areas for improvement" />
            <Card style={{ gap: Spacing.three }}>
              {improvements.map((component) => (
                <InsightItem key={component.key} icon="alert-circle-outline" text={component.label} />
              ))}
            </Card>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Recommendations" />
          <Card style={{ gap: Spacing.three }}>
            {health.recommendations_list.map((tip, index) => (
              <InsightItem key={index} icon="bulb-outline" text={tip} />
            ))}
          </Card>
        </View>
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
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  gradeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 28,
    lineHeight: 32,
    color: '#ffffff',
  },
  scoreNumber: {
    fontSize: 32,
    lineHeight: 38,
  },
  refreshButton: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.8,
  },
  section: {
    gap: Spacing.two,
  },
});
