import { router, useLocalSearchParams } from 'expo-router';

import { ScheduledReportForm } from '@/components/reports/scheduled-report-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useScheduledReport } from '@/hooks/use-scheduled-report';
import { useUpdateScheduledReport } from '@/hooks/use-update-scheduled-report';
import { showToast } from '@/hooks/use-toast';
import type { ScheduledReportFormValues } from '@/types/reports';

export default function EditScheduledReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheduledReportId = Number(id);
  const { data: scheduledReport, isLoading } = useScheduledReport(scheduledReportId);
  const updateScheduledReport = useUpdateScheduledReport(scheduledReportId);

  if (isLoading || !scheduledReport) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  const defaultValues: ScheduledReportFormValues = {
    name: scheduledReport.name,
    report_type: scheduledReport.report_type,
    format: scheduledReport.format,
    frequency: scheduledReport.frequency,
    email: scheduledReport.email,
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScheduledReportForm
        defaultValues={defaultValues}
        submitLabel="Save changes"
        isSubmitting={updateScheduledReport.isPending}
        submitError={updateScheduledReport.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          updateScheduledReport.mutate(values, {
            onSuccess: () => {
              showToast('Scheduled report updated');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
