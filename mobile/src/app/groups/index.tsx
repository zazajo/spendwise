import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { GroupCard } from '@/components/groups/group-card';
import { GroupListSkeleton } from '@/components/groups/group-list-skeleton';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Fab } from '@/components/fab';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useGroups } from '@/hooks/use-groups';
import { useTheme } from '@/hooks/use-theme';

export default function GroupsOverviewScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const currency = user?.profile.currency ?? '';
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);

  const params = useMemo(() => ({ search: search || undefined }), [search]);
  const { data, isLoading, isError, isRefetching, refetch } = useGroups(params);
  const groups = data ?? [];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <TextField placeholder="Search groups" value={searchInput} onChangeText={setSearchInput} />
        </View>
        <Pressable
          style={[styles.joinButton, { backgroundColor: theme.backgroundElement }]}
          onPress={() => router.push('/groups/join')}>
          <ThemedText type="smallBold">Join</ThemedText>
        </Pressable>
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.content}>
          <GroupListSkeleton />
        </ScrollView>
      ) : isError ? (
        <ErrorState message="Couldn't load your groups." onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          {groups.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title={search ? 'No groups found' : 'No groups yet'}
              message={
                search
                  ? 'Try a different search.'
                  : 'Create a group to start splitting expenses with friends.'
              }
              actionLabel={search ? undefined : 'Create group'}
              onAction={search ? undefined : () => router.push('/groups/new')}
            />
          ) : (
            <View style={{ gap: Spacing.three }}>
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  currentUserId={user?.id ?? 0}
                  currency={currency}
                  onPress={() =>
                    router.push({ pathname: '/groups/[id]', params: { id: String(group.id) } })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Fab onPress={() => router.push('/groups/new')} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  searchField: {
    flex: 1,
  },
  joinButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
