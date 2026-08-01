import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export interface SelectOption {
  value: number | null;
  label: string;
  color?: string;
}

type SelectModalProps = {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
  onClose: () => void;
};

export function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.cardWrapper} onPress={(event) => event.stopPropagation()}>
          <ThemedView type="background" style={styles.card}>
            <ThemedText type="smallBold" style={styles.title}>
              {title}
            </ThemedText>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => onSelect(item.value)}>
                  {item.color ? (
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  ) : null}
                  <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
                  {item.value === selectedValue ? <ThemedText>✓</ThemedText> : null}
                </Pressable>
              )}
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
    borderRadius: Spacing.three,
    padding: Spacing.three,
    maxHeight: 400,
  },
  title: {
    marginBottom: Spacing.two,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  rowLabel: {
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
