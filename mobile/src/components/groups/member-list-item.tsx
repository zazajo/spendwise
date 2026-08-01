import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { MemberAvatar } from '@/components/groups/member-avatar';
import { RoleBadge } from '@/components/groups/role-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GroupMembership } from '@/types/group';
import { memberDisplayName } from '@/utils/group';

type MemberListItemProps = {
  member: GroupMembership;
  isOwner: boolean;
  canRemove: boolean;
  onRemove?: () => void;
};

export function MemberListItem({ member, isOwner, canRemove, onRemove }: MemberListItemProps) {
  const theme = useTheme();
  const name = memberDisplayName(member);

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <MemberAvatar name={name} size={40} />
      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          @{member.username}
        </ThemedText>
      </View>
      <RoleBadge role={member.role} isOwner={isOwner} />
      {canRemove ? (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
          <Ionicons name="close-circle-outline" size={20} color={theme.danger} />
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
  removeButton: {
    marginLeft: Spacing.one,
  },
});
