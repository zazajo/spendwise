import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryListItem } from '@/components/category-list-item';
import { CategoryListSkeleton } from '@/components/category-list-skeleton';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Fab } from '@/components/fab';
import { SectionHeader } from '@/components/section-header';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { Category } from '@/types/category';

export default function CategoriesListScreen() {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);
  const [showArchived, setShowArchived] = useState(false);

  const params = useMemo(
    () => ({ search: search || undefined, is_active: !showArchived }),
    [search, showArchived]
  );

  const { data, isLoading, isError, isRefetching, refetch } = useCategories(params);
  const expenseCategories = data?.expense ?? [];
  const incomeCategories = data?.income ?? [];
  const isEmpty = expenseCategories.length === 0 && incomeCategories.length === 0;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <TextField placeholder="Search categories" value={searchInput} onChangeText={setSearchInput} />
        </View>
        <View style={styles.toggleRow}>
          <ToggleChip label="Active" active={!showArchived} onPress={() => setShowArchived(false)} />
          <ToggleChip label="Archived" active={showArchived} onPress={() => setShowArchived(true)} />
        </View>
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.content}>
          <CategoryListSkeleton />
        </ScrollView>
      ) : isError ? (
        <ErrorState message="Couldn't load your categories." onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          {isEmpty ? (
            <EmptyState
              icon="pricetags-outline"
              title={showArchived ? 'No archived categories' : 'No categories yet'}
              message={
                showArchived
                  ? 'Categories you archive will show up here.'
                  : 'Create a category to start organizing your expenses and income.'
              }
              actionLabel={showArchived ? undefined : 'Add category'}
              onAction={showArchived ? undefined : () => router.push('/profile/categories/new')}
            />
          ) : (
            <>
              <CategorySection
                title="Expenses"
                categories={expenseCategories}
                onPressCategory={(id) =>
                  router.push({ pathname: '/profile/categories/[id]', params: { id: String(id) } })
                }
              />
              <CategorySection
                title="Income"
                categories={incomeCategories}
                onPressCategory={(id) =>
                  router.push({ pathname: '/profile/categories/[id]', params: { id: String(id) } })
                }
              />
            </>
          )}
        </ScrollView>
      )}

      <Fab onPress={() => router.push('/profile/categories/new')} />
    </ThemedView>
  );
}

function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView type={active ? 'backgroundSelected' : 'backgroundElement'} style={styles.toggleChip}>
        <ThemedText type="small" themeColor={active ? 'text' : 'textSecondary'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function CategorySection({
  title,
  categories,
  onPressCategory,
}: {
  title: string;
  categories: Category[];
  onPressCategory: (id: number) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <View style={{ gap: Spacing.two }}>
        {categories.map((category) => (
          <CategoryListItem
            key={category.id}
            category={category}
            onPress={() => onPressCategory(category.id)}
          />
        ))}
      </View>
    </View>
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
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  toggleChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    gap: Spacing.one,
  },
});
