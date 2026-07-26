import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useLogin } from '@/hooks/use-login';
import { loginSchema, type LoginPayload } from '@/types/auth';

export default function LoginScreen() {
  const login = useLogin();
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Welcome back
        </ThemedText>
        <ThemedText themeColor="textSecondary">Log in to continue to SpendWise</ThemedText>

        <ThemedView style={styles.form}>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Username"
                autoCapitalize="none"
                autoComplete="username"
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
              <TextField
                label="Password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {login.isError ? (
            <ThemedText type="small" style={styles.formError}>
              Invalid username or password.
            </ThemedText>
          ) : null}

          <Pressable
            disabled={login.isPending}
            onPress={onSubmit}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              {login.isPending ? 'Logging in…' : 'Log in'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <Link href="/register" style={styles.link}>
          <ThemedText type="link">Don&apos;t have an account? Sign up</ThemedText>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  form: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
  formError: {
    color: '#E5484D',
  },
  link: {
    marginTop: Spacing.four,
    alignSelf: 'center',
  },
});
