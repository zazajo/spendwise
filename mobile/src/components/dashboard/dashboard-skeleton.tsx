import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import { Spacing } from '@/constants/theme';

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ gap: Spacing.one }}>
          <Skeleton width={100} height={12} />
          <Skeleton width={180} height={28} />
        </View>
        <Skeleton width={48} height={48} radius={24} />
      </View>

      <Card style={{ gap: Spacing.two }}>
        <Skeleton width={120} height={12} />
        <Skeleton width={160} height={36} />
        <Skeleton width={100} height={12} />
      </Card>

      <Card style={{ gap: Spacing.two }}>
        <Skeleton width="100%" height={12} />
        <Skeleton width="100%" height={10} />
        <Skeleton width="100%" height={12} />
      </Card>

      <View style={styles.actionsRow}>
        <Skeleton width={52} height={52} radius={26} />
        <Skeleton width={52} height={52} radius={26} />
        <Skeleton width={52} height={52} radius={26} />
      </View>

      <Skeleton width={140} height={20} />
      <Skeleton width="100%" height={64} radius={16} />
      <Skeleton width="100%" height={64} radius={16} />
      <Skeleton width="100%" height={64} radius={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
