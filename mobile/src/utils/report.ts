import type { Report } from '@/types/report';

// start_date/end_date arrive as "YYYY-MM-DD"; parsing with a T00:00:00 suffix keeps
// this in the local timezone, matching the same fix used in utils/budget.ts.
function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function formatShortDate(value: string): string {
  return parseLocalDate(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Renders a human date-range label purely from the report's saved `parameters`,
// without needing to fetch the report's computed data first.
export function getReportDateRangeLabel(report: Report): string {
  const params = report.parameters as { year?: number; month?: number; start_date?: string; end_date?: string };

  if (report.report_type === 'category_analysis') {
    if (params.start_date && params.end_date) {
      return `${formatShortDate(params.start_date)} – ${formatShortDate(params.end_date)}`;
    }
    return 'Custom range';
  }

  if (params.year && params.month) {
    return `${MONTH_NAMES[params.month - 1]} ${params.year}`;
  }

  return 'This month';
}
