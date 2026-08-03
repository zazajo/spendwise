import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ColorPicker } from '@/components/color-picker';
import { FormActions } from '@/components/form-actions';
import { IconPicker } from '@/components/icon-picker';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { categoryFormSchema, type CategoryFormValues } from '@/types/category';

type CategoryFormProps = {
  defaultValues: CategoryFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: boolean;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
};

const TYPE_OPTIONS: { value: CategoryFormValues['category_type']; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

export function CategoryForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const color = watch('color');
  const icon = watch('icon') as keyof typeof Ionicons.glyphMap;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <View style={styles.field}>
        <ThemedText type="smallBold">Type</ThemedText>
        <Controller
          control={control}
          name="category_type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {TYPE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  style={[styles.chip, value === option.value && { backgroundColor: color }]}>
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

      <View style={styles.pickerRow}>
        <View style={styles.field}>
          <ThemedText type="smallBold">Color</ThemedText>
          <Pressable style={styles.colorPreview} onPress={() => setColorPickerOpen(true)}>
            <View style={[styles.colorSwatch, { backgroundColor: color }]} />
            <ThemedText type="small">Change</ThemedText>
          </Pressable>
          {errors.color ? (
            <ThemedText type="small" themeColor="danger">
              {errors.color.message}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Icon</ThemedText>
          <Pressable style={styles.colorPreview} onPress={() => setIconPickerOpen(true)}>
            <View style={[styles.iconPreview, { backgroundColor: color }]}>
              <Ionicons name={icon} size={18} color="#ffffff" />
            </View>
            <ThemedText type="small">Change</ThemedText>
          </Pressable>
          {errors.icon ? (
            <ThemedText type="small" themeColor="danger">
              {errors.icon.message}
            </ThemedText>
          ) : null}
        </View>
      </View>

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
        submitColor={color}
      />

      <ColorPicker
        visible={colorPickerOpen}
        selectedColor={color}
        onSelect={(nextColor) => {
          setValue('color', nextColor);
          setColorPickerOpen(false);
        }}
        onClose={() => setColorPickerOpen(false)}
      />
      <IconPicker
        visible={iconPickerOpen}
        color={color}
        selectedIcon={icon}
        onSelect={(nextIcon) => {
          setValue('icon', nextIcon);
          setIconPickerOpen(false);
        }}
        onClose={() => setIconPickerOpen(false)}
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
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
