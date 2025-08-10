import { Voucher } from "../types/voucherD";

const API_URL = "http://localhost:3000/vouchers";

// Lấy toàn bộ Voucher (GET /vouchers)
export const getVouchers = async (): Promise<Voucher[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Lỗi khi tải danh sách voucher");
  return res.json();
};

// Lấy 1 voucher theo id (GET /vouchers/:id)
export const getVoucherById = async (id: string): Promise<Voucher> => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Không tìm thấy voucher");
  return res.json();
};

// Thêm mới voucher (POST /vouchers)
export const addVoucher = async (voucher: Omit<Voucher, "_id">): Promise<Voucher> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voucher),
  });
  if (!res.ok) throw new Error("Lỗi khi thêm voucher");
  return res.json();
};

// Sửa voucher (PUT /vouchers/:id)
export const editVoucher = async (id: string, voucher: Partial<Voucher>): Promise<Voucher> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voucher),
  });
  if (!res.ok) throw new Error("Lỗi khi cập nhật voucher");
  return res.json();
};

// Xóa voucher (DELETE /vouchers/:id)
export const deleteVoucher = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Lỗi khi xóa voucher");
  return res.json();
};
