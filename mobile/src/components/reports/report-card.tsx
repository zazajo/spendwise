import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ReportTypeBadge } from '@/components/reports/report-type-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Report } from '@/types/reports';
import { getReportDateRangeLabel } from '@/utils/reports';

type ReportCardProps = {
  report: Report;
  onPress: () => void;
};

export function ReportCard({ report, onPress }: ReportCardProps) {
  const theme = useTheme();
  const createdDate = new Date(report.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? [styles.card, styles.pressed] : styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.identity}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="document-text-outline" size={18} color={theme.primary} />
              </View>
              <View style={styles.identityText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {report.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {getReportDateRangeLabel(report)}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>

          <View style={styles.footerRow}>
            <ReportTypeBadge reportType={report.report_type} />
            <ThemedText type="small" themeColor="textSecondary">
              {report.format.toUpperCase()} · {createdDate}
            </ThemedText>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  identityText: {
    flexShrink: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
