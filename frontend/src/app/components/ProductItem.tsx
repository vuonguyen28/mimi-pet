'use client';
import React, { useState, useEffect } from "react";
import { Products } from "../types/productD";
import { Variant } from "../types/variantD";
import styles from "../styles/productitem.module.css";
import { useAppDispatch } from "../store/store";
import { addToCart } from "../store/features/cartSlice";
import { useRouter } from "next/navigation";
import { useShowMessage } from "../utils/useShowMessage";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";


export default function ProductItem({ product }: { product: Products }) {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const dispatch = useAppDispatch();
  const { success, error } = useShowMessage("product", "user");
  const router = useRouter();

  // hàm xử lý sản phẩm yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
  const productId = (product._id ?? product.id)?.toString();
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


  const prices = hasVariants
    ? product.variants.map((v) => Number(v.price) || 0)
    : [Number(product.price) || 0];

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // NEW: Lấy giá của variant đã chọn (nếu có)
  const selectedPrice = hasVariants
    ? Number(product.variants[selectedIdx]?.price) || 0
    : Number(product.price) || 0;

  const handleAddToCart = () => {
    const selectedVariant = hasVariants ? product.variants[selectedIdx] : undefined;
    const safeProduct = {
      ...product,
      createdAt: new Date(product.createdAt).toISOString(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
    };
    dispatch(addToCart({ product: safeProduct, selectedVariant }));
    success("Đã thêm vào giỏ hàng!");
    // Chuyển hướng đến trang GH sau khi thêm sp
    setTimeout(() => {
      router.push('/cart');
    }, 300);
  };

    // Xác định người dùng đã đăng nhập chưa
    let userId: string | null = null;
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userId = userObj._id || userObj.id;
        } catch {}
      }
  const isLoggedIn = !!userId && !!token;

  // Load trạng thái yêu thích
useEffect(() => {
  if (isLoggedIn && userId && token) {
    fetch(`http://localhost:3000/favorites?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((favList) => {
        setIsFavorite(favList.some((item: Products) => ((item._id ?? item.id)?.toString() === productId)));
      });
  } else {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const exists = favorites.some((item: Products) => ((item._id ?? item.id)?.toString() === productId));
    setIsFavorite(exists);
  }
}, [productId, isLoggedIn, userId, token]);

  // thêm sản phẩm vào yêu thích 
const addFavorite = async (productId: string, userId: string, token: string) => {
  await fetch("http://localhost:3000/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, userId }),
  });
};

// xóa sản phẩm yêu thích 
const removeFavorite = async (productId: string, userId: string, token: string) => {
  await fetch(`http://localhost:3000/favorites/${productId}?userId=${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// xử lý thêm/xóa yêu thích + thông báo
const toggleFavorite = async () => {
  if (isLoggedIn && userId && token) {
    if (isFavorite) {
      await removeFavorite(productId, userId, token);
      setIsFavorite(false);
      error("Đã xóa khỏi yêu thích");
    } else {
      await addFavorite(productId, userId, token);
      setIsFavorite(true);
      success("Đã thêm vào yêu thích");
    }
    window.dispatchEvent(new Event("favoriteChanged"));
  } else {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const exists = favorites.some((item: Products) => ((item._id ?? item.id)?.toString() === productId));
    let updatedFavorites;
    if (exists) {
      updatedFavorites = favorites.filter((item: Products) => ((item._id ?? item.id)?.toString() !== productId));
      setIsFavorite(false);
      error("Đã xóa khỏi yêu thích");
    } else {
      updatedFavorites = [...favorites, product];
      setIsFavorite(true);
      success("Đã thêm vào yêu thích");
    }
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    window.dispatchEvent(new Event("favoriteChanged"));
  }
};



  return (
    <div className={styles.product}>
      <div className={styles.image_wrapper}>
        <span
    className={styles.heartIcon}
    onClick={(e) => {
      e.preventDefault();
      toggleFavorite();
    }}
  >
    {isFavorite ? (
      <HeartFilled style={{ color: "red", fontSize: 22 }} />
    ) : (
      <HeartOutlined style={{ fontSize: 22 }} />
    )}
  </span>

        <a href={`/products/${product._id}`}>
          <div className={styles.image_link}>
            <img src={`http://localhost:3000/images/${product.images[0]}`} alt={product.name} />
            <img
              src={`http://localhost:3000/images/${product.images[1]}`}
              className={styles.image_hover}
              alt={`${product.name} Hover`}
            />
            <img
              src="http://localhost:3000/images/logoXP.png"
              className={styles.logo_left}
              alt="Logo"
            />
            <div className={styles.saleTag}>30%</div>
          </div>
        </a>

        <button className={styles.buy_now_btn} onClick={handleAddToCart}>
          <img
            src="http://localhost:3000/images/button.png"
            className={styles.bear_left}
            alt="Bear Left"
          />
          MUA NGAY
          <img
            src="http://localhost:3000/images/button.png"
            className={styles.bear_right}
            alt="Bear Right"
          />
        </button>
      </div>

      <a href={`/products/${product._id}`}>
        <p className={styles.product_name}>{product.name}</p>
      </a>

      <div className={styles.prices_sale}>
        <div className={styles.price}>
          {selectedPrice.toLocaleString("vi-VN")} đ
        </div>
        {/* Nếu có nhiều biến thể và giá khác nhau thì hiển thị giá cũ */}
        {hasVariants && minPrice !== maxPrice && (
          <div className={styles.price_sale}>
            {maxPrice.toLocaleString("vi-VN")} đ
          </div>
        )}  
      </div>

      {/* Size chỉ hiển thị nếu có variants */}
      {hasVariants && (
        <div className={styles.sizes}>
          {product.variants.map((variant, idx) => (
            <span
              key={variant.size}
              className={`${styles.size_box} ${idx === selectedIdx ? styles.active : ""}`}
              onClick={() => setSelectedIdx(idx)}
            >
              {variant.size}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}