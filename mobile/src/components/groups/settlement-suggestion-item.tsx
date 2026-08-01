import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SuggestedSettlement } from '@/types/group';
import { formatCurrency } from '@/utils/format';

type SettlementSuggestionItemProps = {
  suggestion: SuggestedSettlement;
  currency: string;
  canSettle: boolean;
  isSettling?: boolean;
  onSettle: () => void;
};

export function SettlementSuggestionItem({
  suggestion,
  currency,
  canSettle,
  isSettling,
  onSettle,
}: SettlementSuggestionItemProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <View style={styles.textCol}>
        <ThemedText type="small">
          <ThemedText type="smallBold">{suggestion.from}</ThemedText> owes{' '}
          <ThemedText type="smallBold">{suggestion.to}</ThemedText>
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.warning }}>
          {formatCurrency(suggestion.amount, currency)}
        </ThemedText>
      </View>
      {canSettle ? (
        <Pressable
          disabled={isSettling}
          onPress={onSettle}
          style={[styles.button, { backgroundColor: theme.primary }]}>
          <ThemedText type="small" style={styles.buttonText}>
            {isSettling ? 'Saving…' : 'Mark settled'}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  textCol: {
    gap: Spacing.half,
  },
  button: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  buttonText: {
    color: '#ffffff',
  },
});
