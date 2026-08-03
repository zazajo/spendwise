import { router } from 'expo-router';

import { ScheduledReportForm } from '@/components/reports/scheduled-report-form';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useCreateScheduledReport } from '@/hooks/use-create-scheduled-report';
import { showToast } from '@/hooks/use-toast';
import type { ScheduledReportFormValues } from '@/types/reports';

export default function NewScheduledReportScreen() {
  const { user } = useAuth();
  const createScheduledReport = useCreateScheduledReport();

  const defaultValues: ScheduledReportFormValues = {
    name: 'Monthly Summary Report',
    report_type: 'monthly_summary',
    format: 'json',
    frequency: 'monthly',
    email: user?.email ?? '',
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScheduledReportForm
        defaultValues={defaultValues}
        submitLabel="Create scheduled report"
        isSubmitting={createScheduledReport.isPending}
        submitError={createScheduledReport.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          createScheduledReport.mutate(values, {
            onSuccess: () => {
              showToast('Scheduled report created');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
