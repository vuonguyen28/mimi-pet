import { Products } from "./productD";
import { Variant } from "./variantD";

export interface CartItem {
  product: Products;
  quantity: number;
  selectedVariant?: Variant; // Thêm dòng này
}