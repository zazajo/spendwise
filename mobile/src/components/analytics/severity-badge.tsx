import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AnomalySeverity } from '@/types/analytics';
import { SEVERITY_LABEL } from '@/utils/analytics';

type SeverityBadgeProps = {
  severity: AnomalySeverity;
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const theme = useTheme();

  const palette: Record<AnomalySeverity, { bg: string; fg: string }> = {
    low: { bg: theme.primarySoft, fg: theme.primary },
    medium: { bg: theme.warningSoft, fg: theme.warning },
    high: { bg: theme.dangerSoft, fg: theme.danger },
    critical: { bg: theme.danger, fg: '#ffffff' },
  };

  const { bg, fg } = palette[severity];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <ThemedText type="small" style={[styles.label, { color: fg }]}>
        {SEVERITY_LABEL[severity]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
  },
});
