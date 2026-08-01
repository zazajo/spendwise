import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_ICONS } from '@/constants/category-options';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';

type IconPickerProps = {
  visible: boolean;
  color: string;
  selectedIcon: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
};

export function IconPicker({ visible, color, selectedIcon, onSelect, onClose }: IconPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.cardWrapper} onPress={(event) => event.stopPropagation()}>
          <ThemedView type="background" style={styles.card}>
            <ThemedText type="smallBold" style={styles.title}>
              Icon
            </ThemedText>
            <FlatList
              data={CATEGORY_ICONS}
              keyExtractor={(item) => item}
              numColumns={5}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item === selectedIcon;
                return (
                  <Pressable
                    onPress={() => onSelect(item)}
                    style={[
                      styles.iconButton,
                      { backgroundColor: selected ? color : 'rgba(128,128,128,0.12)' },
                    ]}>
                    <Ionicons name={item} size={22} color={selected ? '#ffffff' : color} />
                  </Pressable>
                );
              }}
            />
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  card: {
    borderRadius: Radius.large,
    padding: Spacing.four,
    maxHeight: 420,
  },
  title: {
    marginBottom: Spacing.three,
  },
  list: {
    flexGrow: 0,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.one,
  },
});
