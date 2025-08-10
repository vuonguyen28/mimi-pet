"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts, getProductsByCategory, getProductsBySubCategory, getProductsNew } from "../services/productService";
import { Products } from "../types/productD";
import ProductList from "../components/ProductAll";
import InstagramSection from "../components/InstagramSection";
import styles from "../styles/productitem.module.css";
import Pagination from "../components/Pagination";
import { getCategories } from "../services/categoryService";
import { Category } from "../types/categoryD";

const PRODUCTS_PER_PAGE = 16;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const priceFilterParam = searchParams.get("price") || "Tất cả";
  const sortParam = searchParams.get("sort") || "Mới nhất";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const categoryId = searchParams.get("category") || "";
  const subCategoryId = searchParams.get("subcategory") || "";

  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const isNewProductsPage = searchParams.get("new") === "true";

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (pageParam !== 1 && !isNewProductsPage) {
      updateQuery({ page: 1 });
    }
    // eslint-disable-next-line
  }, [searchQuery]);

  useEffect(() => {
    async function fetchData() {
      try {
        let data: Products[] = [];
        if (isNewProductsPage) {
          data = await getProductsNew();
        } else if (subCategoryId) {
          data = await getProductsBySubCategory(subCategoryId);
        } else if (categoryId) {
          data = await getProductsByCategory(categoryId);
        } else {
          data = await getProducts();
        }
        setProducts(data);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    fetchData();
    // eslint-disable-next-line
  }, [categoryId, subCategoryId, searchParams]);

  function filterByPrice(product: Products) {
    const min = Math.min(...product.variants.map((v) => v.price));
    switch (priceFilterParam) {
      case "Dưới 300.000 đ":
        return min < 300000;
      case "Từ 300.000 đ - 500.000 đ":
        return min >= 300000 && min <= 500000;
      case "Từ 500.000 đ - 1.000.000 đ":
        return min > 500000 && min <= 1000000;
      case "Từ 1.000.000 đ - 2.000.000 đ":
        return min > 1000000 && min <= 2000000;
      case "Từ 2.000.000 đ - 3.000.000 đ":
        return min > 2000000 && min <= 3000000;
      default:
        return true;
    }
  }

  function filterBySearch(product: Products) {
    const nameMatch = product.name.toLowerCase().includes(searchQuery);
    const descMatch = product.description?.toLowerCase().includes(searchQuery) || false;
    return nameMatch || descMatch;
  }

  function sortProducts(list: Products[]) {
    if (sortParam === "Mới nhất") {
      return [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sortParam === "Giá : Thấp đến cao") {
      return [...list].sort(
        (a, b) =>
          Math.min(...a.variants.map((v) => v.price)) -
          Math.min(...b.variants.map((v) => v.price))
      );
    }
    if (sortParam === "Giá : Cao đến thấp") {
      return [...list].sort(
        (a, b) =>
          Math.min(...b.variants.map((v) => v.price)) -
          Math.min(...a.variants.map((v) => v.price))
      );
    }
    return list;
  }

// chỉ ra sản phẩm mới nhất
  const filtered = isNewProductsPage
    ? products
    : sortProducts(
        products.filter(
          (product) => filterByPrice(product) && filterBySearch(product)
        )
      );

  const pagedProducts = isNewProductsPage
    ? filtered
    : filtered.slice(
        (pageParam - 1) * PRODUCTS_PER_PAGE,
        pageParam * PRODUCTS_PER_PAGE
      );

  const totalPages = isNewProductsPage
    ? 1
    : Math.ceil(filtered.length / PRODUCTS_PER_PAGE);

  const updateQuery = (params: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    router.push(`?${newParams.toString()}`);
  };

  const currentCategory = categories.find(c => c._id === categoryId);

  //  

  return (
    <div>
      {/* Filter Bar */}
      <div className={styles["filter-bar"]}>
        <div
          className={styles["filter-left"]}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-start"
          }}
        >
          <div style={{ width: "100%" }}>
            {/* Lọc giá tiền */}
            <select
              className={styles["filter-select"]}
              value={priceFilterParam}
              onChange={(e) => {
                updateQuery({ price: e.target.value, page: 1 });
              }}
            >
              <option>Tất cả</option>
              <option>Dưới 300.000 đ</option>
              <option>Từ 300.000 đ - 500.000 đ</option>
              <option>Từ 500.000 đ - 1.000.000 đ</option>
              <option>Từ 1.000.000 đ - 2.000.000 đ</option>
              <option>Từ 2.000.000 đ - 3.000.000 đ</option>
            </select>
          </div>
          <div style={{ width: "100%" }}>
            {/* Lọc danh mục + danh mục con */}
            <div style={{ display: "flex", gap: 8 }}>
              <select
                className={styles["filter-select"]}
                value={categoryId}
                onChange={e => {
                  updateQuery({ category: e.target.value, subcategory: "", page: 1 });
                }}
              >
                <option value="">Tất cả danh mục</option>
                {categories
                  .filter(cat => !cat.hidden)
                  .map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
                <select
                  className={styles["filter-select"]}
                  value={subCategoryId}
                  onChange={e => updateQuery({ subcategory: e.target.value, page: 1 })}
                >
                  <option value="">Tất cả danh mục con</option>
                  {currentCategory.subcategories
                    .filter(sub => !sub.hidden)
                    .map(sub => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <div className={styles["filter-right"]}>
          <span className={styles["product-total"]}>{filtered.length} Sản phẩm</span>
          <select
            className={styles["filter-select"]}
            value={sortParam}
            onChange={(e) => {
              updateQuery({ sort: e.target.value, page: 1 });
            }}
          >
            <option>Mới nhất</option>
            <option>Bán chạy nhất</option>
            <option>Giá : Thấp đến cao</option>
            <option>Giá : Cao đến thấp</option>
            <option>% Giảm giá</option>
            <option>Nổi bật</option>
          </select>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <ProductList
        props={{
          title: isNewProductsPage ? " Sản phẩm mới nhất" : "Tất cả sản phẩm",
          product: pagedProducts,
        }}
      />

      {/* Pagination */}
      {!isNewProductsPage && (
        <Pagination
          currentPage={pageParam}
          totalPages={totalPages}
          onPageChange={(page) => updateQuery({ page })}
        />
      )}
      {/* PHẦN INSTAGRAM */}
      <InstagramSection />
    </div>
  );
}