import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CURRENCIES } from '@/constants/currencies';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { useUpdateProfileSettings } from '@/hooks/use-update-profile-settings';
import { useUpdateUser } from '@/hooks/use-update-user';

const editProfileSchema = z.object({
  first_name: z.string().max(150).optional(),
  last_name: z.string().max(150).optional(),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  currency: z.string().min(1, 'Pick a currency'),
  monthly_income: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), 'Enter a valid amount'),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const updateProfileSettings = useUpdateProfileSettings();
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);

  const isSubmitting = updateUser.isPending || updateProfileSettings.isPending;
  const isError = updateUser.isError || updateProfileSettings.isError;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      currency: user?.profile.currency ?? 'NGN',
      monthly_income: user?.profile.monthly_income ?? '',
    },
  });

  const currency = watch('currency');
  const currencyOptions: SelectOption[] = CURRENCIES.map((c) => ({ value: c.code, label: c.label }));
  const selectedCurrencyLabel = CURRENCIES.find((c) => c.code === currency)?.label ?? 'Select currency';

  async function onSubmit(values: EditProfileFormValues) {
    await updateUser.mutateAsync({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
    });
    await updateProfileSettings.mutateAsync({
      currency: values.currency,
      monthly_income: values.monthly_income || null,
    });
    showToast('Profile updated');
    router.back();
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Edit Profile', presentation: 'modal' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Controller
          control={control}
          name="first_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="First name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.first_name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="last_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Last name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.last_name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <View style={styles.field}>
          <ThemedText type="smallBold">Currency</ThemedText>
          <Pressable
            style={[styles.pickerTrigger, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setCurrencyPickerOpen(true)}>
            <ThemedText>{selectedCurrencyLabel}</ThemedText>
          </Pressable>
          {errors.currency ? (
            <ThemedText type="small" themeColor="danger">
              {errors.currency.message}
            </ThemedText>
          ) : null}
        </View>

        <Controller
          control={control}
          name="monthly_income"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Monthly income (optional)"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.monthly_income?.message}
            />
          )}
        />

        {isError ? (
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
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </ThemedText>
        </Pressable>

        <Pressable disabled={isSubmitting} onPress={() => router.back()} style={styles.cancelButton}>
          <ThemedText type="smallBold">Cancel</ThemedText>
        </Pressable>
      </ScrollView>

      <SelectModal
        visible={currencyPickerOpen}
        title="Currency"
        options={currencyOptions}
        selectedValue={currency}
        onSelect={(value) => {
          if (typeof value === 'string') setValue('currency', value, { shouldValidate: true });
          setCurrencyPickerOpen(false);
        }}
        onClose={() => setCurrencyPickerOpen(false)}
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
