import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { GoogleLogo } from '@/components/auth/google-logo';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GoogleSignInButtonProps = {
  isPending?: boolean;
  onPress: () => void;
};

/** Outlined "Continue with Google" button, styled as a secondary action below the form. */
export function GoogleSignInButton({ isPending = false, onPress }: GoogleSignInButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isPending, busy: isPending }}
      disabled={isPending}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
        isPending && styles.blocked,
      ]}>
      {isPending ? (
        <ActivityIndicator size="small" color={theme.text} />
      ) : (
        <View style={styles.content}>
          <GoogleLogo size={18} />
          <ThemedText type="smallBold">Continue with Google</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  blocked: {
    opacity: 0.6,
  },
});
