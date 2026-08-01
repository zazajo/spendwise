import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { Spacing } from '@/constants/theme';

export function AnalyticsDashboardSkeleton() {
  return (
    <View style={styles.container}>
      <Card style={{ gap: Spacing.three }}>
        <Skeleton width={140} height={14} />
        <View style={styles.row}>
          <Skeleton width={52} height={52} radius={26} />
          <View style={{ gap: Spacing.one }}>
            <Skeleton width={100} height={28} />
            <Skeleton width={80} height={14} />
          </View>
        </View>
        <Skeleton width="100%" height={10} />
      </Card>

      <Skeleton width={160} height={20} />
      <Card style={{ gap: Spacing.two }}>
        <Skeleton width="100%" height={140} radius={12} />
      </Card>

      <Skeleton width={160} height={20} />
      <Card style={{ gap: Spacing.three }}>
        <Skeleton width="100%" height={14} />
        <Skeleton width="100%" height={6} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="100%" height={6} />
      </Card>

      <Skeleton width={160} height={20} />
      <Card style={{ gap: Spacing.two }}>
        <Skeleton width="100%" height={64} radius={16} />
        <Skeleton width="100%" height={64} radius={16} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
