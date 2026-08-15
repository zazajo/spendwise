import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, type TextInput } from 'react-native';

import { AuthLayout } from '@/components/auth/auth-layout';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { OrDivider } from '@/components/auth/or-divider';
import { FormError } from '@/components/form-error';
import { PasswordField } from '@/components/password-field';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { GOOGLE_CLIENT_ID, GOOGLE_RELAY_URL } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import { useGoogleLogin } from '@/hooks/use-google-login';
import { useRegister } from '@/hooks/use-register';
import { registerSchema, type RegisterPayload } from '@/types/auth';
import { getApiErrorMessage } from '@/utils/api-error';

const isGoogleSignInEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_RELAY_URL);

export default function RegisterScreen() {
  const register = useRegister();
  const googleLogin = useGoogleLogin();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', password2: '' },
  });

  const onSubmit = handleSubmit((values) => {
    register.mutate(values, { onSuccess: () => router.replace('/') });
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking where your money goes"
      footer={
        <View style={styles.footerRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Already have an account?
          </ThemedText>
          <Link href="/login">
            <ThemedText type="linkPrimary">Log in</ThemedText>
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
            onSubmitEditing={() => emailRef.current?.focus()}
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
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={emailRef}
            label="Email"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
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
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            submitBehavior="submit"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password2"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            ref={confirmRef}
            label="Confirm password"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password2?.message}
          />
        )}
      />

      {register.isError ? (
        <FormError
          message={getApiErrorMessage(
            register.error,
            'Could not create account. Try a different username or email.'
          )}
        />
      ) : null}

      <PrimaryButton
        label="Create account"
        pendingLabel="Creating account…"
        isPending={register.isPending}
        onPress={onSubmit}
      />

      {isGoogleSignInEnabled ? (
        <>
          <OrDivider />
          {googleLogin.isError ? (
            <FormError
              message={getApiErrorMessage(googleLogin.error, 'Could not sign in with Google.')}
            />
          ) : null}
          <GoogleSignInButton
            isPending={googleLogin.isPending}
            onPress={() => googleLogin.mutate()}
          />
        </>
      ) : null}
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
