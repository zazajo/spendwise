import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ErrorState } from '@/components/error-state';
import { ReportSummaryStats } from '@/components/reports/report-summary-stats';
import { ReportTypeBadge } from '@/components/reports/report-type-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useDeleteReport } from '@/hooks/use-delete-report';
import { useExportReport } from '@/hooks/use-export-report';
import { useReport } from '@/hooks/use-report';
import { useReportViewData } from '@/hooks/use-report-view-data';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { getReportDateRangeLabel } from '@/utils/report';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reportId = Number(id);
  const theme = useTheme();

  const { data: report, isLoading, isError, refetch } = useReport(reportId);
  const { data: viewData, isLoading: isViewDataLoading } = useReportViewData(report);
  const exportReport = useExportReport();
  const deleteReport = useDeleteReport();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rawDataVisible, setRawDataVisible] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !report) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ErrorState message="Couldn't load this report." onRetry={refetch} />
      </ThemedView>
    );
  }

  const createdDate = new Date(report.created_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="document-text-outline" size={28} color={theme.primary} />
          </View>
          <ThemedText type="title" style={styles.name}>
            {report.name}
          </ThemedText>
          <ReportTypeBadge reportType={report.report_type} />
        </View>

        <Card style={styles.metaCard}>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Generated
            </ThemedText>
            <ThemedText type="smallBold">{createdDate}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Date range
            </ThemedText>
            <ThemedText type="smallBold">{getReportDateRangeLabel(report)}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Format
            </ThemedText>
            <ThemedText type="smallBold">{report.format.toUpperCase()}</ThemedText>
          </View>
        </Card>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setRawDataVisible((prev) => !prev)}>
            <Ionicons name="eye-outline" size={16} color={theme.text} />
            <ThemedText type="smallBold">{rawDataVisible ? 'Hide raw data' : 'View raw data'}</ThemedText>
          </Pressable>
          <Pressable
            disabled={exportReport.isPending}
            style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() =>
              exportReport.mutate(report, {
                onSuccess: () => showToast('Report exported'),
                onError: () => showToast("Couldn't export report"),
              })
            }>
            {exportReport.isPending ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <Ionicons name="share-outline" size={16} color={theme.text} />
            )}
            <ThemedText type="smallBold">Export</ThemedText>
          </Pressable>
        </View>

        <Pressable
          style={[styles.deleteButton, { backgroundColor: theme.danger }]}
          onPress={() => setConfirmOpen(true)}>
          <ThemedText type="smallBold" style={styles.deleteButtonText}>
            Delete
          </ThemedText>
        </Pressable>

        {isViewDataLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
            Loading summary statistics…
          </ThemedText>
        ) : viewData ? (
          <ReportSummaryStats reportType={report.report_type} data={viewData} />
        ) : null}

        {rawDataVisible && viewData ? (
          <Card style={styles.rawDataCard}>
            <ThemedText type="smallBold">Raw data</ThemedText>
            <ThemedText type="code">{JSON.stringify(viewData, null, 2)}</ThemedText>
          </Card>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="Delete report"
        message="This can't be undone. Are you sure you want to delete this report?"
        confirmLabel="Delete"
        destructive
        loading={deleteReport.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteReport.mutate(reportId, {
            onSuccess: () => {
              showToast('Report deleted');
              router.back();
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  metaCard: {
    gap: Spacing.two,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
  },
  deleteButton: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
  },
  rawDataCard: {
    gap: Spacing.two,
  },
});
