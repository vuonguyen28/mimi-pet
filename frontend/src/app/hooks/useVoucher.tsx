import { useEffect, useState } from "react";
import { Voucher } from "../types/voucherD";
import {
  getVouchers,
  addVoucher,
  editVoucher,
  deleteVoucher,
} from "../services/voucherService";

// Hàm kiểm tra voucher còn hiệu lực và đang active
export function isVoucherUsable(v: Voucher, now: Date = new Date()): boolean {
  return (
    v.active &&
    new Date(v.startDate) <= now &&
    new Date(v.endDate) >= now
  );
}

export const useVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all vouchers
  const fetchVouchers = async () => {
    setError(null);
    try {
      const data = await getVouchers();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Không thể tải Vouchers");
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Add new voucher
  const addNewVoucher = async (voucher: Omit<Voucher, "_id">) => {
    try {
      await addVoucher(voucher);
      await fetchVouchers();
    } catch (err) {
      alert("Thêm mã giảm giá thất bại");
    }
  };

  // Edit voucher
  const updateVoucher = async (_id: string, data: Partial<Voucher>) => {
    try {
      await editVoucher(_id, data);
      await fetchVouchers();
    } catch (err) {
      alert("Cập nhật mã giảm giá thất bại");
    }
  };

  // Delete voucher
  const removeVoucher = async (_id: string) => {
    try {
      await deleteVoucher(_id);
      await fetchVouchers();
    } catch (err) {
      alert("Xoá mã giảm giá thất bại");
    }
  };

  // Lọc voucher usable (active=true và nằm trong khoảng ngày)
  const getUsableVouchers = () => {
    const now = new Date();
    return vouchers.filter(v => isVoucherUsable(v, now));
  };

  return {
    vouchers,
    error,
    setVouchers,
    fetchVouchers,
    addNewVoucher,
    updateVoucher,
    removeVoucher,
    getUsableVouchers,
  };
};