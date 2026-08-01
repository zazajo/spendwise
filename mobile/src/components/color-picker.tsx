import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_COLORS } from '@/constants/category-options';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';

type ColorPickerProps = {
  visible: boolean;
  selectedColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
};

export function ColorPicker({ visible, selectedColor, onSelect, onClose }: ColorPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.cardWrapper} onPress={(event) => event.stopPropagation()}>
          <ThemedView type="background" style={styles.card}>
            <ThemedText type="smallBold" style={styles.title}>
              Color
            </ThemedText>
            <View style={styles.grid}>
              {CATEGORY_COLORS.map((color) => {
                const selected = color === selectedColor;
                return (
                  <Pressable
                    key={color}
                    onPress={() => onSelect(color)}
                    style={[styles.swatch, { backgroundColor: color }]}>
                    {selected ? <Ionicons name="checkmark" size={20} color="#ffffff" /> : null}
                  </Pressable>
                );
              })}
            </View>
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
  },
  title: {
    marginBottom: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
