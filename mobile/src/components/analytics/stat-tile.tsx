import { StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type StatTileProps = {
  label: string;
  value: string;
  sublabel?: string;
  valueColor?: string;
};

export function StatTile({ label, value, sublabel, valueColor }: StatTileProps) {
  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={[styles.value, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </ThemedText>
      {sublabel ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {sublabel}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: Spacing.half,
    padding: Spacing.three,
  },
  value: {
    fontSize: 20,
    lineHeight: 26,
  },
});
