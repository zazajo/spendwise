import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useGenerateReport } from '@/hooks/use-generate-report';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import {
  generateReportFormSchema,
  REPORT_TYPE_LABEL,
  type GenerateReportFormValues,
  type ReportType,
} from '@/types/report';
import { toISODateString } from '@/utils/format';

const TYPE_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'monthly_summary', label: 'Monthly' },
  { value: 'category_analysis', label: 'Category' },
  { value: 'budget_variance', label: 'Budget Variance' },
];

const FORMAT_OPTIONS: { value: 'json' | 'csv'; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
];

const MONTH_OPTIONS: SelectOption[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
].map((label, index) => ({ value: index + 1, label }));

const today = new Date();

const DEFAULT_VALUES: GenerateReportFormValues = {
  report_type: 'monthly_summary',
  name: 'Monthly Summary Report',
  format: 'json',
  year: String(today.getFullYear()),
  month: String(today.getMonth() + 1),
  start_date: toISODateString(new Date(today.getFullYear(), today.getMonth(), 1)),
  end_date: toISODateString(today),
};

export default function GenerateReportScreen() {
  const theme = useTheme();
  const generateReport = useGenerateReport();
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateReportFormValues>({
    resolver: zodResolver(generateReportFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const reportType = watch('report_type');
  const format = watch('format');
  const month = watch('month');

  function applyDatePreset(preset: 'this_month' | 'this_year') {
    if (preset === 'this_month') {
      setValue('start_date', toISODateString(new Date(today.getFullYear(), today.getMonth(), 1)));
      setValue('end_date', toISODateString(today));
    } else {
      setValue('start_date', toISODateString(new Date(today.getFullYear(), 0, 1)));
      setValue('end_date', toISODateString(new Date(today.getFullYear(), 11, 31)));
    }
  }

  function onSubmit(values: GenerateReportFormValues) {
    generateReport.mutate(values, {
      onSuccess: () => {
        showToast('Report generated');
        router.push('/profile/reports/history');
      },
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <ThemedText type="smallBold">Report type</ThemedText>
          <Controller
            control={control}
            name="report_type"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {TYPE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setValue('name', `${REPORT_TYPE_LABEL[option.value]} Report`);
                    }}
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
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Report name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />

        {reportType === 'monthly_summary' || reportType === 'budget_variance' ? (
          <>
            <Controller
              control={control}
              name="year"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Year"
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.year?.message}
                />
              )}
            />
            <View style={styles.field}>
              <ThemedText type="smallBold">Month</ThemedText>
              <Pressable
                style={[styles.pickerTrigger, { backgroundColor: theme.backgroundElement }]}
                onPress={() => setMonthPickerOpen(true)}>
                <ThemedText>{MONTH_OPTIONS.find((o) => o.value === Number(month))?.label ?? 'Select month'}</ThemedText>
              </Pressable>
              {errors.month ? (
                <ThemedText type="small" themeColor="danger">
                  {errors.month.message}
                </ThemedText>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <View style={styles.field}>
              <ThemedText type="smallBold">Date range</ThemedText>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => applyDatePreset('this_month')}
                  style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small">This month</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => applyDatePreset('this_year')}
                  style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small">This year</ThemedText>
                </Pressable>
              </View>
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
                  label="End date"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.end_date?.message}
                />
              )}
            />
          </>
        )}

        <View style={styles.field}>
          <ThemedText type="smallBold">Export format</ThemedText>
          <Controller
            control={control}
            name="format"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {FORMAT_OPTIONS.map((option) => (
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
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          {format === 'csv'
            ? 'CSV reports can be exported as a spreadsheet-ready file.'
            : 'JSON reports can be viewed with full summary statistics in the app.'}
        </ThemedText>

        {generateReport.isError ? (
          <ThemedText type="small" themeColor="danger">
            Something went wrong. Please try again.
          </ThemedText>
        ) : null}

        <Pressable
          disabled={generateReport.isPending}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}>
          {generateReport.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText type="smallBold" style={styles.submitButtonText}>
              Generate report
            </ThemedText>
          )}
        </Pressable>

        <Pressable disabled={generateReport.isPending} onPress={() => router.back()} style={styles.cancelButton}>
          <ThemedText type="smallBold">Cancel</ThemedText>
        </Pressable>
      </ScrollView>

      <SelectModal
        visible={monthPickerOpen}
        title="Month"
        options={MONTH_OPTIONS}
        selectedValue={Number(month)}
        onSelect={(value) => {
          if (value !== null) setValue('month', String(value), { shouldValidate: true });
          setMonthPickerOpen(false);
        }}
        onClose={() => setMonthPickerOpen(false)}
      />
    </ThemedView>
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
  submitButton: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#ffffff',
  },
  cancelButton: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
