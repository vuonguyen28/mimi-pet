'use client';
import { useAppSelector, useAppDispatch } from '../store/store';
import { clearCart } from '../store/features/cartSlice';
import { CartList } from '../components/CartList';

export default function CartPage() {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  return (
    <CartList
      productList={items}
      onClear={() => dispatch(clearCart())}
    />
  );
}