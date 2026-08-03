import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BalanceSummaryCard } from '@/components/groups/balance-summary-card';
import { MemberAvatar } from '@/components/groups/member-avatar';
import { SettlementSuggestionItem } from '@/components/groups/settlement-suggestion-item';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { SectionHeader } from '@/components/section-header';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { useCreateSettlement } from '@/hooks/use-create-settlement';
import { useGroupBalance } from '@/hooks/use-group-balance';
import { useGroupSettlements } from '@/hooks/use-group-settlements';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import type { SuggestedSettlement } from '@/types/group';
import { computeNetBalance } from '@/utils/group';
import { formatCurrency } from '@/utils/format';

export default function GroupBalancesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const { user } = useAuth();
  const currency = useCurrency();
  const theme = useTheme();

  const balance = useGroupBalance(groupId);
  const settlements = useGroupSettlements(groupId);
  const createSettlement = useCreateSettlement(groupId);

  const isLoading = balance.isLoading || settlements.isLoading;
  const isRefetching = balance.isRefetching || settlements.isRefetching;

  function refetchAll() {
    return Promise.all([balance.refetch(), settlements.refetch()]);
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Skeleton width="100%" height={100} radius={16} />
          <Skeleton width="100%" height={64} radius={16} />
          <Skeleton width="100%" height={64} radius={16} />
        </ScrollView>
      </ThemedView>
    );
  }

  if (balance.isError || !balance.data) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load balances." onRetry={refetchAll} />
      </ThemedView>
    );
  }

  const data = balance.data;
  const myBalance = data.balances.find((b) => b.user_id === user?.id);
  const myBalanceAmount = myBalance ? computeNetBalance(myBalance) : 0;

  function handleSettle(suggestion: SuggestedSettlement) {
    createSettlement.mutate(
      { from_user: suggestion.from_id, to_user: suggestion.to_id, amount: suggestion.amount.toFixed(2) },
      {
        onSuccess: () => showToast('Settlement recorded'),
        onError: () => showToast("Couldn't record that settlement."),
      }
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
        <BalanceSummaryCard balance={myBalanceAmount} />

        <View style={styles.section}>
          <SectionHeader title="Member balances" />
          <Card style={{ gap: Spacing.three }}>
            {data.balances.map((member) => {
              const netAmount = computeNetBalance(member);
              const isOwed = netAmount >= 0;
              return (
                <View key={member.user_id} style={styles.balanceRow}>
                  <View style={styles.balanceLeft}>
                    <MemberAvatar name={member.nickname || member.username} size={32} />
                    <View>
                      <ThemedText type="smallBold" numberOfLines={1}>
                        {member.nickname || member.username}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        Paid {formatCurrency(member.paid, currency)} · Owes{' '}
                        {formatCurrency(member.owes, currency)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText
                    type="smallBold"
                    style={{ color: Math.abs(netAmount) < 0.005 ? theme.textSecondary : isOwed ? theme.success : theme.danger }}>
                    {formatCurrency(Math.abs(netAmount), currency)}
                  </ThemedText>
                </View>
              );
            })}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Suggested settlements" />
          {data.suggested_settlements.length === 0 ? (
            <Card>
              <EmptyState icon="checkmark-circle-outline" title="Everyone is settled up" />
            </Card>
          ) : (
            <View style={{ gap: Spacing.two }}>
              {data.suggested_settlements.map((suggestion, index) => (
                <SettlementSuggestionItem
                  key={`${suggestion.from_id}-${suggestion.to_id}-${index}`}
                  suggestion={suggestion}
                  canSettle={suggestion.from_id === user?.id || suggestion.to_id === user?.id}
                  isSettling={createSettlement.isPending}
                  onSettle={() => handleSettle(suggestion)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Settlement history" />
          {(settlements.data ?? []).length === 0 ? (
            <Card>
              <EmptyState icon="time-outline" title="No settlements recorded yet" />
            </Card>
          ) : (
            <View style={{ gap: Spacing.two }}>
              {(settlements.data ?? []).map((settlement) => (
                <ThemedView key={settlement.id} type="backgroundElement" style={styles.historyRow}>
                  <ThemedText type="small">
                    <ThemedText type="smallBold">{settlement.from_user_name}</ThemedText> paid{' '}
                    <ThemedText type="smallBold">{settlement.to_user_name}</ThemedText>
                  </ThemedText>
                  <ThemedText type="smallBold">{formatCurrency(settlement.amount, currency)}</ThemedText>
                </ThemedView>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  section: {
    gap: Spacing.two,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
