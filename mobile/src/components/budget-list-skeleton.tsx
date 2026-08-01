import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { Spacing } from '@/constants/theme';

export function BudgetListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((key) => (
        <Card key={key} style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.identity}>
              <Skeleton width={36} height={36} radius={18} />
              <View style={styles.rowText}>
                <Skeleton width={100} height={14} />
                <Skeleton width={60} height={12} />
              </View>
            </View>
            <Skeleton width={56} height={20} radius={999} />
          </View>
          <Skeleton width="100%" height={10} radius={5} />
          <View style={styles.headerRow}>
            <Skeleton width={120} height={12} />
            <Skeleton width={80} height={12} />
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowText: {
    gap: Spacing.one,
  },
});
