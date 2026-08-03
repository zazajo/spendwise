import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { RecurringCard } from '@/components/recurring/recurring-card';
import { RecurringListSkeleton } from '@/components/recurring/recurring-list-skeleton';
import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useExpenseCategories } from '@/hooks/use-expense-categories';
import { useRecurringBatchAction } from '@/hooks/use-recurring-batch-action';
import { useRecurringExpenses } from '@/hooks/use-recurring-expenses';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import {
  RECURRING_FREQUENCIES,
  getRecurringLifecycleStatus,
  type RecurringExpense,
  type RecurringFrequency,
  type RecurringLifecycleStatus,
  type RecurringSortKey,
} from '@/types/recurring';
import { RECURRING_STATUS_LABEL } from '@/utils/recurring';

const STATUS_OPTIONS: RecurringLifecycleStatus[] = ['active', 'paused', 'completed'];

const SORT_OPTIONS: { value: RecurringSortKey; label: string }[] = [
  { value: 'next_occurrence', label: 'Next due date' },
  { value: 'amount', label: 'Amount' },
  { value: '-created_at', label: 'Recently created' },
];

function sortItems(items: RecurringExpense[], sort: RecurringSortKey): RecurringExpense[] {
  const copy = [...items];
  switch (sort) {
    case 'next_occurrence':
      return copy.sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));
    case 'amount':
      return copy.sort((a, b) => Number(b.amount) - Number(a.amount));
    case '-created_at':
      return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export default function RecurringListScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const currency = user?.profile.currency ?? '';
  const params = useLocalSearchParams<{ status?: RecurringLifecycleStatus }>();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);

  const [status, setStatus] = useState<RecurringLifecycleStatus | null>(params.status ?? null);
  const [frequency, setFrequency] = useState<RecurringFrequency | null>(null);
  const [category, setCategory] = useState<number | null>(null);
  const [sort, setSort] = useState<RecurringSortKey>('next_occurrence');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<RecurringLifecycleStatus | null>(status);
  const [draftFrequency, setDraftFrequency] = useState<RecurringFrequency | null>(frequency);
  const [draftCategory, setDraftCategory] = useState<number | null>(category);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);
  const batchAction = useRecurringBatchAction();

  const { data: categories } = useExpenseCategories();

  const backendParams = useMemo(
    () => ({
      search: search || undefined,
      category: category ?? undefined,
      frequency: frequency ?? undefined,
    }),
    [search, category, frequency]
  );

  const { data, isLoading, isError, isRefetching, refetch } = useRecurringExpenses(backendParams);

  const categoryLookup = useMemo(() => {
    const map = new Map<number, { color: string; icon: string }>();
    for (const c of categories ?? []) map.set(c.id, { color: c.color, icon: c.icon });
    return map;
  }, [categories]);

  const items = useMemo(() => {
    const base = data ?? [];
    const filtered = status ? base.filter((item) => getRecurringLifecycleStatus(item) === status) : base;
    return sortItems(filtered, sort);
  }, [data, status, sort]);

  const categoryOptions: SelectOption[] = [
    { value: null, label: 'All categories' },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name, color: c.color })),
  ];

  const activeFilterCount = (status ? 1 : 0) + (frequency ? 1 : 0) + (category ? 1 : 0);

  function openFilters() {
    setDraftStatus(status);
    setDraftFrequency(frequency);
    setDraftCategory(category);
    setFiltersOpen(true);
  }

  function applyFilters() {
    setStatus(draftStatus);
    setFrequency(draftFrequency);
    setCategory(draftCategory);
    setFiltersOpen(false);
  }

  function resetFilters() {
    setDraftStatus(null);
    setDraftFrequency(null);
    setDraftCategory(null);
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function runBatchAction(action: 'activate' | 'deactivate' | 'delete') {
    batchAction.mutate(
      { recurring_expense_ids: Array.from(selectedIds), action },
      {
        onSuccess: () => {
          showToast(
            action === 'activate' ? 'Activated' : action === 'deactivate' ? 'Deactivated' : 'Deleted'
          );
          exitSelectionMode();
          setConfirmBatchDelete(false);
        },
      }
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Recurring Expenses' }} />

      {selectionMode ? (
        <View style={styles.selectionBar}>
          <ThemedText type="smallBold">{selectedIds.size} selected</ThemedText>
          <Pressable onPress={exitSelectionMode} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="danger">
              Cancel
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <View style={styles.searchField}>
              <TextField
                placeholder="Search recurring expenses"
                value={searchInput}
                onChangeText={setSearchInput}
              />
            </View>
            <Pressable
              style={[styles.toolbarButton, { backgroundColor: theme.backgroundElement }]}
              onPress={openFilters}>
              <ThemedText type="smallBold">
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSort(option.value)}
                style={[
                  styles.sortChip,
                  { backgroundColor: theme.backgroundElement },
                  sort === option.value && { backgroundColor: theme.primary },
                ]}>
                <ThemedText
                  type="small"
                  style={sort === option.value ? styles.sortChipTextSelected : undefined}>
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {isLoading ? (
        <View style={styles.listContent}>
          <RecurringListSkeleton />
        </View>
      ) : isError ? (
        <ErrorState message="Couldn't load recurring expenses." onRetry={refetch} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <RecurringCard
              recurring={item}
              currency={currency}
              categoryColor={categoryLookup.get(item.category)?.color}
              categoryIcon={categoryLookup.get(item.category)?.icon}
              selectionMode={selectionMode}
              selected={selectedIds.has(item.id)}
              onPress={() => {
                if (selectionMode) {
                  toggleSelected(item.id);
                } else {
                  router.push({ pathname: '/profile/recurring/[id]', params: { id: String(item.id) } });
                }
              }}
              onLongPress={() => {
                if (!selectionMode) setSelectionMode(true);
                toggleSelected(item.id);
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          ListEmptyComponent={
            <EmptyState
              icon="repeat-outline"
              title="No recurring expenses found"
              message="Try adjusting your search or filters."
            />
          }
        />
      )}

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
              <ThemedText type="smallBold">Status</ThemedText>
              <View style={styles.chipRow}>
                {STATUS_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setDraftStatus(draftStatus === option ? null : option)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundElement },
                      draftStatus === option && { backgroundColor: theme.primary },
                    ]}>
                    <ThemedText
                      type="small"
                      style={draftStatus === option ? styles.chipTextSelected : undefined}>
                      {RECURRING_STATUS_LABEL[option]}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText type="smallBold">Frequency</ThemedText>
              <View style={styles.chipRow}>
                {RECURRING_FREQUENCIES.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      setDraftFrequency(draftFrequency === option.value ? null : option.value)
                    }
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundElement },
                      draftFrequency === option.value && { backgroundColor: theme.primary },
                    ]}>
                    <ThemedText
                      type="small"
                      style={draftFrequency === option.value ? styles.chipTextSelected : undefined}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

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
          setDraftCategory(value);
          setCategoryPickerOpen(false);
        }}
        onClose={() => setCategoryPickerOpen(false)}
      />

      {selectionMode && selectedIds.size > 0 ? (
        <View style={[styles.batchBar, { backgroundColor: theme.backgroundElement }]}>
          <Pressable
            disabled={batchAction.isPending}
            style={styles.batchButton}
            onPress={() => runBatchAction('activate')}>
            <Ionicons name="play-outline" size={18} color={theme.success} />
            <ThemedText type="small" style={{ color: theme.success }}>
              Activate
            </ThemedText>
          </Pressable>
          <Pressable
            disabled={batchAction.isPending}
            style={styles.batchButton}
            onPress={() => runBatchAction('deactivate')}>
            <Ionicons name="pause-outline" size={18} color={theme.warning} />
            <ThemedText type="small" style={{ color: theme.warning }}>
              Deactivate
            </ThemedText>
          </Pressable>
          <Pressable
            disabled={batchAction.isPending}
            style={styles.batchButton}
            onPress={() => setConfirmBatchDelete(true)}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <ThemedText type="small" style={{ color: theme.danger }}>
              Delete
            </ThemedText>
          </Pressable>
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirmBatchDelete}
        title="Delete recurring expenses"
        message={`This can't be undone. Delete ${selectedIds.size} recurring expense${selectedIds.size === 1 ? '' : 's'}?`}
        confirmLabel="Delete"
        destructive
        loading={batchAction.isPending}
        onCancel={() => setConfirmBatchDelete(false)}
        onConfirm={() => runBatchAction('delete')}
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
  toolbarButton: {
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  batchBar: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: BottomTabInset + Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: Radius.large,
    paddingVertical: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  sortChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  sortChipTextSelected: {
    color: '#ffffff',
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  chipTextSelected: {
    color: '#ffffff',
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
