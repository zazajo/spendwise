import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CATEGORY_COLORS } from '@/constants/category-options';
import { useTheme } from '@/hooks/use-theme';
import { getInitials } from '@/utils/group';

type MemberAvatarProps = {
  name: string;
  size?: number;
  bordered?: boolean;
  style?: ViewStyle;
};

// Deterministic color per name so the same person always gets the same avatar color
// across screens, without needing to store a color on the user/membership record.
function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

export function MemberAvatar({ name, size = 36, bordered, style }: MemberAvatarProps) {
  const theme = useTheme();
  const backgroundColor = colorForName(name);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth: bordered ? 2 : 0,
          borderColor: bordered ? theme.background : 'transparent',
        },
        style,
      ]}>
      <ThemedText style={[styles.initials, { fontSize: size * 0.4 }]}>{getInitials(name)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
