import { View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ExpenseListItem } from '@/components/expense-list-item';
import { SectionHeader } from '@/components/section-header';
import { Spacing } from '@/constants/theme';
import type { Expense } from '@/types/expense';

type RecentExpensesSectionProps = {
  expenses: Expense[];
  onPressExpense: (id: number) => void;
  onSeeAll: () => void;
  onAddExpense: () => void;
};

export function RecentExpensesSection({
  expenses,
  onPressExpense,
  onSeeAll,
  onAddExpense,
}: RecentExpensesSectionProps) {
  return (
    <View>
      <SectionHeader title="Recent expenses" actionLabel="See all" onAction={onSeeAll} />
      {expenses.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No expenses yet"
          message="Start tracking your spending by adding your first expense."
          actionLabel="Add expense"
          onAction={onAddExpense}
        />
      ) : (
        <View style={{ gap: Spacing.two }}>
          {expenses.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              onPress={() => onPressExpense(expense.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
