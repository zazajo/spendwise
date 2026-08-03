import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ReportCard } from '@/components/reports/report-card';
import { ReportListSkeleton } from '@/components/reports/report-list-skeleton';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useReports } from '@/hooks/use-reports';
import { useTheme } from '@/hooks/use-theme';
import { REPORT_TYPE_LABEL, type Report, type ReportType } from '@/types/reports';

const TYPE_OPTIONS: ReportType[] = ['monthly_summary', 'category_analysis', 'budget_variance'];

type SortOrder = 'newest' | 'oldest';

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export default function FinancialHistoryScreen() {
  const theme = useTheme();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);

  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftType, setDraftType] = useState<ReportType | null>(reportType);
  const [draftFrom, setDraftFrom] = useState(dateFrom);
  const [draftTo, setDraftTo] = useState(dateTo);

  const backendParams = useMemo(
    () => ({
      search: search || undefined,
      report_type: reportType ?? undefined,
    }),
    [search, reportType]
  );

  const { data, isLoading, isError, isRefetching, refetch } = useReports(backendParams);

  const items = useMemo(() => {
    let base = data ?? [];
    if (dateFrom) {
      const from = parseLocalDate(dateFrom);
      base = base.filter((report) => new Date(report.created_at) >= from);
    }
    if (dateTo) {
      const to = parseLocalDate(dateTo);
      to.setHours(23, 59, 59, 999);
      base = base.filter((report) => new Date(report.created_at) <= to);
    }
    const copy = [...base];
    copy.sort((a, b) =>
      sort === 'newest'
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at)
    );
    return copy;
  }, [data, dateFrom, dateTo, sort]);

  const activeFilterCount = (reportType ? 1 : 0) + (dateFrom || dateTo ? 1 : 0);

  function openFilters() {
    setDraftType(reportType);
    setDraftFrom(dateFrom);
    setDraftTo(dateTo);
    setFiltersOpen(true);
  }

  function applyFilters() {
    setReportType(draftType);
    setDateFrom(draftFrom);
    setDateTo(draftTo);
    setFiltersOpen(false);
  }

  function resetFilters() {
    setDraftType(null);
    setDraftFrom('');
    setDraftTo('');
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Financial History' }} />

      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <TextField placeholder="Search reports" value={searchInput} onChangeText={setSearchInput} />
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
        {(['newest', 'oldest'] as SortOrder[]).map((option) => (
          <Pressable
            key={option}
            onPress={() => setSort(option)}
            style={[
              styles.sortChip,
              { backgroundColor: theme.backgroundElement },
              sort === option && { backgroundColor: theme.primary },
            ]}>
            <ThemedText type="small" style={sort === option ? styles.sortChipTextSelected : undefined}>
              {option === 'newest' ? 'Newest first' : 'Oldest first'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          <ReportListSkeleton />
        </View>
      ) : isError ? (
        <ErrorState message="Couldn't load reports." onRetry={refetch} />
      ) : (
        <FlatList<Report>
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onPress={() =>
                router.push({ pathname: '/profile/reports/[id]', params: { id: String(item.id) } })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No reports found"
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
              <ThemedText type="smallBold">Report type</ThemedText>
              <View style={styles.chipRow}>
                {TYPE_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setDraftType(draftType === option ? null : option)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundElement },
                      draftType === option && { backgroundColor: theme.primary },
                    ]}>
                    <ThemedText
                      type="small"
                      style={draftType === option ? styles.chipTextSelected : undefined}>
                      {REPORT_TYPE_LABEL[option]}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextField
              label="From (YYYY-MM-DD)"
              placeholder="2026-01-01"
              value={draftFrom}
              onChangeText={setDraftFrom}
            />
            <TextField
              label="To (YYYY-MM-DD)"
              placeholder="2026-12-31"
              value={draftTo}
              onChangeText={setDraftTo}
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
