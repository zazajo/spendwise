import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  /** Control rendered inside the field's right edge, e.g. a show/hide password toggle. */
  trailing?: ReactNode;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, trailing, style, onFocus, onBlur, ...rest },
  ref
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  // Always draw an edge. Fields used to rely on their fill alone to stand out,
  // which fails the moment they sit on a surface of the same colour - and gave
  // no indication of which field the keyboard was actually typing into.
  const borderColor = error ? theme.danger : focused ? theme.primary : theme.border;

  // Derived from the props rather than named directly - React Native has
  // renamed these event types across versions.
  const handleFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={styles.container}>
      {label ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      {/* The border lives on the wrapper rather than the input so a trailing
          control can sit inside the field instead of beside it. */}
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.backgroundElement, borderColor },
          // Multiline fields grow downward, so keep everything top-aligned
          // rather than centred against a tall box.
          rest.multiline && styles.inputRowMultiline,
        ]}>
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {trailing}
      </View>
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.two,
    // Constant width so switching to the focus colour never nudges the text.
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
