'use client';
import styles from "@/app/styles/cart.module.css";
import { CartItem as CartItemType } from "../types/cartD";
import { useRouter } from "next/navigation"; // Thêm dòng này

interface CartSummaryProps {
  productList: CartItemType[];
  onClear: () => void;
}

export default function CartSummary({ productList, onClear }: CartSummaryProps) {
  const router = useRouter(); // Thêm dòng này

  if (!productList.length) return null;

  const total = productList.reduce(
    (sum, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
      return sum + price * item.quantity;
    },
    0
  );

  return (
    <div>
      <div className={styles.cartTotal}>
        <b>Tổng cộng: {total.toLocaleString('vi-VN')} đ</b>
      </div>
      {/* <button onClick={onClear} className={styles.clearCartBtn}>
        Xóa tất cả
      </button> */}
      <button className={styles.buyBtn} onClick={() => router.push("/checkout")}>
        Thanh toán
      </button>
    </div>
  );
}