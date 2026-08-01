import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/use-expense-categories';
import { usePaymentMethods } from '@/hooks/use-payment-methods';
import { expenseFormSchema, type ExpenseFormValues, type PaymentStatus } from '@/types/expense';

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

type ExpenseFormProps = {
  mode: 'create' | 'edit';
  defaultValues: ExpenseFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: boolean;
  onSubmit: (values: ExpenseFormValues) => void;
};

export function ExpenseForm({
  mode,
  defaultValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
}: ExpenseFormProps) {
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
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
  });

  const categoryId = watch('category');
  const paymentMethodId = watch('payment_method');

  const categoryOptions: SelectOption[] = [
    { value: null, label: 'No category' },
    ...(categories ?? []).map((category) => ({
      value: category.id,
      label: category.name,
      color: category.color,
    })),
  ];
  const paymentMethodOptions: SelectOption[] = [
    { value: null, label: 'None' },
    ...(paymentMethods ?? []).map((method) => ({ value: method.id, label: method.name })),
  ];

  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === categoryId)?.label ?? 'No category';
  const selectedPaymentMethodLabel =
    paymentMethodOptions.find((option) => option.value === paymentMethodId)?.label ?? 'None';

  return (
    <ScrollView contentContainerStyle={styles.content}>
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
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Description"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.description?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Date"
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.date?.message}
          />
        )}
      />

      <View style={styles.field}>
        <ThemedText type="smallBold">Category</ThemedText>
        <Pressable style={styles.pickerTrigger} onPress={() => setCategoryPickerOpen(true)}>
          <ThemedText>{selectedCategoryLabel}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Payment method</ThemedText>
        <Pressable style={styles.pickerTrigger} onPress={() => setPaymentMethodPickerOpen(true)}>
          <ThemedText>{selectedPaymentMethodLabel}</ThemedText>
        </Pressable>
      </View>

      {mode === 'edit' ? (
        <View style={styles.field}>
          <ThemedText type="smallBold">Status</ThemedText>
          <Controller
            control={control}
            name="payment_status"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {PAYMENT_STATUSES.map((status) => (
                  <Pressable
                    key={status.value}
                    onPress={() => onChange(status.value)}
                    style={[styles.chip, value === status.value && styles.chipSelected]}>
                    <ThemedText
                      type="small"
                      style={value === status.value ? styles.chipTextSelected : undefined}>
                      {status.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>
      ) : null}

      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Location (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.location?.message}
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
        <ThemedText type="small" style={styles.formError}>
          Something went wrong. Please try again.
        </ThemedText>
      ) : null}

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.submitButtonText}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </ThemedText>
      </Pressable>

      <SelectModal
        visible={categoryPickerOpen}
        title="Category"
        options={categoryOptions}
        selectedValue={categoryId}
        onSelect={(value) => {
          setValue('category', value);
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
          setValue('payment_method', value);
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
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
  chipSelected: {
    backgroundColor: '#3c87f7',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
  formError: {
    color: '#E5484D',
  },
});
