import { Voucher } from "@/app/types/voucherD";

export function validateVoucherForm(
  form: Voucher,
  discountType: "amount" | "percent"
): string | null {
  if (!form.discountCode.trim())
    return "Vui lòng nhập mã giảm giá.";
  if (form.discountCode.trim().length < 5)
    return "Mã giảm giá phải có ít nhất 5 ký tự (ví dụ: Teddy).";
  if (discountType === "amount" && (form.amount == null || form.amount < 1))
    return "Vui lòng nhập số tiền giảm giá hợp lệ.";
  if (
    discountType === "percent" &&
    (form.percent == null || form.percent < 1 || form.percent > 100)
  )
    return "Vui lòng nhập phần trăm giảm giá hợp lệ (1-100).";
  if (!form.startDate || !form.endDate)
    return "Vui lòng chọn thời gian áp dụng mã giảm giá.";

  // ==== BỔ SUNG KIỂM TRA NGÀY ====
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    return "Ngày không hợp lệ.";
  if (start >= end)
    return "Ngày kết thúc phải lớn hơn ngày bắt đầu.";

  if (
    form.targetType === "product" &&
    (!form.productIds || form.productIds.length === 0)
  )
    return "Vui lòng chọn ít nhất 1 sản phẩm.";
  if (
    form.targetType === "category" &&
    (!form.categoryIds || form.categoryIds.length === 0)
  )
    return "Vui lòng chọn ít nhất 1 danh mục.";
  return null;
}