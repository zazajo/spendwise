import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ExpenseListItem } from '@/components/expense-list-item';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_CATEGORY_ICON } from '@/constants/category-options';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useArchiveCategory } from '@/hooks/use-archive-category';
import { useCategory } from '@/hooks/use-category';
import { useCategoryExpenses } from '@/hooks/use-category-expenses';
import { useRestoreCategory } from '@/hooks/use-restore-category';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);
  const currency = useCurrency();
  const theme = useTheme();

  const { data: category, isLoading, isError, refetch } = useCategory(categoryId);
  const { data: relatedExpenses = [] } = useCategoryExpenses(categoryId);
  const archiveCategory = useArchiveCategory();
  const restoreCategory = useRestoreCategory();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !category) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ErrorState message="Couldn't load this category." onRetry={refetch} />
      </ThemedView>
    );
  }

  const iconName = (category.icon || DEFAULT_CATEGORY_ICON) as keyof typeof Ionicons.glyphMap;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: category.color }]}>
            <Ionicons name={iconName} size={28} color="#ffffff" />
          </View>
          <ThemedText type="title" style={styles.name}>
            {category.name}
          </ThemedText>
          <View style={styles.badgeRow}>
            <Badge label={category.category_type === 'expense' ? 'Expense' : 'Income'} />
            {category.is_default ? <Badge label="Default" /> : null}
            {!category.is_active ? <Badge label="Archived" /> : null}
          </View>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Transactions
            </ThemedText>
            <ThemedText type="smallBold">{category.expense_count}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Total spent
            </ThemedText>
            <ThemedText type="smallBold">{formatCurrency(category.total_spent, currency)}</ThemedText>
          </View>
        </Card>

        <View style={styles.actions}>
          <Pressable
            style={[styles.editButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() =>
              router.push({ pathname: '/profile/categories/edit/[id]', params: { id: String(categoryId) } })
            }>
            <ThemedText type="smallBold">Edit</ThemedText>
          </Pressable>

          {category.is_active ? (
            <Pressable
              style={[styles.archiveButton, { backgroundColor: theme.danger }]}
              onPress={() => setConfirmOpen(true)}>
              <ThemedText type="smallBold" style={styles.actionButtonText}>
                Archive
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              disabled={restoreCategory.isPending}
              style={[styles.restoreButton, { backgroundColor: theme.success }]}
              onPress={() => {
                restoreCategory.mutate(categoryId, {
                  onSuccess: () => showToast('Category restored'),
                });
              }}>
              <ThemedText type="smallBold" style={styles.actionButtonText}>
                {restoreCategory.isPending ? 'Restoring…' : 'Restore'}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <View>
          <SectionHeader title="Recent expenses" />
          {relatedExpenses.length === 0 ? (
            <EmptyState icon="receipt-outline" title="No expenses in this category yet" />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {relatedExpenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  onPress={() =>
                    router.push({ pathname: '/expenses/[id]', params: { id: String(expense.id) } })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmOpen}
        title="Archive category"
        message="This hides the category from your active list. You can restore it later from the Archived tab."
        confirmLabel="Archive"
        destructive
        loading={archiveCategory.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          archiveCategory.mutate(categoryId, {
            onSuccess: () => {
              showToast('Category archived');
              setConfirmOpen(false);
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}

function Badge({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  statsCard: {
    gap: Spacing.two,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  editButton: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  archiveButton: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  restoreButton: {
    flex: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
  },
});
