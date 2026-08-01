import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <ThemedView type="background" style={styles.card}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.message}>
            {message}
          </ThemedText>

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <ThemedText type="smallBold">{cancelLabel}</ThemedText>
            </Pressable>
            <Pressable
              disabled={loading}
              style={[styles.button, destructive ? styles.destructiveButton : styles.confirmButton]}
              onPress={onConfirm}>
              <ThemedText type="smallBold" style={styles.confirmButtonText}>
                {loading ? 'Please wait…' : confirmLabel}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
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
  card: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  message: {
    marginBottom: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  confirmButton: {
    backgroundColor: '#3c87f7',
  },
  destructiveButton: {
    backgroundColor: '#E5484D',
  },
  confirmButtonText: {
    color: '#ffffff',
  },
});
