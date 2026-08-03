import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BalanceSummaryCard } from '@/components/groups/balance-summary-card';
import { GroupExpenseListItem } from '@/components/groups/group-expense-list-item';
import { MemberAvatar } from '@/components/groups/member-avatar';
import { Card } from '@/components/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Fab } from '@/components/fab';
import { SectionHeader } from '@/components/section-header';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useGroup } from '@/hooks/use-group';
import { useGroupBalance } from '@/hooks/use-group-balance';
import { useGroupExpenses } from '@/hooks/use-group-expenses';
import { useLeaveGroup } from '@/hooks/use-leave-group';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { computeNetBalance, memberDisplayName } from '@/utils/group';

const MAX_PREVIEW_AVATARS = 5;

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const { user } = useAuth();
  const theme = useTheme();

  const group = useGroup(groupId);
  const balance = useGroupBalance(groupId);
  const expenses = useGroupExpenses({ group: groupId });
  const leaveGroup = useLeaveGroup();
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const isLoading = group.isLoading || balance.isLoading || expenses.isLoading;
  const isRefetching = group.isRefetching || balance.isRefetching || expenses.isRefetching;

  const refetchAll = useCallback(() => {
    return Promise.all([group.refetch(), balance.refetch(), expenses.refetch()]);
  }, [group, balance, expenses]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Skeleton width="60%" height={28} />
          <Skeleton width="100%" height={90} radius={16} />
          <Skeleton width="100%" height={64} radius={16} />
          <Skeleton width="100%" height={64} radius={16} />
        </ScrollView>
      </ThemedView>
    );
  }

  if (group.isError || !group.data) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load this group." onRetry={refetchAll} />
      </ThemedView>
    );
  }

  const data = group.data;
  const myBalance = balance.data?.balances.find((b) => b.user_id === user?.id);
  const balanceAmount = myBalance ? computeNetBalance(myBalance) : 0;
  const previewMembers = data.members.slice(0, MAX_PREVIEW_AVATARS);
  const overflowCount = data.members.length - previewMembers.length;
  const expenseList = expenses.data ?? [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.name}>
            {data.name}
          </ThemedText>
          {data.description ? (
            <ThemedText type="small" themeColor="textSecondary">
              {data.description}
            </ThemedText>
          ) : null}
        </View>

        <BalanceSummaryCard balance={balanceAmount} />

        <Pressable
          style={styles.membersRow}
          onPress={() => router.push({ pathname: '/groups/[id]/members', params: { id: String(groupId) } })}>
          <View style={styles.avatarStack}>
            {previewMembers.map((member, index) => (
              <MemberAvatar
                key={member.id}
                name={memberDisplayName(member)}
                size={32}
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
          <ThemedText type="small" themeColor="textSecondary" style={styles.membersLabel}>
            {data.members.length} {data.members.length === 1 ? 'member' : 'members'}
          </ThemedText>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </Pressable>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push({ pathname: '/groups/[id]/balances', params: { id: String(groupId) } })}>
            <Ionicons name="swap-horizontal-outline" size={18} color={theme.text} />
            <ThemedText type="smallBold">Balances</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push({ pathname: '/groups/[id]/members', params: { id: String(groupId) } })}>
            <Ionicons name="people-outline" size={18} color={theme.text} />
            <ThemedText type="smallBold">Members</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.dangerSoft }]}
            onPress={() => setConfirmLeaveOpen(true)}>
            <Ionicons name="exit-outline" size={18} color={theme.danger} />
            <ThemedText type="smallBold" style={{ color: theme.danger }}>
              Leave
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Shared expenses" />
          {expenseList.length === 0 ? (
            <Card>
              <EmptyState
                icon="receipt-outline"
                title="No shared expenses yet"
                message="Add an expense to start splitting costs with this group."
                actionLabel="Add expense"
                onAction={() =>
                  router.push({ pathname: '/groups/[id]/expenses/new', params: { id: String(groupId) } })
                }
              />
            </Card>
          ) : (
            <View style={{ gap: Spacing.two }}>
              {expenseList.map((expense) => (
                <GroupExpenseListItem
                  key={expense.id}
                  expense={expense}
                  onPress={() =>
                    router.push({
                      pathname: '/groups/[id]/expenses/[expenseId]',
                      params: { id: String(groupId), expenseId: String(expense.id) },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Fab
        onPress={() => router.push({ pathname: '/groups/[id]/expenses/new', params: { id: String(groupId) } })}
      />

      <ConfirmDialog
        visible={confirmLeaveOpen}
        title="Leave group"
        message="You'll lose access to this group's expenses and balances. This can't be undone."
        confirmLabel="Leave"
        destructive
        loading={leaveGroup.isPending}
        onCancel={() => setConfirmLeaveOpen(false)}
        onConfirm={() => {
          leaveGroup.mutate(groupId, {
            onSuccess: () => {
              showToast('Left the group');
              router.replace('/groups');
            },
            onError: (error: unknown) => {
              const message =
                (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                "Couldn't leave the group.";
              showToast(message);
              setConfirmLeaveOpen(false);
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
    paddingBottom: BottomTabInset + Spacing.six,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.half,
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
  },
  membersRow: {
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  membersLabel: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
});
