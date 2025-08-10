import { Voucher } from "../types/voucherD";

export function validateVoucher({
  voucher,
  cartItems,
  total,
  now = new Date(),
}: {
  voucher: Voucher;
  cartItems: any[];
  total: number;
  now?: Date;
}): { valid: boolean; message?: string; discount?: number } {
  // Kiểm tra hiệu lực
  if (!voucher.active) return { valid: false, message: "Voucher đã hết hiệu lực" };

  const start = new Date(voucher.startDate);
  const end = new Date(voucher.endDate);
  if (now < start) return { valid: false, message: "Voucher chưa tới ngày sử dụng" };
  if (now > end) return { valid: false, message: "Voucher đã hết hạn" };

  // Kiểm tra số lượt dùng
  if (voucher.usageLimit && voucher.used && voucher.used >= voucher.usageLimit) {
    return { valid: false, message: "Voucher đã hết lượt sử dụng" };
  }

  // Kiểm tra giá trị tối thiểu
  if (voucher.minOrderValue && total < voucher.minOrderValue) {
    return {
      valid: false,
      message: `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString()}₫ mới dùng được voucher này`
    };
  }

  // Xác định các sản phẩm hợp lệ để tính giảm giá
  let eligibleItems = cartItems;
  if (voucher.targetType === "product") {
    eligibleItems = cartItems.filter(item => voucher.productIds.includes(item.product._id));
  }
  if (voucher.targetType === "category") {
    eligibleItems = cartItems.filter(item =>
      voucher.categoryIds.includes(item.product.categoryId._id)
    );
  }

  if (eligibleItems.length === 0) {
    return { valid: false, message: "Giỏ hàng không có sản phẩm áp dụng voucher này" };
  }

  // Tính tổng tiền các sản phẩm hợp lệ
  const eligibleTotal = eligibleItems.reduce(
    (sum, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
      return sum + price * item.quantity;
    },
    0
  );

  // Tính giảm giá
  let discount = 0;
  if (voucher.percent) {
    discount = (eligibleTotal * voucher.percent) / 100;
    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else if (voucher.amount) {
    discount = voucher.amount;
  }
  if (discount > eligibleTotal) discount = eligibleTotal;

  return { valid: true, discount };
}