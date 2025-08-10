"use client";

import { useEffect, useState } from "react";
import Banner from "./sections/Home/Banner";
import ProductList from "./sections/Home/ProductList";
import { Products } from "./types/productD";
import { Category } from "./types/categoryD";

import { getProducts, getProductsNew, getProductsHot } from "./services/productService";
import { getCategories } from "./services/categoryService";
import ProductSlider from "./sections/Home/ProductSlider";
import ProductCollection from "./sections/Home/ProductCollection";
import ServiceSection from "./sections/Home/ServiceSection";
import ProductNew from "./sections/Home/ProductNew";
import ProductHotSlider from "./sections/Home/ProductHotSlider";
import BearStories from "./sections/Home/BearStories";


import VoucherList from "./components/VoucherList";
import LuckyWheel from "./components/LuckyWheel";

export default function HomePage() {
  const [products, setProducts] = useState<Products[]>([]);
  const [newProducts, setNewProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotProducts, setHotProducts] = useState<Products[]>([]);
  const [showBannerPopup, setShowBannerPopup] = useState(true);
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    getProducts()
      .then(data => {
        // Lọc lại sản phẩm còn hàng (ít nhất 1 variant quantity > 0)
        const filtered = data.filter(product =>
          Array.isArray(product.variants)
            ? product.variants.some(variant => Number(variant.quantity) > 0)
            : Number(product.quantity) > 0
        );
        const sorted = filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setProducts(sorted);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getProductsNew()
      .then(data => setNewProducts(data))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error("Lỗi khi lấy danh mục:", err));
  }, []);

  useEffect(() => {
    getProductsHot()
      .then(data => setHotProducts(data))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main>
      {/* Banner dạng popup */}
      {showBannerPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowBannerPopup(false)}
        >
          <div
            style={{
              position: "relative",
              background: "#fff",
              boxShadow: "0 4px 24px #ffd6e0",
              overflow: "hidden",
              cursor: "pointer",
              maxWidth: 900,
              width: "100vw",
            }}
            onClick={e => {
              e.stopPropagation(); // Không tắt popup khi click vào banner
              setShowBannerPopup(false);
              setShowWheel(true); // Mở LuckyWheel ngay khi click vào banner
            }}
          >
            {/* Nút X đóng banner */}
      <button
        style={{
          position: "absolute",
          top: 12,
          right: 18,
          background: "rgba(255,255,255,0.8)",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          fontSize: 22,
          color: "#d63384",
          cursor: "pointer",
          zIndex: 10,
          boxShadow: "0 2px 8px #ffd6e0"
        }}
        onClick={e => {
          e.stopPropagation();
          setShowBannerPopup(false); // Chỉ tắt banner, không mở LuckyWheel
        }}
        aria-label="Đóng banner"
      >
        ×
      </button>
            <img
              src="http://localhost:3000/images/bannervqmm.png"
              alt="Vòng quay may mắn"
              style={{ width: "100%", display: "block" }}
            />
          </div>
        </div>
      )}

      {/* LuckyWheel popup */}
      <LuckyWheel visible={showWheel} onClose={() => setShowWheel(false)} />

      <Banner />
      <ProductCollection />
      <VoucherList />
      <ProductNew
        props={{
          title: "Sản phẩm mới",
          description: "Những chú gấu bông hot nhất, đáng yêu nhất, luôn sẵn sàng ôm bạn!",
          products: newProducts,
        }}
      />
      <ProductHotSlider
        props={{
          title: "Sản phẩm hot",
          products: hotProducts,
        }}
      />
      <ProductList
        props={{
          title: "Danh sách",
          category: categories.find((cat) => cat._id === "6837d13c62e4059224b126af"),
          image: "http://localhost:3000/images/bannerTeddy.jpg",
          product: products,
        }}
      />
      <ProductList
        props={{
          title: "Danh sách",
          category: categories.find((cat) => cat._id === "6836bfc58bae817a54d1d17d"),
          product: products,
        }}
      />
      <ServiceSection/>
      <BearStories/>
    </main>
  );
}
