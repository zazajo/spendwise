import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProgressBarProps = {
  progress: number;
  color: string;
  height?: number;
};

export function ProgressBar({ progress, color, height = 10 }: ProgressBarProps) {
  const theme = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(progress, 0), 100), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: theme.backgroundSelected, height, borderRadius: height / 2 },
      ]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: color, height, borderRadius: height / 2 }, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.pill,
  },
});
