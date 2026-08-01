import { router, useLocalSearchParams } from 'expo-router';

import { CategoryForm } from '@/components/category-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCategory } from '@/hooks/use-category';
import { useUpdateCategory } from '@/hooks/use-update-category';
import { showToast } from '@/hooks/use-toast';
import type { CategoryFormValues } from '@/types/category';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);
  const { data: category, isLoading } = useCategory(categoryId);
  const updateCategory = useUpdateCategory(categoryId);

  if (isLoading || !category) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText themeColor="textSecondary">Loading…</ThemedText>
      </ThemedView>
    );
  }

  const defaultValues: CategoryFormValues = {
    name: category.name,
    category_type: category.category_type,
    color: category.color,
    icon: category.icon,
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <CategoryForm
        defaultValues={defaultValues}
        submitLabel="Save changes"
        isSubmitting={updateCategory.isPending}
        submitError={updateCategory.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          updateCategory.mutate(values, {
            onSuccess: () => {
              showToast('Category updated');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
