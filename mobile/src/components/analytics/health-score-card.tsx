import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { FinancialHealthMetric } from '@/types/analytics';
import { GRADE_COLOR_KEY } from '@/utils/analytics';

type HealthScoreCardProps = {
  health: FinancialHealthMetric;
  onPress: () => void;
};

export function HealthScoreCard({ health, onPress }: HealthScoreCardProps) {
  const theme = useTheme();
  const color = theme[GRADE_COLOR_KEY[health.health_grade]];

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? [styles.card, styles.pressed] : styles.card}>
          <View style={styles.headerRow}>
            <ThemedText type="smallBold">Financial health</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>

          <View style={styles.scoreRow}>
            <View style={[styles.gradeCircle, { backgroundColor: color }]}>
              <ThemedText type="title" style={styles.gradeText}>
                {health.health_grade}
              </ThemedText>
            </View>
            <View style={styles.scoreInfo}>
              <ThemedText type="title" style={styles.scoreNumber}>
                {health.overall_score}
                <ThemedText type="small" themeColor="textSecondary">
                  {' '}
                  / 100
                </ThemedText>
              </ThemedText>
              <ThemedText type="small" style={{ color }}>
                {health.health_status}
              </ThemedText>
            </View>
          </View>

          <ProgressBar progress={health.overall_score} color={color} />
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  gradeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 24,
    lineHeight: 28,
    color: '#ffffff',
  },
  scoreInfo: {
    gap: Spacing.half,
  },
  scoreNumber: {
    fontSize: 28,
    lineHeight: 32,
  },
});
