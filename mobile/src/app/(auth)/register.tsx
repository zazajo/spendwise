import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useRegister } from '@/hooks/use-register';
import { registerSchema, type RegisterPayload } from '@/types/auth';

export default function RegisterScreen() {
  const register = useRegister();
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Create account
        </ThemedText>
        <ThemedText themeColor="textSecondary">Set up your SpendWise account</ThemedText>

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
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
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
              <TextField
                label="Password"
                secureTextEntry
                autoCapitalize="none"
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
              <TextField
                label="Confirm password"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password2?.message}
              />
            )}
          />

          {register.isError ? (
            <ThemedText type="small" style={styles.formError}>
              Could not create account. Try a different username or email.
            </ThemedText>
          ) : null}

          <Pressable
            disabled={register.isPending}
            onPress={onSubmit}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              {register.isPending ? 'Creating account…' : 'Create account'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <Link href="/login" style={styles.link}>
          <ThemedText type="link">Already have an account? Log in</ThemedText>
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
