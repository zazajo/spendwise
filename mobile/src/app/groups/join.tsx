import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextField } from '@/components/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useJoinGroup } from '@/hooks/use-join-group';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { joinGroupSchema, type JoinGroupFormValues } from '@/types/group';
import { getApiErrorMessage } from '@/utils/api-error';

export default function JoinGroupScreen() {
  const theme = useTheme();
  const joinGroup = useJoinGroup();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinGroupFormValues>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: { invite_code: '' },
  });

  function onSubmit(values: JoinGroupFormValues) {
    joinGroup.mutate(values.invite_code, {
      onSuccess: (result) => {
        showToast(`Joined ${result.group.name}`);
        router.replace({ pathname: '/groups/[id]', params: { id: String(result.group.id) } });
      },
    });
  }

  const serverError =
    joinGroup.isError && getApiErrorMessage(joinGroup.error, "Couldn't join that group.");

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          Ask a group member for their invite code and enter it below to join.
        </ThemedText>

        <Controller
          control={control}
          name="invite_code"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Invite code"
              autoCapitalize="characters"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.invite_code?.message}
            />
          )}
        />

        {joinGroup.isError ? (
          <ThemedText type="small" themeColor="danger">
            {serverError || "That invite code doesn't look right. Please try again."}
          </ThemedText>
        ) : null}

        <Pressable
          disabled={joinGroup.isPending}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={styles.submitButtonText}>
            {joinGroup.isPending ? 'Joining…' : 'Join group'}
          </ThemedText>
        </Pressable>

        <Pressable disabled={joinGroup.isPending} onPress={() => router.back()} style={styles.cancelButton}>
          <ThemedText type="smallBold">Cancel</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  submitButton: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#ffffff',
  },
  cancelButton: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
