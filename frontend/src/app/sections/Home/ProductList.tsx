"use client";

import { useState } from "react";
import { Products } from "../../types/productD";
import ProductItem from "../../components/ProductItem";
import styles from "@/app/styles/productitem.module.css";
import { Category, SubCategory } from "../../types/categoryD";

export default function ProductList({
  props,
}: {
  props: {
    title: string;
    image?: string;
    category?: Category;
    product: Products[];
  };
}) {
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");

  const subcategories: SubCategory[] = props.category?.subcategories || [];

  const categoryId = props.category?._id || "";

  const filteredProducts =
    activeSubCategory === "all"
      ? props.product
          .filter((p) => {
            // Lọc sản phẩm theo category cha
            if (typeof p.categoryId === "object" && p.categoryId !== null && "_id" in p.categoryId) {
              return p.categoryId._id === categoryId;
            }
            return false;
          })
          .slice(0, 8)
      : props.product
          .filter((p) => {
            // Lọc sản phẩm theo danh mục con
            const sub = p.subcategoryId;
            if (typeof sub === "object" && sub !== null && "_id" in sub) {
              return sub._id === activeSubCategory;
            }
            return false;
          })
          .slice(0, 8);

  const subCategoryId = activeSubCategory !== "all" ? activeSubCategory : "";
  const productPageLink =
    subCategoryId !== ""
      ? `/products?subcategory=${subCategoryId}`
      : `/products?category=${categoryId}`;

  return (
    <section>
      <div className={styles.container_product}>
      <p className={styles.tieude}>
        Danh sách {props.category?.name || "sản phẩm"}
      </p>

        {subcategories.length > 0 && (
          <div className={styles.danhmucgau}>
            <button
              onClick={() => setActiveSubCategory("all")}
              className={activeSubCategory === "all" ? styles.active : ""}
            >
              Tất cả
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() => setActiveSubCategory(sub._id)}
                className={activeSubCategory === sub._id ? styles.active : ""}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {props.image && (
          <div className={styles["img_category_product"]}>
            <img src={props.image} alt="Category" />
          </div>
        )}

        <div className={styles.products}>
          {filteredProducts.map((p: Products) => (
            <ProductItem product={p} key={p._id} />
          ))}
        </div>

        {/* Nút Xem thêm */}
        {categoryId && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <a
              href={productPageLink}
              style={{
textDecoration: "none",
                color: "#E46A67",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Xem thêm &gt;&gt;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}