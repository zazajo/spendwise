import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RecurringGenerateRangeModalProps = {
  visible: boolean;
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  isSubmitting: boolean;
  onGenerate: () => void;
  onClose: () => void;
};

export function RecurringGenerateRangeModal({
  visible,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  isSubmitting,
  onGenerate,
  onClose,
}: RecurringGenerateRangeModalProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ThemedView type="background" style={styles.card}>
          <ThemedText type="smallBold">Generate for date range</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
            Generates every active recurring expense&apos;s occurrences that fall between these dates.
          </ThemedText>

          <TextField
            label="Start date"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={onChangeStartDate}
          />
          <TextField
            label="End date"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={onChangeEndDate}
          />

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <ThemedText type="smallBold">Cancel</ThemedText>
            </Pressable>
            <Pressable
              disabled={isSubmitting}
              style={[styles.generateButton, { backgroundColor: theme.primary }]}
              onPress={onGenerate}>
              <ThemedText type="smallBold" style={styles.generateButtonText}>
                {isSubmitting ? 'Generating…' : 'Generate'}
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
    gap: Spacing.two,
  },
  message: {
    marginBottom: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'flex-end',
    marginTop: Spacing.two,
  },
  cancelButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
  },
  generateButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
  },
  generateButtonText: {
    color: '#ffffff',
  },
});
