import { useState } from "react";

// Custom hook dùng cho chọn sản phẩm, quản lý modal và danh sách đã chọn
export default function useProductSelect(initial: string[] = []) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initial);

  const openProductModal = () => setShowProductModal(true);
  const closeProductModal = () => setShowProductModal(false);
  const saveSelectedProducts = (ids: string[]) => {
    setSelectedProductIds(ids);
    setShowProductModal(false);
  };
  const removeProduct = (id: string) => setSelectedProductIds((ids) => ids.filter(i => i !== id));

  return {
    showProductModal,
    openProductModal,
    closeProductModal,
    selectedProductIds,
    setSelectedProductIds,
    saveSelectedProducts,
    removeProduct,
  };
}