import { Category, SubCategory } from "./categoryD";
import { Variant } from "./variantD";

export interface Products {
  quantity: any;
  isNew: any;
  id: string;

  _id: string;                         // id dạng string theo JSON bạn nhận
  name: string;
  description: string;
  price: number;
  images: string[];                    // Mảng đường dẫn ảnh
  categoryId: Category;                // Sau khi populate: là 1 object
  createdAt: string | Date;            // Có thể là string (ISO) hoặc Date object
  updatedAt?: string | Date;           // Nên thêm nếu có cập nhật
  variants: Variant[];                 // Mảng biến thể đã populate
  sold: number;
  subcategoryId?: SubCategory[];       // Sản phẩm có thể có hoặc không có
}