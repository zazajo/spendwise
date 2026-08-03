import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FormActions } from '@/components/form-actions';
import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/use-expense-categories';
import { useTheme } from '@/hooks/use-theme';
import { BUDGET_PERIODS, budgetFormSchema, type BudgetFormValues } from '@/types/budget';

type BudgetFormProps = {
  defaultValues: BudgetFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: boolean;
  onSubmit: (values: BudgetFormValues) => void;
  onCancel: () => void;
};

export function BudgetForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const theme = useTheme();
  const { data: categories } = useExpenseCategories();
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues,
  });

  const categoryId = watch('category');

  const categoryOptions: SelectOption[] = (categories ?? []).map((category) => ({
    value: category.id,
    label: category.name,
    color: category.color,
  }));
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === categoryId)?.label ?? 'Select category';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <ThemedText type="smallBold">Category</ThemedText>
        <Pressable
          style={[styles.pickerTrigger, { backgroundColor: theme.backgroundElement }]}
          onPress={() => setCategoryPickerOpen(true)}>
          <ThemedText>{selectedCategoryLabel}</ThemedText>
        </Pressable>
        {errors.category ? (
          <ThemedText type="small" themeColor="danger">
            {errors.category.message}
          </ThemedText>
        ) : null}
      </View>

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Budget amount"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.amount?.message}
          />
        )}
      />

      <View style={styles.field}>
        <ThemedText type="smallBold">Period</ThemedText>
        <Controller
          control={control}
          name="period"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {BUDGET_PERIODS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.backgroundElement },
                    value === option.value && { backgroundColor: theme.primary },
                  ]}>
                  <ThemedText
                    type="small"
                    style={value === option.value ? styles.chipTextSelected : undefined}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        />
      </View>

      <Controller
        control={control}
        name="start_date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Start date"
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.start_date?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="end_date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="End date (optional)"
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.end_date?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="alert_threshold"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Alert threshold (%)"
            placeholder="80"
            keyboardType="number-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.alert_threshold?.message}
          />
        )}
      />
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        We&apos;ll flag this budget as a warning once spending crosses this percentage of the total.
      </ThemedText>

      {submitError ? (
        <ThemedText type="small" themeColor="danger">
          Something went wrong. Please try again.
        </ThemedText>
      ) : null}

      <FormActions
        submitLabel={submitLabel}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />

      <SelectModal
        visible={categoryPickerOpen}
        title="Category"
        options={categoryOptions}
        selectedValue={categoryId}
        onSelect={(value) => {
          if (typeof value === 'number') setValue('category', value, { shouldValidate: true });
          setCategoryPickerOpen(false);
        }}
        onClose={() => setCategoryPickerOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  pickerTrigger: {
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
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
  hint: {
    marginTop: -Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
});
