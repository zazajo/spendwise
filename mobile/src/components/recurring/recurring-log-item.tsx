import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecurringLog, RecurringLogStatus } from '@/types/recurring';
import { formatCurrency } from '@/utils/format';

type RecurringLogItemProps = {
  log: RecurringLog;
  currency: string;
};

const STATUS_ICON: Record<RecurringLogStatus, keyof typeof Ionicons.glyphMap> = {
  created: 'checkmark-circle',
  skipped: 'remove-circle',
  failed: 'close-circle',
};

export function RecurringLogItem({ log, currency }: RecurringLogItemProps) {
  const theme = useTheme();

  const statusColor: Record<RecurringLogStatus, string> = {
    created: theme.success,
    skipped: theme.textSecondary,
    failed: theme.danger,
  };
  const color = statusColor[log.status];

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <Ionicons name={STATUS_ICON[log.status]} size={18} color={color} />
      <View style={styles.middle}>
        <ThemedText type="small">{log.scheduled_date}</ThemedText>
        {log.status === 'failed' && log.error_message ? (
          <ThemedText type="small" style={{ color: theme.danger }} numberOfLines={2}>
            {log.error_message}
          </ThemedText>
        ) : null}
      </View>
      {log.expense_details ? (
        <ThemedText type="smallBold">{formatCurrency(log.expense_details.amount, currency)}</ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
});
