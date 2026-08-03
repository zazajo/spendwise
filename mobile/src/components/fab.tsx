import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FabProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

// The native tab bar (expo-router/unstable-native-tabs) renders its own content height
// PLUS the device's safe-area bottom inset (e.g. the 34pt home indicator strip on iPhones
// without a physical home button) - BottomTabInset alone under-counts that inset, letting
// the FAB's bottom edge sit behind the tab bar. Web's floating pill bar has no such inset.
const NATIVE_TAB_BAR_CONTENT_HEIGHT = Platform.select({ ios: 49, android: 56 }) ?? 0;

export function Fab({ icon = 'add', onPress }: FabProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'web' ? BottomTabInset : insets.bottom + NATIVE_TAB_BAR_CONTENT_HEIGHT;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add"
      style={({ pressed }) => [
        styles.fab,
        { bottom: bottomInset + Spacing.four, backgroundColor: theme.primary, shadowColor: '#000' },
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={26} color="#ffffff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
});
