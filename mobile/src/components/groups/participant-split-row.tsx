import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { MemberAvatar } from '@/components/groups/member-avatar';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GroupMembership, SplitType } from '@/types/group';
import { memberDisplayName } from '@/utils/group';
import { formatCurrency } from '@/utils/format';

type ParticipantSplitRowProps = {
  member: GroupMembership;
  selected: boolean;
  onToggle: () => void;
  splitType: SplitType;
  value: string;
  onChangeValue: (value: string) => void;
  computedAmount?: string;
  currency: string;
};

const PLACEHOLDER: Record<Exclude<SplitType, 'equal'>, string> = {
  percentage: '%',
  custom: '0.00',
  shares: '#',
};

export function ParticipantSplitRow({
  member,
  selected,
  onToggle,
  splitType,
  value,
  onChangeValue,
  computedAmount,
  currency,
}: ParticipantSplitRowProps) {
  const theme = useTheme();
  const name = memberDisplayName(member);

  return (
    <View style={styles.row}>
      <Pressable onPress={onToggle} style={styles.leftGroup}>
        <View
          style={[
            styles.checkbox,
            { borderColor: theme.border },
            selected && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}>
          {selected ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
        </View>
        <MemberAvatar name={name} size={32} />
        <ThemedText type="small" numberOfLines={1} style={styles.name}>
          {name}
        </ThemedText>
      </Pressable>

      {selected && splitType !== 'equal' ? (
        <TextField
          value={value}
          onChangeText={onChangeValue}
          keyboardType="decimal-pad"
          placeholder={PLACEHOLDER[splitType]}
          style={styles.input}
        />
      ) : selected ? (
        <ThemedText type="small" themeColor="textSecondary">
          {formatCurrency(computedAmount ?? '0', currency)}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.small,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
  },
  input: {
    width: 76,
    paddingVertical: Spacing.one,
    textAlign: 'right',
  },
});
