import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ParticipantSplitRow } from '@/components/groups/participant-split-row';
import { SplitTypeSelector } from '@/components/groups/split-type-selector';
import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Group, GroupExpenseFormValues } from '@/types/group';
import { groupExpenseFormSchema } from '@/types/group';
import { computeEqualSplits, validateSplits } from '@/utils/group-splits';
import { memberDisplayName } from '@/utils/group';

type GroupExpenseFormProps = {
  group: Group;
  currency: string;
  defaultValues: GroupExpenseFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: boolean;
  onCancel: () => void;
  onSubmit: (values: GroupExpenseFormValues) => void;
};

export function GroupExpenseForm({
  group,
  currency,
  defaultValues,
  submitLabel,
  isSubmitting,
  submitError,
  onCancel,
  onSubmit,
}: GroupExpenseFormProps) {
  const theme = useTheme();
  const [paidByPickerOpen, setPaidByPickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupExpenseFormValues>({
    resolver: zodResolver(groupExpenseFormSchema),
    defaultValues,
  });

  const amount = watch('amount');
  const splitType = watch('split_type');
  const participantIds = watch('participantIds');
  const splitInputs = watch('splitInputs');
  const paidBy = watch('paid_by');

  const paidByOptions: SelectOption[] = group.members.map((member) => ({
    value: member.user,
    label: memberDisplayName(member),
  }));
  const paidByLabel = paidByOptions.find((option) => option.value === paidBy)?.label ?? 'Select payer';

  const equalPreview = useMemo(() => {
    if (splitType !== 'equal' || participantIds.length === 0) return {};
    const amountValue = Number(amount) || 0;
    return Object.fromEntries(
      computeEqualSplits(amountValue, participantIds).map((split) => [split.user, split.amount])
    );
  }, [splitType, participantIds, amount]);

  const splitError = useMemo(() => {
    if (splitType === 'equal' || participantIds.length === 0) return null;
    const amountValue = Number(amount) || 0;
    return validateSplits(splitType, amountValue, participantIds, splitInputs);
  }, [splitType, amount, participantIds, splitInputs]);

  function toggleParticipant(userId: number) {
    const next = participantIds.includes(userId)
      ? participantIds.filter((id) => id !== userId)
      : [...participantIds, userId];
    setValue('participantIds', next, { shouldValidate: true });
  }

  function selectAllParticipants() {
    setValue(
      'participantIds',
      group.members.map((member) => member.user),
      { shouldValidate: true }
    );
  }

  function selectNoParticipants() {
    setValue('participantIds', [], { shouldValidate: true });
  }

  function submitHandler(values: GroupExpenseFormValues) {
    if (splitError) return;
    onSubmit(values);
  }

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
        <ThemedText type="smallBold">Paid by</ThemedText>
        <Pressable
          style={[styles.pickerTrigger, { backgroundColor: theme.backgroundElement }]}
          onPress={() => setPaidByPickerOpen(true)}>
          <ThemedText>{paidByLabel}</ThemedText>
        </Pressable>
        {errors.paid_by ? (
          <ThemedText type="small" themeColor="danger">
            {errors.paid_by.message}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Split</ThemedText>
        <Controller
          control={control}
          name="split_type"
          render={({ field: { onChange, value } }) => (
            <SplitTypeSelector value={value} onChange={onChange} />
          )}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.participantsHeader}>
          <ThemedText type="smallBold">Participants</ThemedText>
          <View style={styles.quickActions}>
            <Pressable onPress={selectAllParticipants} hitSlop={6}>
              <ThemedText type="small" style={{ color: theme.primary }}>
                All
              </ThemedText>
            </Pressable>
            <Pressable onPress={selectNoParticipants} hitSlop={6}>
              <ThemedText type="small" style={{ color: theme.primary }}>
                None
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {group.members.map((member) => (
          <ParticipantSplitRow
            key={member.id}
            member={member}
            selected={participantIds.includes(member.user)}
            onToggle={() => toggleParticipant(member.user)}
            splitType={splitType}
            value={splitInputs[member.user] ?? ''}
            onChangeValue={(value) =>
              setValue('splitInputs', { ...splitInputs, [member.user]: value }, { shouldValidate: true })
            }
            computedAmount={equalPreview[member.user]}
            currency={currency}
          />
        ))}

        {errors.participantIds ? (
          <ThemedText type="small" themeColor="danger">
            {errors.participantIds.message}
          </ThemedText>
        ) : splitError ? (
          <ThemedText type="small" themeColor="danger">
            {splitError}
          </ThemedText>
        ) : null}
      </View>

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
          />
        )}
      />

      {submitError ? (
        <ThemedText type="small" themeColor="danger">
          Something went wrong. Please try again.
        </ThemedText>
      ) : null}

      <Pressable
        disabled={isSubmitting || Boolean(splitError)}
        onPress={handleSubmit(submitHandler)}
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: theme.primary },
          (pressed || isSubmitting || splitError) && styles.pressed,
        ]}>
        <ThemedText type="smallBold" style={styles.submitButtonText}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </ThemedText>
      </Pressable>

      <Pressable disabled={isSubmitting} onPress={onCancel} style={styles.cancelButton}>
        <ThemedText type="smallBold">Cancel</ThemedText>
      </Pressable>

      <SelectModal
        visible={paidByPickerOpen}
        title="Paid by"
        options={paidByOptions}
        selectedValue={paidBy}
        onSelect={(value) => {
          if (value !== null) setValue('paid_by', value, { shouldValidate: true });
          setPaidByPickerOpen(false);
        }}
        onClose={() => setPaidByPickerOpen(false)}
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
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.three,
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
    opacity: 0.7,
  },
});
