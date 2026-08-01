import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TrendBucket } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

type TrendBarChartProps = {
  buckets: TrendBucket[];
  currency: string;
  height?: number;
};

export function TrendBarChart({ buckets, currency, height = 140 }: TrendBarChartProps) {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const maxTotal = Math.max(...buckets.map((bucket) => bucket.total), 1);
  const selected = selectedIndex !== null ? buckets[selectedIndex] : null;

  return (
    <View>
      <View style={styles.header}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {selected ? selected.label : 'Tap a bar for details'}
        </ThemedText>
        <ThemedText type="smallBold">
          {selected ? formatCurrency(selected.total, currency) : ''}
        </ThemedText>
      </View>

      <View style={[styles.chartRow, { height }]}>
        {buckets.map((bucket, index) => (
          <Bar
            key={bucket.key}
            total={bucket.total}
            maxTotal={maxTotal}
            selected={index === selectedIndex}
            activeColor={theme.primary}
            mutedColor={theme.backgroundSelected}
            onPress={() => setSelectedIndex(index === selectedIndex ? null : index)}
          />
        ))}
      </View>

      <View style={styles.labelsRow}>
        {buckets.map((bucket) => (
          <ThemedText
            key={bucket.key}
            type="small"
            themeColor="textSecondary"
            numberOfLines={1}
            style={styles.barLabel}>
            {bucket.label}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

type BarProps = {
  total: number;
  maxTotal: number;
  selected: boolean;
  activeColor: string;
  mutedColor: string;
  onPress: () => void;
};

function Bar({ total, maxTotal, selected, activeColor, mutedColor, onPress }: BarProps) {
  const heightPercent = useSharedValue(0);

  useEffect(() => {
    heightPercent.value = withTiming(Math.max((total / maxTotal) * 100, total > 0 ? 4 : 1), {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [total, maxTotal, heightPercent]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${heightPercent.value}%`,
  }));

  return (
    <Pressable style={styles.barTouchTarget} onPress={onPress} hitSlop={4}>
      <View style={styles.barTrack}>
        <Animated.View
          style={[styles.barFill, animatedStyle, { backgroundColor: selected ? activeColor : mutedColor }]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    minHeight: 20,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  barTouchTarget: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: Radius.small,
    borderTopRightRadius: Radius.small,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  barLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
  },
});
