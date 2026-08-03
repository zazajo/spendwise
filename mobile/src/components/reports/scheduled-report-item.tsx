import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ReportTypeBadge } from '@/components/reports/report-type-badge';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SCHEDULED_FREQUENCY_LABEL, type ScheduledReport } from '@/types/report';

type ScheduledReportItemProps = {
  scheduledReport: ScheduledReport;
  onPress: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isToggling?: boolean;
};

export function ScheduledReportItem({
  scheduledReport,
  onPress,
  onToggleActive,
  onDelete,
  isToggling,
}: ScheduledReportItemProps) {
  const theme = useTheme();
  const nextSend = new Date(scheduledReport.next_send).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.headerRow}>
        <View style={styles.identity}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {scheduledReport.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {SCHEDULED_FREQUENCY_LABEL[scheduledReport.frequency]} · Next: {nextSend}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: scheduledReport.is_active ? theme.successSoft : theme.backgroundSelected },
          ]}>
          <ThemedText
            type="small"
            style={{ color: scheduledReport.is_active ? theme.success : theme.textSecondary }}>
            {scheduledReport.is_active ? 'Active' : 'Disabled'}
          </ThemedText>
        </View>
      </Pressable>

      <ReportTypeBadge reportType={scheduledReport.report_type} />

      <View style={styles.actions}>
        <Pressable disabled={isToggling} onPress={onToggleActive} style={styles.actionButton}>
          <Ionicons
            name={scheduledReport.is_active ? 'pause-outline' : 'play-outline'}
            size={16}
            color={theme.text}
          />
          <ThemedText type="small">{scheduledReport.is_active ? 'Disable' : 'Enable'}</ThemedText>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={16} color={theme.danger} />
          <ThemedText type="small" themeColor="danger">
            Delete
          </ThemedText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  identity: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
