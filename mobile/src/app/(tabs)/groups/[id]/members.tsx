import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { InviteCodeCard } from '@/components/groups/invite-code-card';
import { MemberListItem } from '@/components/groups/member-list-item';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ErrorState } from '@/components/error-state';
import { SectionHeader } from '@/components/section-header';
import { Skeleton } from '@/components/skeleton';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAddMember } from '@/hooks/use-add-member';
import { useAuth } from '@/hooks/use-auth';
import { useGroup } from '@/hooks/use-group';
import { useRegenerateInvite } from '@/hooks/use-regenerate-invite';
import { useRemoveMember } from '@/hooks/use-remove-member';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import type { GroupMembership } from '@/types/group';

export default function GroupMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const { user } = useAuth();
  const theme = useTheme();

  const group = useGroup(groupId);
  const addMember = useAddMember(groupId);
  const removeMember = useRemoveMember(groupId);
  const regenerateInvite = useRegenerateInvite(groupId);

  const [username, setUsername] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<GroupMembership | null>(null);

  if (group.isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Skeleton width="100%" height={140} radius={16} />
          <Skeleton width="100%" height={64} radius={16} />
          <Skeleton width="100%" height={64} radius={16} />
        </ScrollView>
      </ThemedView>
    );
  }

  if (group.isError || !group.data) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load members." onRetry={group.refetch} />
      </ThemedView>
    );
  }

  const data = group.data;

  function handleAddMember() {
    if (!username.trim()) return;
    addMember.mutate(
      { username: username.trim() },
      {
        onSuccess: () => {
          showToast('Member added');
          setUsername('');
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            "Couldn't add that member.";
          showToast(message);
        },
      }
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <InviteCodeCard
          inviteCode={data.invite_code}
          isAdmin={data.is_admin}
          onRegenerate={() => {
            regenerateInvite.mutate(undefined, {
              onSuccess: () => showToast('Invite code regenerated'),
            });
          }}
          isRegenerating={regenerateInvite.isPending}
        />

        {data.is_admin ? (
          <View style={styles.addSection}>
            <ThemedText type="smallBold">Add member by username</ThemedText>
            <View style={styles.addRow}>
              <View style={styles.addInput}>
                <TextField
                  placeholder="username"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
              <Pressable
                disabled={addMember.isPending}
                onPress={handleAddMember}
                style={[styles.addButton, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" style={styles.addButtonText}>
                  {addMember.isPending ? 'Adding…' : 'Add'}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title={`Members (${data.members.length})`} />
          <View style={{ gap: Spacing.two }}>
            {data.members.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                isOwner={member.user === data.created_by}
                canRemove={data.is_admin && member.user !== user?.id}
                onRemove={() => setMemberToRemove(member)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={memberToRemove !== null}
        title="Remove member"
        message={
          memberToRemove
            ? `Remove ${memberToRemove.username} from this group? Their balance history will stay, but they'll lose access.`
            : ''
        }
        confirmLabel="Remove"
        destructive
        loading={removeMember.isPending}
        onCancel={() => setMemberToRemove(null)}
        onConfirm={() => {
          if (!memberToRemove) return;
          removeMember.mutate(memberToRemove.user, {
            onSuccess: () => {
              showToast('Member removed');
              setMemberToRemove(null);
            },
          });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  addSection: {
    gap: Spacing.two,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.medium,
  },
  addButtonText: {
    color: '#ffffff',
  },
  section: {
    gap: Spacing.two,
  },
});
