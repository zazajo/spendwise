import { useMutation } from '@tanstack/react-query';

import { downloadReportFile } from '@/services/reports';
import { shareReportFile } from '@/utils/report-export';
import type { Report } from '@/types/reports';

export function useExportReport() {
  return useMutation({
    mutationFn: async (report: Report) => {
      const { content, extension } = await downloadReportFile(report);
      await shareReportFile(report.name, extension, content);
    },
  });
}
