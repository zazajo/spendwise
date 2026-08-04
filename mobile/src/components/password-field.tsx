import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, type TextInput, type TextInputProps } from 'react-native';

import { TextField } from '@/components/text-field';
import { useTheme } from '@/hooks/use-theme';

type PasswordFieldProps = Omit<TextInputProps, 'secureTextEntry'> & {
  label?: string;
  error?: string;
};

/**
 * A password input with a show/hide toggle - typing a password blind on a phone
 * keyboard is where most sign-in typos come from.
 */
export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(function PasswordField(
  props,
  ref
) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      ref={ref}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          // The icon is small; widen the touch target without widening the icon.
          hitSlop={10}
          onPress={() => setVisible((current) => !current)}>
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>
      }
    />
  );
});
