import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_CATEGORY_ICON } from '@/constants/category-options';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/types/category';

type CategoryListItemProps = {
  category: Category;
  onPress: () => void;
};

export function CategoryListItem({ category, onPress }: CategoryListItemProps) {
  const theme = useTheme();
  const iconName = (category.icon || DEFAULT_CATEGORY_ICON) as keyof typeof Ionicons.glyphMap;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
          <View style={[styles.iconCircle, { backgroundColor: category.color }]}>
            <Ionicons name={iconName} size={18} color="#ffffff" />
          </View>
          <View style={styles.middle}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {category.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {category.expense_count} {category.expense_count === 1 ? 'transaction' : 'transactions'}
            </ThemedText>
          </View>
          {!category.is_active ? (
            <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Archived
              </ThemedText>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
});
