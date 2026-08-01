import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { MemberAvatar } from '@/components/groups/member-avatar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Group } from '@/types/group';
import { memberDisplayName } from '@/utils/group';

type GroupsSummaryCardProps = {
  groups: Group[];
  onPress: () => void;
};

const MAX_PREVIEW = 3;

export function GroupsSummaryCard({ groups, onPress }: GroupsSummaryCardProps) {
  const theme = useTheme();
  if (groups.length === 0) return null;

  const previewNames = groups.slice(0, MAX_PREVIEW).map((group) => group.name).join(', ');
  const overflowCount = groups.length - MAX_PREVIEW;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? [styles.card, styles.pressed] : styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="people" size={18} color={theme.primary} />
            </View>
            <View style={styles.middle}>
              <ThemedText type="smallBold">
                {groups.length} {groups.length === 1 ? 'group' : 'groups'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {previewNames}
                {overflowCount > 0 ? ` +${overflowCount} more` : ''}
              </ThemedText>
            </View>
            <View style={styles.avatarStack}>
              {groups[0].members.slice(0, 3).map((member, index) => (
                <MemberAvatar
                  key={member.id}
                  name={memberDisplayName(member)}
                  size={24}
                  bordered
                  style={index > 0 ? styles.avatarOverlap : undefined}
                />
              ))}
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
});
