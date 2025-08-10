'use client';
import styles from "@/app/styles/cart.module.css";
import CartItem from "./CartItem";
import { CartItem as CartItemType } from "../types/cartD";
import CartSummary from "./CartSumMary";

interface CartListProps {
  productList: CartItemType[];
  onClear: () => void;
}

export function CartList({ productList, onClear }: CartListProps) {
  if (!productList.length) {
    return (
      <div className={styles.Cartproduct}>
        <img
          className={styles.nocart}
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMGzE811aPy0b-1J5yeOohUQJRpo9FA5chPw&s"
          alt="No cart"
        />
        <p className={styles.err}>Giỏ hàng của bạn hiện đang trống.</p>
        <a className={styles.link} href="/">TIẾP TỤC MUA SẮM</a>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.h1}>Giỏ hàng</h1>
      <p className={styles.cartQuantityInfo}>
        Sản phẩm trong giỏ hàng <span className={styles.cartQuantityNumber}>{productList.length}</span>
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHeader}>Sản Phẩm</th>
            <th className={styles.tableHeader}>Phân loại</th>
            <th className={styles.tableHeader}>Đơn Giá</th>
            <th className={styles.tableHeader}>Số Lượng</th>
            <th className={styles.tableHeader}>Số Tiền</th>
            <th className={styles.tableHeader}>Thao Tác</th>
          </tr>
        </thead>
        <tbody className={styles.tbody} id="cartList">
          {productList.map((item, idx) => (
            <CartItem
              key={item.product._id + (item.selectedVariant?.size || '') + idx}
              item={item}
            />
          ))}
        </tbody>
      </table>
      <div className={styles.checkout}>
        <CartSummary productList={productList} onClear={onClear} />
      </div>
    </div>
  );
}