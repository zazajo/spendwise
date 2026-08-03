import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Fab } from '@/components/fab';
import { ReportListSkeleton } from '@/components/reports/report-list-skeleton';
import { ScheduledReportItem } from '@/components/reports/scheduled-report-item';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useDeleteScheduledReport } from '@/hooks/use-delete-scheduled-report';
import { useScheduledReports } from '@/hooks/use-scheduled-reports';
import { useSetScheduledReportActive } from '@/hooks/use-scheduled-report-active';
import { showToast } from '@/hooks/use-toast';

export default function ScheduledReportsScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useScheduledReports();
  const setActive = useSetScheduledReportActive();
  const deleteScheduled = useDeleteScheduledReport();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Scheduled Reports' }} />
        <ScrollView contentContainerStyle={styles.content}>
          <ReportListSkeleton />
        </ScrollView>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Scheduled Reports' }} />
        <ErrorState message="Couldn't load scheduled reports." onRetry={refetch} />
      </ThemedView>
    );
  }

  const items = data ?? [];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Scheduled Reports' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        {items.length === 0 ? (
          <EmptyState
            icon="alarm-outline"
            title="No scheduled reports"
            message="Automatically generate and email reports on a recurring schedule."
            actionLabel="Create scheduled report"
            onAction={() => router.push('/profile/reports/scheduled/new')}
          />
        ) : (
          <View style={{ gap: Spacing.two }}>
            {items.map((item) => (
              <ScheduledReportItem
                key={item.id}
                scheduledReport={item}
                isToggling={setActive.isPending}
                onPress={() =>
                  router.push({
                    pathname: '/profile/reports/scheduled/edit/[id]',
                    params: { id: String(item.id) },
                  })
                }
                onToggleActive={() =>
                  setActive.mutate(
                    { id: item.id, isActive: !item.is_active },
                    { onSuccess: () => showToast(item.is_active ? 'Disabled' : 'Enabled') }
                  )
                }
                onDelete={() => setPendingDeleteId(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Fab onPress={() => router.push('/profile/reports/scheduled/new')} />

      <ConfirmDialog
        visible={pendingDeleteId !== null}
        title="Delete scheduled report"
        message="This can't be undone. Are you sure you want to delete this scheduled report?"
        confirmLabel="Delete"
        destructive
        loading={deleteScheduled.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId === null) return;
          deleteScheduled.mutate(pendingDeleteId, {
            onSuccess: () => {
              showToast('Scheduled report deleted');
              setPendingDeleteId(null);
            },
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
});
