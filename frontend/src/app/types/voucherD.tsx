export interface Voucher {
  _id: string; // Có thể có hoặc không nếu dùng cho tạo mới
  discountCode: string;
  percent?: number | null;  // Có thể nullable
  amount?: number | null;   // Có thể nullable
  startDate: string;        // ISO date string
  endDate: string;          // ISO date string
  description?: string;
  targetType: "all" | "category" | "product";
  productIds: string[];     // Danh sách id sản phẩm
  categoryIds: string[];    // Danh sách id danh mục
  minOrderValue?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  used?: number;
  active: boolean;
}