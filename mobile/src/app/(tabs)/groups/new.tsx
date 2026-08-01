import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextField } from '@/components/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useCreateGroup } from '@/hooks/use-create-group';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/hooks/use-toast';
import { groupFormSchema, type GroupFormValues } from '@/types/group';

const DEFAULT_VALUES: GroupFormValues = {
  name: '',
  description: '',
};

export default function NewGroupScreen() {
  const theme = useTheme();
  const createGroup = useCreateGroup();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  function onSubmit(values: GroupFormValues) {
    createGroup.mutate(values, {
      onSuccess: (group) => {
        showToast('Group created');
        router.replace({ pathname: '/groups/[id]', params: { id: String(group.id) } });
      },
    });
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Group name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Description (optional)"
              multiline
              numberOfLines={3}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
            />
          )}
        />

        {createGroup.isError ? (
          <ThemedText type="small" themeColor="danger">
            Something went wrong. Please try again.
          </ThemedText>
        ) : null}

        <Pressable
          disabled={createGroup.isPending}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={styles.submitButtonText}>
            {createGroup.isPending ? 'Creating…' : 'Create group'}
          </ThemedText>
        </Pressable>

        <Pressable disabled={createGroup.isPending} onPress={() => router.back()} style={styles.cancelButton}>
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
