import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';

type InviteCodeCardProps = {
  inviteCode: string | null;
  isAdmin: boolean;
  onRegenerate: () => void;
  isRegenerating?: boolean;
};

// No clipboard package is installed in this project, so copying relies on native text
// selection (long-press -> Copy) everywhere, plus a one-tap shortcut on web where
// navigator.clipboard is available without adding a dependency.
async function copyInviteCode(code: string) {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(code);
    showToast('Invite code copied');
  } else {
    showToast('Long-press the code to copy it');
  }
}

export function InviteCodeCard({ inviteCode, isAdmin, onRegenerate, isRegenerating }: InviteCodeCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Invite code
      </ThemedText>
      <Pressable onPress={() => inviteCode && copyInviteCode(inviteCode)}>
        <ThemedText type="title" style={styles.code} selectable>
          {inviteCode ?? '—'}
        </ThemedText>
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={() => inviteCode && copyInviteCode(inviteCode)} style={styles.actionButton}>
          <Ionicons name="copy-outline" size={16} color={theme.primary} />
          <ThemedText type="small" style={{ color: theme.primary }}>
            Copy
          </ThemedText>
        </Pressable>
        {isAdmin ? (
          <Pressable disabled={isRegenerating} onPress={onRegenerate} style={styles.actionButton}>
            <Ionicons name="refresh-outline" size={16} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {isRegenerating ? 'Regenerating…' : 'Regenerate'}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  code: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
  },
});
