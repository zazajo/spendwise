import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A whole-form failure - a rejected login, a duplicate username. Rendered as a
 * tinted banner rather than a bare red line so it reads as a distinct state
 * and not just another field error.
 */
export function FormError({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor: theme.dangerSoft }]}>
      <Ionicons name="alert-circle" size={18} color={theme.danger} />
      <ThemedText type="small" style={[styles.message, { color: theme.danger }]}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  message: {
    flex: 1,
  },
});
