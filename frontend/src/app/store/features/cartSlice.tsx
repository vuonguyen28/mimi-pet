import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/app/types/cartD';
import { Products } from '@/app/types/productD';
import { Variant } from '@/app/types/variantD';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Products; selectedVariant?: Variant }>
    ) => {
      const { product, selectedVariant } = action.payload;
      if (!product._id) return;

      const existingItem = state.items.find(
        (item) =>
          item.product._id === product._id &&
          (item.selectedVariant?.size || '') === (selectedVariant?.size || '')
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          product: {
            ...product,
            // Ép ngày về string để không cảnh báo serialize
            createdAt: new Date(product.createdAt).toISOString(),
            updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
          },
          selectedVariant,
          quantity: 1,
        });
      }
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ _id: string; size?: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.product._id === action.payload._id &&
            (item.selectedVariant?.size || '') === (action.payload.size || '')
          )
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number; size?: string }>
    ) => {
      const item = state.items.find(
        (item) =>
          item.product._id === action.payload._id &&
          (item.selectedVariant?.size || '') === (action.payload.size || '')
      );
      if (item) {
        item.quantity = action.payload.quantity > 0 ? action.payload.quantity : 1;
      }
    },
    updateVariant: (
      state,
      action: PayloadAction<{
        _id: string;
        oldSize?: string;
        newVariant: Variant;
      }>
    ) => {
      const idx = state.items.findIndex(
        (item) =>
          item.product._id === action.payload._id &&
          (item.selectedVariant?.size || '') === (action.payload.oldSize || '')
      );
      if (idx === -1) return;
      const existing = state.items.find(
        (item) =>
          item.product._id === action.payload._id &&
          (item.selectedVariant?.size || '') === action.payload.newVariant.size
      );
      if (existing) {
        existing.quantity += state.items[idx].quantity;
        state.items.splice(idx, 1);
      } else {
        state.items[idx].selectedVariant = action.payload.newVariant;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateVariant,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;