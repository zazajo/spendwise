import { router } from 'expo-router';

import { CategoryForm } from '@/components/category-form';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from '@/constants/category-options';
import { useCreateCategory } from '@/hooks/use-create-category';
import { showToast } from '@/hooks/use-toast';
import type { CategoryFormValues } from '@/types/category';

const DEFAULT_VALUES: CategoryFormValues = {
  name: '',
  category_type: 'expense',
  color: DEFAULT_CATEGORY_COLOR,
  icon: DEFAULT_CATEGORY_ICON,
};

export default function NewCategoryScreen() {
  const createCategory = useCreateCategory();

  return (
    <ThemedView style={{ flex: 1 }}>
      <CategoryForm
        defaultValues={DEFAULT_VALUES}
        submitLabel="Add category"
        isSubmitting={createCategory.isPending}
        submitError={createCategory.isError}
        onCancel={() => router.back()}
        onSubmit={(values) => {
          createCategory.mutate(values, {
            onSuccess: () => {
              showToast('Category created');
              router.back();
            },
          });
        }}
      />
    </ThemedView>
  );
}
