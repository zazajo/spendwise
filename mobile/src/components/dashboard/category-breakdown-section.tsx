import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ProgressBar } from '@/components/progress-bar';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { CategorySpend } from '@/types/expense';
import { formatCurrency } from '@/utils/format';

type CategoryBreakdownSectionProps = {
  categories: CategorySpend[];
  currency: string;
};

export function CategoryBreakdownSection({ categories, currency }: CategoryBreakdownSectionProps) {
  return (
    <View>
      <SectionHeader title="Spending by category" />
      {categories.length === 0 ? (
        <Card>
          <EmptyState icon="pie-chart-outline" title="Nothing to break down yet" />
        </Card>
      ) : (
        <Card style={styles.card}>
          {categories.slice(0, 5).map((category) => (
            <View key={String(category.id)} style={styles.row}>
              <View style={styles.labelRow}>
                <View style={[styles.dot, { backgroundColor: category.color }]} />
                <ThemedText type="small" style={styles.name} numberOfLines={1}>
                  {category.name}
                </ThemedText>
                <ThemedText type="smallBold">{formatCurrency(category.total, currency)}</ThemedText>
              </View>
              <ProgressBar progress={category.percentage} color={category.color} height={6} />
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  row: {
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
  },
});
