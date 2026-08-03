import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  REPORT_TYPE_LABEL,
  SCHEDULED_FREQUENCY_LABEL,
  scheduledReportFormSchema,
  type ReportType,
  type ScheduledReportFormValues,
  type ScheduledReportFrequency,
} from '@/types/report';

const TYPE_OPTIONS: ReportType[] = ['monthly_summary', 'category_analysis', 'budget_variance'];
const FORMAT_OPTIONS: { value: 'json' | 'csv'; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
];
const FREQUENCY_OPTIONS: ScheduledReportFrequency[] = ['daily', 'weekly', 'monthly'];

type ScheduledReportFormProps = {
  defaultValues: ScheduledReportFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: boolean;
  onSubmit: (values: ScheduledReportFormValues) => void;
  onCancel: () => void;
};

export function ScheduledReportForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: ScheduledReportFormProps) {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduledReportFormValues>({
    resolver: zodResolver(scheduledReportFormSchema),
    defaultValues,
  });

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
        <ThemedText type="smallBold">Report type</ThemedText>
        <Controller
          control={control}
          name="report_type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {TYPE_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.backgroundElement },
                    value === option && { backgroundColor: theme.primary },
                  ]}>
                  <ThemedText type="small" style={value === option ? styles.chipTextSelected : undefined}>
                    {REPORT_TYPE_LABEL[option]}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Frequency</ThemedText>
        <Controller
          control={control}
          name="frequency"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {FREQUENCY_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.backgroundElement },
                    value === option && { backgroundColor: theme.primary },
                  ]}>
                  <ThemedText type="small" style={value === option ? styles.chipTextSelected : undefined}>
                    {SCHEDULED_FREQUENCY_LABEL[option]}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        />
      </View>

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

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />

      {submitError ? (
        <ThemedText type="small" themeColor="danger">
          Something went wrong. Please try again.
        </ThemedText>
      ) : null}

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" style={styles.submitButtonText}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </ThemedText>
      </Pressable>

      <Pressable disabled={isSubmitting} onPress={onCancel} style={styles.cancelButton}>
        <ThemedText type="smallBold">Cancel</ThemedText>
      </Pressable>
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
