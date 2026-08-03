import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AnomalyListItem } from '@/components/analytics/anomaly-list-item';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAnomalies } from '@/hooks/use-anomalies';
import { useAnomalyRules } from '@/hooks/use-anomaly-rules';
import { useEnableAnomalyDetection } from '@/hooks/use-enable-anomaly-detection';
import { showToast } from '@/hooks/use-toast';

export default function AnomalyDetectionScreen() {

  const rules = useAnomalyRules();
  const anomalies = useAnomalies();
  const enableDetection = useEnableAnomalyDetection();

  const isLoading = rules.isLoading || anomalies.isLoading;
  const isError = rules.isError || anomalies.isError;
  const isRefetching = rules.isRefetching || anomalies.isRefetching;

  const refetchAll = useCallback(() => {
    return Promise.all([rules.refetch(), anomalies.refetch()]);
  }, [rules, anomalies]);

  const hasRules = (rules.data?.length ?? 0) > 0;
  const anomalyList = anomalies.data?.anomalies ?? [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
        {isLoading ? (
          <Card style={{ gap: Spacing.three }}>
            <Skeleton width="100%" height={64} radius={16} />
            <Skeleton width="100%" height={64} radius={16} />
          </Card>
        ) : isError ? (
          <ErrorState message="Couldn't load anomaly detection." onRetry={refetchAll} />
        ) : !hasRules ? (
          <Card>
            <EmptyState
              icon="options-outline"
              title="Anomaly detection isn't set up yet"
              message="Create a detection rule to start flagging expenses that look unusually large for their category."
              actionLabel={enableDetection.isPending ? 'Enabling…' : 'Enable detection'}
              onAction={() => {
                enableDetection.mutate(undefined, {
                  onSuccess: () => showToast('Anomaly detection enabled'),
                });
              }}
            />
          </Card>
        ) : anomalyList.length === 0 ? (
          <Card>
            <EmptyState
              icon="shield-checkmark-outline"
              title="No anomalies detected"
              message="Your spending over the last 30 days looks normal."
            />
          </Card>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              {anomalyList.length} unusual {anomalyList.length === 1 ? 'transaction' : 'transactions'} found
              in the last 30 days
            </ThemedText>
            <View style={{ gap: Spacing.two }}>
              {anomalyList.map((anomaly) => (
                <AnomalyListItem key={anomaly.expense_id} anomaly={anomaly} />
              ))}
            </View>
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
});
