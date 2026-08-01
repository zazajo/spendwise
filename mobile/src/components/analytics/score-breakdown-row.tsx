import { StyleSheet, View } from 'react-native';

import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScoreBreakdownRowProps = {
  label: string;
  explanation: string;
  score: number;
};

export function ScoreBreakdownRow({ label, explanation, score }: ScoreBreakdownRowProps) {
  const theme = useTheme();
  const color = score >= 70 ? theme.success : score >= 50 ? theme.warning : theme.danger;

  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <ThemedText type="smallBold" style={{ color }}>
          {score}
        </ThemedText>
      </View>
      <ProgressBar progress={score} color={color} height={6} />
      <ThemedText type="small" themeColor="textSecondary">
        {explanation}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
