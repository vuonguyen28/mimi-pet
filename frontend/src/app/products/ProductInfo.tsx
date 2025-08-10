"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/productsDetail.module.css";
import { Products } from "../types/productD";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { addFavorite, removeFavorite } from "../services/favoritesService";

import { useAppDispatch } from "../store/store";
import { addToCart } from "../store/features/cartSlice";
import { App } from "antd";
import { useRouter } from "next/navigation";
import { useShowMessage } from "../utils/useShowMessage";

const ProductInfo = ({ product }: { product: Products }) => {
  const variants = product.variants ?? [];
  const [activeSize, setActiveSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const productId = (product._id ?? product._id)?.toString();
  const { error, success } = useShowMessage();

  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let userId: string | null = null;
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userId = userObj._id || userObj.id;
    } catch {}
  }
  const isLoggedIn = !!userId && !!token;

  useEffect(() => {
    if (isLoggedIn && userId && token) {
      // Kiểm tra từ backend
      fetch(`http://localhost:3000/favorites?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((favList) => {
          setIsFavorite(
            favList.some(
              (item: Products) =>
                (item._id ?? item.id)?.toString() === productId
            )
          );
        });
    } else {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const exists = favorites.some(
        (item: Products) => (item._id ?? item.id)?.toString() === productId
      );
      setIsFavorite(exists);
    }
  }, [productId, isLoggedIn, userId, token]);

  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const router = useRouter();

  useEffect(() => {
    // Đọc tham số size từ URL nếu có
    const params = new URLSearchParams(window.location.search);
    const sizeParam = params.get("size");
    if (sizeParam) {
      const idx = variants.findIndex((v) => v.size === sizeParam);
      if (idx !== -1) setActiveSize(idx);
    }
    // eslint-disable-next-line
  }, [variants]);

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
      const exists = favorites.some(
        (item: Products) => (item._id ?? item.id)?.toString() === productId
      );
      let updatedFavorites;
      if (exists) {
        updatedFavorites = favorites.filter(
          (item: Products) => (item._id ?? item.id)?.toString() !== productId
        );
        setIsFavorite(false);
        success("Đã xóa khỏi yêu thích");
      } else {
        updatedFavorites = [...favorites, product];
        setIsFavorite(true);
        success("Đã thêm vào yêu thích");
      }
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      window.dispatchEvent(new Event("favoriteChanged"));
    }
  };
  const currentVariant = variants[activeSize];

  // Hàm chuẩn hóa ngày khi dispatch vào Redux
  function toSerializableProduct(product: Products): Products {
    return {
      ...product,
      createdAt: new Date(product.createdAt).toISOString(),
      updatedAt: product.updatedAt
        ? new Date(product.updatedAt).toISOString()
        : undefined,
    };
  }

  const handleAddToCart = (redirectToCart: boolean = false) => {
    if (!currentVariant) return;
    const safeProduct = toSerializableProduct(product);
    for (let i = 0; i < quantity; ++i) {
      dispatch(
        addToCart({ product: safeProduct, selectedVariant: currentVariant })
      );
    }
    success("Đã thêm vào giỏ hàng.");
    if (redirectToCart) {
      setTimeout(() => {
        router.push("/cart");
      }, 350);
    }
  };

  // Hàm xử lý khi nhấn nút "Mua ngay"
  //sp chi tiết tới trang thanh toán
  const handleBuyNow = () => {
    if (!currentVariant) return;

    const safeProduct = toSerializableProduct(product);
    const buyNowItem = {
      product: safeProduct,
      selectedVariant: currentVariant,
      quantity: quantity,
    };

    localStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
    success("Chuyển sang trang thanh toán...");
    setTimeout(() => {
      router.push("/checkout?buyNow=1");
    }, 350);
  };

  return (
    <div className={styles.productInfo_v3_noCard}>
      <div className={styles.productDetail_innerWrap}>
        <div className={styles.titleRow}>
          <span className={styles.productTitle}>{product.name}</span>
          <span
            className={styles.heartIcon}
            title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            onClick={toggleFavorite}
          >
            {isFavorite ? (
              <HeartFilled style={{ color: "red" }} />
            ) : (
              <HeartOutlined />
            )}
          </span>
        </div>
        <div className={styles.productPrice}>
          {currentVariant
            ? `${currentVariant.price.toLocaleString("vi-VN")} đ`
            : "Liên hệ"}
        </div>
        <div className={styles.productSizeNote}>
          Kích thước:
          {variants.map((v, i) => (
            <span
              key={v.size}
              className={`${styles.btnSize} ${
                activeSize === i ? styles.btnSize_active : ""
              }`}
              onClick={() => setActiveSize(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveSize(i);
              }}
            >
              {v.size}
            </span>
          ))}
        </div>

        <table className={styles.productTable}>
          <thead>
            <tr>
              <th>Kích thước</th>
              <th>Giá SP</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, idx) => (
              <tr
                key={v.size}
                className={idx === activeSize ? styles.activeRow : ""}
              >
                <td>{v.size}</td>
                <td className={styles.price}>
                  {v.price.toLocaleString("vi-VN")} đ
                </td>
                <td>
                  {idx === activeSize && (
                    <span style={{ color: "#0a0" }}>Đang chọn</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.buyRow}>
          <div className={styles.quantity_v4}>
            <button
              className={styles.quantity_v4_button}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <input
              className={styles.quantity_v4_input}
              type="text"
              value={quantity}
              readOnly
            />
            <button
              className={styles.quantity_v4_button}
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
          <button
            className={styles.addToCart_v4}
            onClick={() => handleAddToCart(true)}
          >
            THÊM VÀO GIỎ HÀNG
          </button>
        </div>

        <div className={styles.phoneBuy}>
          <a href="https://zalo.me/0373828100" className={styles.phone_v4}>
            <img
              src="https://img.icons8.com/material-outlined/24/ffffff/phone--v1.png"
              className={styles.phoneIcon}
              alt="Icon điện thoại"
            />
            0373828100
          </a>
          <button className={styles.buyNow_v4} onClick={handleBuyNow}>
            MUA NGAY
          </button>
        </div>

        <div className={styles.productBadges}>
          <span>100% bông trắng tinh khiết</span>
          <span>100% ảnh thực bản quyền Bemori</span>
          <span>Bảo hành dưỡng chỉ trọn đời</span>
          <span>Nén gấu bông nhỏ gọn</span>
        </div>

        <hr className={styles.infoDivider} />

        <div className={styles.productSection}>
          <div className={styles.sectionTitle}>ĐẶC ĐIỂM NỔI BẬT</div>
          <ul className={styles.productSection_ul}>
            <li>Chất liệu mềm mại, đảm bảo an toàn</li>
            <li>Bông polyester 3D trắng cao cấp, đàn hồi cao</li>
            <li>Đường may tỉ mỉ, chắc chắn</li>
            <li>Đa dạng kích thước</li>
            <li>Màu sắc tươi tắn</li>
          </ul>
        </div>

        <div className={styles.productSection_khuyenmai}>
          <div className={styles.sectionTitle}>ĐẶC BIỆT</div>
          <ul className={styles.productSection_ul}>
            <li>
              Bạn có thể thử vận may của mình sau khi mua hàng tại MiMi Bear
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
