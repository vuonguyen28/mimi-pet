"use client";
import React, { useEffect, useState } from "react";
import { Products } from "../types/productD";
import ProductItem from "../components/ProductItem";
import styles from "../styles/productitem.module.css";
import Pagination from "../components/Pagination";
import { getFavoritesByUser, removeFavorite as removeFavoriteServer } from "../services/favoritesService";

const PRODUCTS_PER_PAGE = 16;

const FavoritePage = () => {
  const [favorites, setFavorites] = useState<Products[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Xác định đăng nhập hay chưa
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let userId: string | null = null;
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userId = userObj._id || userObj.id;
    } catch {}
  }
  const isLoggedIn = !!userId && !!token;

  // Lấy danh sách favorites dựa theo trạng thái đăng nhập
  useEffect(() => {
    const fetchFavorites = async () => {
      if (isLoggedIn && userId && token) {
        try {
          const data = await getFavoritesByUser(userId, token);
          setFavorites(data);
        } catch {
          setFavorites([]);
        }
      } else {
        const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(stored);
      }
    };
    fetchFavorites();
    // Lắng nghe sự kiện favoriteChanged/userChanged để tự động load lại
    window.addEventListener("favoriteChanged", fetchFavorites);
    window.addEventListener("userChanged", fetchFavorites);
    return () => {
      window.removeEventListener("favoriteChanged", fetchFavorites);
      window.removeEventListener("userChanged", fetchFavorites);
    };
  }, [isLoggedIn, userId, token]);

  // Xóa khỏi yêu thích
  const handleRemoveFavorite = async (id: string) => {
    if (isLoggedIn && userId && token) {
      try {
        await removeFavoriteServer(id, userId, token);
        setFavorites((prev) => prev.filter((p) => ((p._id ?? p.id)?.toString() !== id)));
        window.dispatchEvent(new Event("favoriteChanged"));
      } catch {}
    } else {
      const updated = favorites.filter((p) => ((p._id ?? p.id)?.toString() !== id));
      setFavorites(updated);
      localStorage.setItem("favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoriteChanged"));
    }
  };

  // Phân trang
  const totalPages = Math.ceil(favorites.length / PRODUCTS_PER_PAGE);
  const pagedFavorites = favorites.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

 return (
  <div className={styles.container_product}>
    <h1 className={styles.tittleyt}>Danh sách yêu thích của bạn</h1>
    {favorites.length === 0 ? (
       <div className={styles.emptyFavorite}>
    <img
      src="http://localhost:3000/images/fvr.jpg" // Đường dẫn ảnh của bạn
      alt="Danh sách yêu thích trống"
      style={{ width: 250, height: "auto", marginBottom: 16 }}
    />
    <p>Không có sản phẩm nào trong danh sách yêu thích.</p>
  </div>
    ) : (
      <>
        <div className={styles.products}>
          {pagedFavorites.map((product) => (
            <ProductItem key={product._id ?? product.id} product={product} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </>
    )}
  </div>
);
};

export default FavoritePage;