import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PrimaryButtonProps = {
  label: string;
  /** Shown while `isPending`; falls back to `label`. */
  pendingLabel?: string;
  isPending?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** The filled, full-width call to action a screen is built around. */
export function PrimaryButton({
  label,
  pendingLabel,
  isPending = false,
  disabled = false,
  onPress,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isBlocked = isPending || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: isPending }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
        isBlocked && styles.blocked,
      ]}>
      <View style={styles.content}>
        {isPending ? <ActivityIndicator size="small" color="#ffffff" /> : null}
        <ThemedText type="smallBold" style={styles.label}>
          {isPending ? (pendingLabel ?? label) : label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  blocked: {
    opacity: 0.6,
  },
});
