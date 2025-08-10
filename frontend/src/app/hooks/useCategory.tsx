import { useEffect, useState } from "react";
import { createCategory, updateCategory, getCategories } from "../services/categoryService";
import { Category } from "../types/categoryD";
import { createSubcategory, updateSubcategory } from "../services/subcategoryService";
import { useSuccessNotification } from "../utils/useSuccessNotification";

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const showSuccess = useSuccessNotification(); // <-- Khởi tạo hàm notification

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (!Array.isArray(data)) {
        console.error("API trả về không phải mảng:", data);
        return;
      }
      setCategories(data);
      // showSuccess("Tải danh mục thành công", "Đã lấy danh sách danh mục!"); // Nếu muốn có thể bật dòng này
      console.log("[fetchCategories] Cập nhật categories:", data);
    } catch (err) {
      console.error("Không thể tải danh mục:", err);
    }
  };

  // Fetch categories once when mounted
  useEffect(() => {
    fetchCategories();
  }, []);

  // Add a new category
  const addCategory = async (data: { name: string; hidden: boolean }) => {
    try {
      await createCategory({ ...data, subcategories: [] });
      await fetchCategories();
      showSuccess("Thành công", "Đã thêm danh mục mới!");
    } catch (err) {
      // Có thể dùng notification.error ở đây nếu muốn
      alert("Thêm danh mục thất bại");
    }
  };

  // Update the name of a category
  const updateCategoryName = async (_id: string, name: string) => {
    try {
      const cat = categories.find(c => c._id === _id);
      if (!cat) return;
      await updateCategory(_id, { ...cat, name });
      await fetchCategories();
      showSuccess("Thành công", "Cập nhật tên danh mục thành công!");
    } catch (err) {
      alert("Cập nhật tên danh mục thất bại");
    }
  };

  // Toggle the visibility of a category
  const toggleVisibility = async (_id: string) => {
    const cat = categories.find(c => c._id === _id);
    if (!cat) return;
    try {
      await updateCategory(_id, {
        ...cat,
        hidden: !cat.hidden
      });
      await fetchCategories();
      showSuccess(
        "Thành công",
        cat.hidden ? "Đã hiển thị lại danh mục!" : "Đã ẩn danh mục!"
      );
    } catch (err) {
      alert("Ẩn/hiện danh mục thất bại");
    }
  };

  // Add a new subcategory to a category
  const addSubcategoryToCategory = async (parentId: string, sub: { name: string; hidden: boolean }) => {
    try {
      await createSubcategory({ ...sub, categoryId: parentId });
      await fetchCategories();
      showSuccess("Thành công", "Đã thêm danh mục con mới!");
    } catch (err) {
      alert("Thêm danh mục con thất bại");
    }
  };

  // Update the name of a subcategory
  const updateSubcategoryName = async (subId: string, name: string, parentId: string) => {
    const cat = categories.find(c => c._id === parentId);
    if (!cat) return;
    const sub = cat.subcategories?.find(s => s._id === subId);
    if (!sub) return;
    try {
      await updateSubcategory(subId, { name, hidden: sub.hidden });
      await fetchCategories();
      showSuccess("Thành công", "Cập nhật tên danh mục con thành công!");
    } catch (err) {
      alert("Cập nhật tên danh mục con thất bại");
    }
  };

  // Toggle the visibility of a subcategory (cho dạng cây)
  const toggleSubcategoryVisibility = async (subId: string, parentId: string) => {
    const cat = categories.find(c => c._id === parentId);
    if (!cat) {
      console.log("Không tìm thấy category với id:", parentId);
      return;
    }
    const sub = cat.subcategories?.find(s => s._id === subId);
    if (!sub) {
      console.log("Không tìm thấy subcategory với id:", subId, "trong category", parentId);
      return;
    }

    console.log("Gọi toggleSubcategoryVisibility với subId", subId, "parentId", parentId, "current hidden:", sub.hidden);

    try {
      const res = await updateSubcategory(subId, { name: sub.name, hidden: !sub.hidden });
      console.log("API updateSubcategory trả về:", res);
      await fetchCategories();
      showSuccess(
        "Thành công",
        sub.hidden ? "Đã hiển thị lại danh mục con!" : "Đã ẩn danh mục con!"
      );
      console.log("Fetch lại categories sau khi update subcategory");
    } catch (err) {
      console.error("Ẩn/hiện danh mục con thất bại", err);
      alert("Ẩn/hiện danh mục con thất bại");
    }
  };

  return {
    categories,
    addCategory,
    updateCategoryName,
    toggleVisibility,
    toggleSubcategoryVisibility,
    updateSubcategoryName,
    selectAll,
    addSubcategoryToCategory,
    fetchCategories,
  };
};