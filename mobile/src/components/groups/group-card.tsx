import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { MemberAvatar } from '@/components/groups/member-avatar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useGroupBalance } from '@/hooks/use-group-balance';
import { useTheme } from '@/hooks/use-theme';
import type { Group } from '@/types/group';
import { computeNetBalance, memberDisplayName } from '@/utils/group';
import { formatCurrency } from '@/utils/format';

type GroupCardProps = {
  group: Group;
  currentUserId: number;
  currency: string;
  onPress: () => void;
};

const MAX_VISIBLE_AVATARS = 4;

export function GroupCard({ group, currentUserId, currency, onPress }: GroupCardProps) {
  const theme = useTheme();
  const balanceQuery = useGroupBalance(group.id);

  const myBalance = balanceQuery.data?.balances.find((b) => b.user_id === currentUserId);
  const balanceAmount = myBalance ? computeNetBalance(myBalance) : 0;
  const isOwed = balanceAmount >= 0;
  const totalExpenses = Number(group.total_expenses ?? 0);
  const memberCount = group.members.length;
  const visibleMembers = group.members.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = memberCount - visibleMembers.length;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? [styles.card, styles.pressed] : styles.card}>
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
              {group.name}
            </ThemedText>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatarStack}>
              {visibleMembers.map((member, index) => (
                <MemberAvatar
                  key={member.id}
                  name={memberDisplayName(member)}
                  size={28}
                  bordered
                  style={index > 0 ? styles.avatarOverlap : undefined}
                />
              ))}
              {overflowCount > 0 ? (
                <View style={[styles.moreCircle, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText type="small">+{overflowCount}</ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </ThemedText>
          </View>

          <View style={styles.footerRow}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Total shared
              </ThemedText>
              <ThemedText type="smallBold">{formatCurrency(totalExpenses, currency)}</ThemedText>
            </View>
            <View style={styles.balanceColumn}>
              <ThemedText type="small" themeColor="textSecondary">
                {isOwed ? "You're owed" : 'You owe'}
              </ThemedText>
              <ThemedText
                type="smallBold"
                style={{ color: isOwed ? theme.success : theme.danger }}>
                {formatCurrency(Math.abs(balanceAmount), currency)}
              </ThemedText>
            </View>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  moreCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceColumn: {
    alignItems: 'flex-end',
  },
});
