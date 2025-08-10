import { SubCategory } from "../types/categoryD";

const API_URL = "http://localhost:3000/subcategory";

// Thêm danh mục con mới (C)
export const createSubcategory = async (data: Omit<SubCategory, "_id">): Promise<SubCategory> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi thêm danh mục");
  return res.json();
};

// Cập nhật danh mục con (U)
export const updateSubcategory = async (_id: string, data: Partial<SubCategory>): Promise<SubCategory> => {
  const res = await fetch(`${API_URL}/${_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi cập nhật danh mục");
  return res.json();
};