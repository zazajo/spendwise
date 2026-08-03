import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { REPORT_TYPE_LABEL, type ReportType } from '@/types/reports';

type ReportTypeBadgeProps = {
  reportType: ReportType;
};

const ICON: Record<ReportType, keyof typeof Ionicons.glyphMap> = {
  monthly_summary: 'calendar-outline',
  category_analysis: 'pie-chart-outline',
  budget_variance: 'bar-chart-outline',
};

export function ReportTypeBadge({ reportType }: ReportTypeBadgeProps) {
  const theme = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
      <Ionicons name={ICON[reportType]} size={12} color={theme.primary} />
      <ThemedText type="small" style={[styles.label, { color: theme.primary }]}>
        {REPORT_TYPE_LABEL[reportType]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
  },
});
