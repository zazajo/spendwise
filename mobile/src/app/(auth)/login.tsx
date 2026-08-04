import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, type TextInput } from 'react-native';

import { AuthLayout } from '@/components/auth/auth-layout';
import { FormError } from '@/components/form-error';
import { PasswordField } from '@/components/password-field';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useLogin } from '@/hooks/use-login';
import { loginSchema, type LoginPayload } from '@/types/auth';
import { getApiErrorMessage } from '@/utils/api-error';

export default function LoginScreen() {
  const login = useLogin();
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: () => router.replace('/') });
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up where you left off"
      footer={
        <View style={styles.footerRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Don&apos;t have an account?
          </ThemedText>
          <Link href="/register">
            <ThemedText type="linkPrimary">Sign up</ThemedText>
          </Link>
        </View>
      }>
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Username"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
            // Advance to the password rather than dismissing the keyboard, so
            // the whole form can be filled without reaching for the screen.
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.username?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            ref={passwordRef}
            label="Password"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      {login.isError ? (
        <FormError message={getApiErrorMessage(login.error, 'Invalid username or password.')} />
      ) : null}

      <PrimaryButton
        label="Log in"
        pendingLabel="Logging in…"
        isPending={login.isPending}
        onPress={onSubmit}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
