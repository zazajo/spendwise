import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/skeleton';
import { Spacing } from '@/constants/theme';

export function ExpenseListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.row}>
          <Skeleton width={10} height={10} radius={5} />
          <View style={styles.middle}>
            <Skeleton width={140} height={14} />
            <Skeleton width={90} height={12} />
          </View>
          <Skeleton width={56} height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
});
