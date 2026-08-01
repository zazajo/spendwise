import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MemberRole } from '@/types/group';

type RoleBadgeProps = {
  role: MemberRole;
  isOwner?: boolean;
};

const ROLE_LABEL: Record<MemberRole, string> = {
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

export function RoleBadge({ role, isOwner }: RoleBadgeProps) {
  const theme = useTheme();
  const label = isOwner ? 'Owner' : ROLE_LABEL[role];
  const highlighted = isOwner || role === 'admin';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: highlighted ? theme.primarySoft : theme.backgroundElement },
      ]}>
      <ThemedText type="small" style={[styles.label, { color: highlighted ? theme.primary : theme.textSecondary }]}>
        {label}
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
