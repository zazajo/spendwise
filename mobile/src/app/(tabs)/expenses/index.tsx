import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ExpenseListItem } from '@/components/expense-list-item';
import { ExpenseListSkeleton } from '@/components/expense-list-skeleton';
import { Fab } from '@/components/fab';
import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useExpenseCategories } from '@/hooks/use-expense-categories';
import { useExpenses } from '@/hooks/use-expenses';
import { useTheme } from '@/hooks/use-theme';
import type { Expense } from '@/types/expense';

export default function ExpensesListScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const currency = user?.profile.currency ?? '';

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [category, setCategory] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [draftCategory, setDraftCategory] = useState<number | null>(null);
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');

  const { data: categories } = useExpenseCategories();

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: category ?? undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
    [search, category, startDate, endDate]
  );

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses(filters);

  const expenses = useMemo<Expense[]>(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);

  const categoryOptions: SelectOption[] = [
    { value: null, label: 'All categories' },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name, color: c.color })),
  ];

  const activeFilterCount = (category !== null ? 1 : 0) + (startDate || endDate ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || !!search;

  function openFilters() {
    setDraftCategory(category);
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setFiltersOpen(true);
  }

  function applyFilters() {
    setCategory(draftCategory);
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setFiltersOpen(false);
  }

  function resetFilters() {
    setDraftCategory(null);
    setDraftStartDate('');
    setDraftEndDate('');
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Expenses' }} />

      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <TextField placeholder="Search expenses" value={searchInput} onChangeText={setSearchInput} />
        </View>
        <Pressable
          style={[styles.filterButton, { backgroundColor: theme.backgroundElement }]}
          onPress={openFilters}>
          <ThemedText type="smallBold">
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </ThemedText>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          <ExpenseListSkeleton />
        </View>
      ) : isError ? (
        <ErrorState message="Couldn't load expenses." onRetry={refetch} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          renderItem={({ item }) => (
            <ExpenseListItem
              expense={item}
              currency={currency}
              onPress={() =>
                router.push({ pathname: '/expenses/[id]', params: { id: String(item.id) } })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={hasActiveFilters ? 'No expenses found' : 'No expenses yet'}
              message={
                hasActiveFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Start tracking your spending by adding your first expense.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Add expense'}
              onAction={hasActiveFilters ? undefined : () => router.push('/expenses/new')}
            />
          }
        />
      )}

      <Fab onPress={() => router.push('/expenses/new')} />

      <Modal
        visible={filtersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.filterBackdrop}>
          <ThemedView type="background" style={styles.filterCard}>
            <ThemedText type="smallBold" style={styles.filterTitle}>
              Filters
            </ThemedText>

            <View style={styles.field}>
              <ThemedText type="smallBold">Category</ThemedText>
              <Pressable
                style={[styles.pickerTrigger, { backgroundColor: theme.backgroundElement }]}
                onPress={() => setCategoryPickerOpen(true)}>
                <ThemedText>
                  {categoryOptions.find((o) => o.value === draftCategory)?.label ?? 'All categories'}
                </ThemedText>
              </Pressable>
            </View>

            <TextField
              label="From (YYYY-MM-DD)"
              placeholder="2026-01-01"
              value={draftStartDate}
              onChangeText={setDraftStartDate}
            />
            <TextField
              label="To (YYYY-MM-DD)"
              placeholder="2026-12-31"
              value={draftEndDate}
              onChangeText={setDraftEndDate}
            />

            <View style={styles.filterActions}>
              <Pressable style={styles.filterSecondaryButton} onPress={resetFilters}>
                <ThemedText type="smallBold">Reset</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.filterPrimaryButton, { backgroundColor: theme.primary }]}
                onPress={applyFilters}>
                <ThemedText type="smallBold" style={styles.filterPrimaryButtonText}>
                  Apply
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <SelectModal
        visible={categoryPickerOpen}
        title="Category"
        options={categoryOptions}
        selectedValue={draftCategory}
        onSelect={(value) => {
          if (typeof value !== 'string') setDraftCategory(value);
          setCategoryPickerOpen(false);
        }}
        onClose={() => setCategoryPickerOpen(false)}
      />
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  searchField: {
    flex: 1,
  },
  filterButton: {
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  field: {
    gap: Spacing.one,
  },
  pickerTrigger: {
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  filterBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  filterCard: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  filterTitle: {
    fontSize: 18,
  },
  filterActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'flex-end',
    marginTop: Spacing.two,
  },
  filterSecondaryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
  },
  filterPrimaryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
  },
  filterPrimaryButtonText: {
    color: '#ffffff',
  },
});
