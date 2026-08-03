import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ReportTypeBadge } from '@/components/reports/report-type-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Report } from '@/types/reports';
import { getReportDateRangeLabel } from '@/utils/reports';

type LatestReportCardProps = {
  report: Report | undefined;
  onPress: () => void;
};

export function LatestReportCard({ report, onPress }: LatestReportCardProps) {
  const theme = useTheme();
  if (!report) return null;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? [styles.card, styles.pressed] : styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="document-text-outline" size={18} color={theme.primary} />
            </View>
            <View style={styles.middle}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {report.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {getReportDateRangeLabel(report)}
              </ThemedText>
            </View>
            <ReportTypeBadge reportType={report.report_type} />
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
});
