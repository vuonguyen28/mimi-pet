import { Category } from "../types/categoryD";

const API_URL = "http://localhost:3000/categories";

// Lấy toàn bộ danh mục (R)
export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Lỗi khi tải danh mục");
  return res.json();
};

// Lấy chi tiết 1 danh mục theo ID từ backend (đã có populate)
export const getCategoryById = async (_id: string): Promise<Category> => {
  const res = await fetch(`${API_URL}/${_id}`);
  if (!res.ok) throw new Error("Không tìm thấy danh mục với id: " + _id);
  return res.json();
};

// Thêm danh mục mới (C)
export const createCategory = async (data: Omit<Category, "_id">): Promise<Category> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi thêm danh mục");
  return res.json();
};

// Cập nhật danh mục (U)
export const updateCategory = async (_id: string, data: Partial<Category>): Promise<Category> => {
  const res = await fetch(`${API_URL}/${_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi cập nhật danh mục");
  return res.json();
};

