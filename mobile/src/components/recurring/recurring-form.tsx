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
import { usePaymentMethods } from '@/hooks/use-payment-methods';
import { useTheme } from '@/hooks/use-theme';
import { RECURRING_FREQUENCIES, recurringFormSchema, type RecurringFormValues } from '@/types/recurring';
import { getIntervalLabel } from '@/utils/recurring';

type RecurringFormProps = {
  defaultValues: RecurringFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: boolean;
  onSubmit: (values: RecurringFormValues) => void;
  onCancel: () => void;
};

export function RecurringForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: RecurringFormProps) {
  const theme = useTheme();
  const { data: categories } = useExpenseCategories();
  const { data: paymentMethods } = usePaymentMethods();
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [paymentMethodPickerOpen, setPaymentMethodPickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues,
  });

  const categoryId = watch('category');
  const paymentMethodId = watch('payment_method');
  const frequency = watch('frequency');
  const watchedInterval = watch('interval');

  const categoryOptions: SelectOption[] = (categories ?? []).map((category) => ({
    value: category.id,
    label: category.name,
    color: category.color,
  }));
  const paymentMethodOptions: SelectOption[] = [
    { value: null, label: 'None' },
    ...(paymentMethods ?? []).map((method) => ({ value: method.id, label: method.name })),
  ];

  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === categoryId)?.label ?? 'Select category';
  const selectedPaymentMethodLabel =
    paymentMethodOptions.find((option) => option.value === paymentMethodId)?.label ?? 'None';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Name"
            placeholder="e.g. Netflix subscription"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.description?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Amount"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.amount?.message}
          />
        )}
      />

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

      <View style={styles.field}>
        <ThemedText type="smallBold">Payment method</ThemedText>
        <Pressable
          style={[styles.pickerTrigger, { backgroundColor: theme.backgroundElement }]}
          onPress={() => setPaymentMethodPickerOpen(true)}>
          <ThemedText>{selectedPaymentMethodLabel}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Frequency</ThemedText>
        <Controller
          control={control}
          name="frequency"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {RECURRING_FREQUENCIES.map((option) => (
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
        name="interval"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Repeat every"
            placeholder="1"
            keyboardType="number-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.interval?.message}
          />
        )}
      />
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        This will repeat: {getIntervalLabel(frequency, Number(watchedInterval) || 1)}
      </ThemedText>

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
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Notes (optional)"
            multiline
            numberOfLines={3}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.notes?.message}
          />
        )}
      />

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
      <SelectModal
        visible={paymentMethodPickerOpen}
        title="Payment method"
        options={paymentMethodOptions}
        selectedValue={paymentMethodId}
        onSelect={(value) => {
          if (typeof value !== 'string') setValue('payment_method', value);
          setPaymentMethodPickerOpen(false);
        }}
        onClose={() => setPaymentMethodPickerOpen(false)}
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
