import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Avatar } from '@/components/avatar';
import { SelectModal, type SelectOption } from '@/components/select-modal';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CURRENCIES } from '@/constants/currencies';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useRemoveAvatar, useUploadAvatar } from '@/hooks/use-update-avatar';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { useUpdateProfileSettings } from '@/hooks/use-update-profile-settings';
import { useUpdateUser } from '@/hooks/use-update-user';
import { getApiErrorMessage } from '@/utils/api-error';

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
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);

  const isSubmitting = updateUser.isPending || updateProfileSettings.isPending;
  const isError = updateUser.isError || updateProfileSettings.isError;
  const isAvatarBusy = uploadAvatar.isPending || removeAvatar.isPending;

  const firstName = user?.first_name?.trim() ?? '';
  const lastName = user?.last_name?.trim() ?? '';
  const initials =
    ((firstName.charAt(0) || user?.username?.charAt(0) || '?') + lastName.charAt(0)).toUpperCase();

  async function onPickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Photo access is needed to pick a picture');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      // Avatars render at 76pt; full-resolution photos would be a slow upload
      // for pixels nobody sees.
      quality: 0.7,
    });
    if (result.canceled) return;

    const [asset] = result.assets;
    try {
      await uploadAvatar.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName ?? undefined,
      });
      showToast('Profile picture updated');
    } catch (error) {
      showToast(getApiErrorMessage(error, "Couldn't upload that picture."));
    }
  }

  async function onRemoveAvatar() {
    try {
      await removeAvatar.mutateAsync();
      showToast('Profile picture removed');
    } catch (error) {
      showToast(getApiErrorMessage(error, "Couldn't remove your picture."));
    }
  }

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
        <View style={styles.avatarSection}>
          <Avatar uri={user?.profile.avatar} initials={initials} size={96} />
          <View style={styles.avatarButtons}>
            <Pressable
              disabled={isAvatarBusy}
              onPress={onPickAvatar}
              style={({ pressed }) => [
                styles.avatarButton,
                { backgroundColor: theme.primarySoft },
                (pressed || isAvatarBusy) && styles.pressed,
              ]}>
              <Ionicons name="image-outline" size={16} color={theme.primary} />
              <ThemedText type="smallBold" style={{ color: theme.primary }}>
                {uploadAvatar.isPending ? 'Uploading…' : 'Change photo'}
              </ThemedText>
            </Pressable>

            {user?.profile.avatar ? (
              <Pressable
                disabled={isAvatarBusy}
                onPress={onRemoveAvatar}
                style={({ pressed }) => [
                  styles.avatarButton,
                  { backgroundColor: theme.backgroundElement },
                  (pressed || isAvatarBusy) && styles.pressed,
                ]}>
                <Ionicons name="trash-outline" size={16} color={theme.danger} />
                <ThemedText type="smallBold" style={{ color: theme.danger }}>
                  {removeAvatar.isPending ? 'Removing…' : 'Remove'}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>

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

        <Pressable
          onPress={() => router.push('/profile/settings/change-password')}
          style={({ pressed }) => [
            styles.passwordRow,
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
          <View style={styles.passwordRowText}>
            <ThemedText type="smallBold">Change password</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Update the password you sign in with
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </Pressable>

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
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    marginTop: Spacing.one,
  },
  passwordRowText: {
    flex: 1,
    gap: Spacing.half,
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
