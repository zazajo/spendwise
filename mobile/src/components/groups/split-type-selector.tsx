import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SplitType } from '@/types/group';

type SplitTypeSelectorProps = {
  value: SplitType;
  onChange: (value: SplitType) => void;
};

const OPTIONS: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equal' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'custom', label: 'Custom' },
  { value: 'shares', label: 'Shares' },
];

export function SplitTypeSelector({ value, onChange }: SplitTypeSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              { backgroundColor: theme.backgroundElement },
              selected && { backgroundColor: theme.primary },
            ]}>
            <ThemedText type="small" style={selected ? styles.selectedText : undefined}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  selectedText: {
    color: '#ffffff',
  },
});
