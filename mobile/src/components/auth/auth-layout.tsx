import { Ionicons } from '@expo/vector-icons';
import { type PropsWithChildren, type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTheme } from '@/hooks/use-theme';

/** Narrower than MaxContentWidth: a login form reads badly stretched to 800pt. */
const FormMaxWidth = 420;

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer: ReactNode;
}>;

/**
 * Shared shell for the login and register screens.
 *
 * Keyboard handling is the whole point of this component. `flexGrow: 1` plus
 * `justifyContent: 'center'` keeps the form centred while there's room to
 * spare, and lets it scroll once the keyboard eats that room.
 * `automaticallyAdjustKeyboardInsets` then insets the scroll view by the
 * keyboard's height, which both keeps the submit button reachable and scrolls
 * the focused field into view - that last part is what a plain
 * KeyboardAvoidingView does not do, and why the taller register form still had
 * fields hiding behind the keyboard.
 */
export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  const theme = useTheme();
  const keyboardVisible = useKeyboardVisible();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <View style={styles.brand}>
              {/* The mark is decoration; while someone is typing that space is
                  better spent on the form itself. */}
              {keyboardVisible ? null : (
                <View style={[styles.mark, { backgroundColor: theme.primary }]}>
                  <Ionicons name="wallet" size={30} color="#ffffff" />
                </View>
              )}
              <ThemedText type="smallBold" style={[styles.wordmark, { color: theme.primary }]}>
                SPENDWISE
              </ThemedText>
              <ThemedText type="title" style={styles.title}>
                {title}
              </ThemedText>
              {keyboardVisible ? null : (
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              )}
            </View>

            {/* Deliberately not the Card default (backgroundElement): that is
                the same colour as the input fills, which left the fields with
                no visible edge against the card behind them. */}
            <Card style={[styles.card, { backgroundColor: theme.background }]}>{children}</Card>

            <View style={styles.footer}>{footer}</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    // Room to scroll the last field clear of the keyboard on short screens.
    paddingBottom: Platform.OS === 'android' ? Spacing.six : Spacing.four,
  },
  inner: {
    width: '100%',
    maxWidth: FormMaxWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  mark: {
    width: 60,
    height: 60,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  wordmark: {
    letterSpacing: 1.5,
    fontSize: 12,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    gap: Spacing.three,
  },
  footer: {
    alignItems: 'center',
  },
});
