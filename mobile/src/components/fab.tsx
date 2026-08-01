import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FabProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function Fab({ icon = 'add', onPress }: FabProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add"
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.primary, shadowColor: '#000' },
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
    bottom: BottomTabInset + Spacing.four,
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
