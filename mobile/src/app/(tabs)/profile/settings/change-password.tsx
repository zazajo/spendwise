import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { z } from 'zod';

import { FormActions } from '@/components/form-actions';
import { PasswordField } from '@/components/password-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useChangePassword } from '@/hooks/use-change-password';
import { showToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/utils/api-error';

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: 'New password must be different from your current one',
    path: ['new_password'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      showToast('Password changed');
      router.back();
    } catch (error) {
      // The server owns the rules the client can't check: whether the current
      // password is right, and Django's own strength validators.
      const message = getApiErrorMessage(error, "Couldn't change your password.");
      const field = message.toLowerCase().includes('current') ? 'current_password' : 'new_password';
      setError(field, { message });
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Change Password', presentation: 'modal' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="small" themeColor="textSecondary">
          You&apos;ll stay signed in on this device. Other devices stay signed in too - use
          &quot;Log out of all devices&quot; in Settings to end those.
        </ThemedText>

        <Controller
          control={control}
          name="current_password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="Current password"
              autoComplete="current-password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.current_password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="new_password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="New password"
              autoComplete="new-password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.new_password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirm_password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirm_password?.message}
            />
          )}
        />

        <FormActions
          submitLabel="Change password"
          isSubmitting={changePassword.isPending}
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.back()}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
