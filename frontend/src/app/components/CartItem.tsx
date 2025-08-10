'use client';
import React, { useState } from 'react';
import { CartItem as CartItemType } from '@/app/types/cartD';
import styles from '@/app/styles/cart.module.css';
import { useAppDispatch } from "../store/store";
import { updateQuantity, removeFromCart, updateVariant } from "../store/features/cartSlice";
import { Popconfirm, Button } from 'antd';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const dispatch = useAppDispatch();
  const { product, quantity, selectedVariant } = item;
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const currentSize = selectedVariant?.size || '';
  const [showPop, setShowPop] = useState(false);
  const [showOverPop, setShowOverPop] = useState(false);

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = e.target.value;
    const newVariant = product.variants.find(v => v.size === newSize);
    if (!newVariant) return;
    dispatch(updateVariant({
      _id: product._id,
      oldSize: currentSize,
      newVariant,
    }));
  };

  const price = selectedVariant ? selectedVariant.price : product.price;

  return (
    <tr>
      <td className={styles.product}>
        <a href={`/products/${product._id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={`http://localhost:3000/images/${product.images[0]}`} alt={product.name} className={styles.productImg} />
          </div>
          <p>{product.name}</p>
        </a>
      </td>
      <td>
        {hasVariants ? (
          <select value={currentSize} onChange={handleSizeChange} className={styles.sizeSelect}>
            {product.variants.map((v) => (
              <option value={v.size} key={v.size}>{v.size}</option>
            ))}
          </select>
        ) : (
          <span>-</span>
        )}
      </td>
      <td className={styles.price}>
        <span>
          {Number(price).toLocaleString('vi-VN')} đ
        </span>
      </td>
      <td className={styles.quantity}>
        <div className={styles.quantityControls}>
          {quantity > 1 ? (
            <button
              onClick={() =>
                dispatch(updateQuantity({ _id: product._id, quantity: quantity - 1, size: currentSize }))
              }
            >-</button>
          ) : (
            <Popconfirm
              title="Xóa sản phẩm"
              description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => dispatch(removeFromCart({ _id: product._id, size: currentSize }))}
              onCancel={() => setShowPop(false)}
              open={showPop}
              onOpenChange={(visible) => setShowPop(visible)}
              okButtonProps={{ style: { background: "#ea4c89", borderColor: "#ea4c89" } }}
              cancelButtonProps={{ style: { color: "#ea4c89", borderColor: "#ea4c89", background: "#fff0fa" } }}
            >
              <button
                onClick={() => setShowPop(true)}
              >-</button>
            </Popconfirm>
          )}
          <input type="text" value={quantity} readOnly />
          <Popconfirm
            title="Số lượng tối đa"
            description="Bạn đã đạt số lượng tối đa cho sản phẩm này!"
            okText="Đã hiểu"
            showCancel={false}
            open={showOverPop}
            onOpenChange={(visible) => {
              if (!visible) setShowOverPop(false); // Đóng thì reset về false
            }}
            onConfirm={() => setShowOverPop(false)}
          >
            <button
              onClick={() => {
                const maxQuantity =
                  hasVariants && selectedVariant
                    ? selectedVariant.quantity
                    : product.quantity;
                if (typeof maxQuantity === "number" && quantity >= maxQuantity) {
                  setShowOverPop(true);
                  return;
                }
                dispatch(
                  updateQuantity({
                    _id: product._id,
                    quantity: quantity + 1,
                    size: currentSize,
                  })
                );
              }}
            >
              +
            </button>
          </Popconfirm>
        </div>
      </td>
      <td className={styles.totalPrice}>
        {(Number(price) * quantity).toLocaleString('vi-VN')} đ
      </td>
      <td className={styles.remove}>
        <button onClick={() => dispatch(removeFromCart({ _id: product._id, size: currentSize }))}>
          Xóa
        </button>
      </td>
    </tr>
  );
}