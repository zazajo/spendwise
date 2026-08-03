import { StyleSheet, View } from 'react-native';

import { SeverityBadge } from '@/components/analytics/severity-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import type { Anomaly } from '@/types/analytics';
import { formatCurrency } from '@/utils/format';

type AnomalyListItemProps = {
  anomaly: Anomaly;
};

export function AnomalyListItem({ anomaly }: AnomalyListItemProps) {
  const currency = useCurrency();
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.topRow}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.description}>
          {anomaly.description}
        </ThemedText>
        <ThemedText type="smallBold">{formatCurrency(anomaly.amount, currency)}</ThemedText>
      </View>
      <View style={styles.topRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {anomaly.category} · {anomaly.date}
        </ThemedText>
        <SeverityBadge severity={anomaly.severity} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {anomaly.reason}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  description: {
    flex: 1,
  },
});
