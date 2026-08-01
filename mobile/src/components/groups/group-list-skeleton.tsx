import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { Spacing } from '@/constants/theme';

export function GroupListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((key) => (
        <Card key={key} style={styles.card}>
          <View style={styles.headerRow}>
            <Skeleton width={140} height={16} />
          </View>
          <View style={styles.avatarRow}>
            <Skeleton width={28} height={28} radius={14} />
            <Skeleton width={28} height={28} radius={14} />
            <Skeleton width={80} height={12} />
          </View>
          <View style={styles.headerRow}>
            <Skeleton width={90} height={28} />
            <Skeleton width={90} height={28} />
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
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
