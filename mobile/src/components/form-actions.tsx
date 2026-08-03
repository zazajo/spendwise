import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormActionsProps = {
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  /** Overrides the submit button fill - the category form tints it with the chosen color. */
  submitColor?: string;
  /** Blocks submit for reasons beyond isSubmitting, e.g. an unbalanced split. */
  submitDisabled?: boolean;
};

/** The submit + cancel pair every form screen ends with. */
export function FormActions({
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  submitColor,
  submitDisabled,
}: FormActionsProps) {
  const theme = useTheme();
  const disabled = isSubmitting || Boolean(submitDisabled);

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: submitColor ?? theme.primary },
          (pressed || disabled) && styles.pressed,
        ]}>
        <ThemedText type="smallBold" style={styles.submitButtonText}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </ThemedText>
      </Pressable>

      <Pressable disabled={isSubmitting} onPress={onCancel} style={styles.cancelButton}>
        <ThemedText type="smallBold">Cancel</ThemedText>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
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
