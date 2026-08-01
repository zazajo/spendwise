import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/skeleton';
import { Spacing } from '@/constants/theme';

export function CategoryListSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width={100} height={20} />
      {[0, 1, 2].map((key) => (
        <View key={`expense-${key}`} style={styles.row}>
          <Skeleton width={40} height={40} radius={20} />
          <View style={styles.rowText}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={12} />
          </View>
        </View>
      ))}

      <Skeleton width={100} height={20} />
      {[0, 1].map((key) => (
        <View key={`income-${key}`} style={styles.row}>
          <Skeleton width={40} height={40} radius={20} />
          <View style={styles.rowText}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: Spacing.one,
  },
});
