import { useState } from "react";

// Custom hook dùng cho chọn danh mục, quản lý modal và danh sách đã chọn
export default function useCategorySelect(initial: string[] = []) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initial);

  const openCategoryModal = () => setShowCategoryModal(true);
  const closeCategoryModal = () => setShowCategoryModal(false);
  const saveSelectedCategories = (ids: string[]) => {
    setSelectedCategoryIds(ids);
    setShowCategoryModal(false);
  };
  const removeCategory = (id: string) => setSelectedCategoryIds((ids) => ids.filter(i => i !== id));

  return {
    showCategoryModal,
    openCategoryModal,
    closeCategoryModal,
    selectedCategoryIds,
    setSelectedCategoryIds,
    saveSelectedCategories,
    removeCategory,
  };
}