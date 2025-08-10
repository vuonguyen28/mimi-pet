import { Products } from "../types/productD";
import { Variant } from "../types/variantD";
import { Category } from "../types/categoryD";

/**
 * Lấy danh sách sản phẩm
 */
export const getProducts = async (): Promise<Products[]> => {
  const res = await fetch("http://localhost:3000/products");
  if (!res.ok) throw new Error("Lỗi khi tải sản phẩm");
  const data = await res.json();

  // Log quantity của từng variant
  (data as Products[]).forEach(product => {
    if (Array.isArray(product.variants)) {
      console.log(`Sản phẩm: ${product.name}`);
      product.variants.forEach((variant: any, idx: number) => {
        console.log(`  Variant ${idx}: quantity =`, variant.quantity);
      });
    } else {
      console.log(`Sản phẩm: ${product.name} - quantity =`, product.quantity);
    }
  });

  // Lọc sản phẩm có ít nhất 1 variant còn hàng
  const filtered = (data as Products[]).filter(product =>
    Array.isArray(product.variants)
      ? product.variants.some(variant => Number(variant.quantity) > 0)
      : Number(product.quantity) > 0
  );
  console.log("Sản phẩm sau khi lọc:", filtered);
  return filtered;
};

//  * Lấy chi tiết một sản phẩm theo id
//  
export async function getDetail(id: string): Promise<Products | null> {
  try {
    const res = await fetch(`http://localhost:3000/products/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
 
    const product: Products = {
      _id: typeof data._id === "string" ? data._id : (typeof data.id === "string" ? data.id : ""),
      name: typeof data.name === "string" ? data.name : "",
      description: typeof data.description === "string" ? data.description : "",
      images: Array.isArray(data.images) ? data.images : [],
      categoryId: data.categoryId && typeof data.categoryId === "object" ? data.categoryId : null,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      variants: Array.isArray(data.variants) ? data.variants : [],
      sold: typeof data.sold === "number" ? data.sold : 0,
      image: undefined,
      price: 0
    };
    return product;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

// Sản phẩm mới
export const getProductsNew = async (): Promise<Products[]> => {
  const res = await fetch("http://localhost:3000/products");
  if (!res.ok) throw new Error("Lỗi khi tải sản phẩm mới");

  const data = await res.json();
  // Lọc sản phẩm có ít nhất 1 variant còn hàng
  const filtered = (data as Products[]).filter(product =>
    Array.isArray(product.variants)
      ? product.variants.some(variant => Number(variant.quantity) > 0)
      : Number(product.quantity) > 0
  );
  const sorted = filtered
    .map(product => ({
      ...product,
      createdAt: new Date(product.createdAt),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const latestProducts = sorted.slice(0, 8);
  return latestProducts;
};

// Sản phẩm hot
export const getProductsHot = async (): Promise<Products[]> => {
  const res = await fetch("http://localhost:3000/products");
  if (!res.ok) throw new Error("Lỗi khi tải sản phẩm hot");

  const data = await res.json();
  // Lọc sản phẩm có ít nhất 1 variant còn hàng
  const filtered = (data as Products[]).filter(product =>
    Array.isArray(product.variants)
      ? product.variants.some(variant => Number(variant.quantity) > 0)
      : Number(product.quantity) > 0
  );
  const sorted = filtered
    .map(product => ({
      ...product,
      createdAt: new Date(product.createdAt),
    }))
    .sort((a, b) => b.sold - a.sold);

  const topSoldProducts = sorted.slice(0, 8);
  return topSoldProducts;
};

// Thêm hàm mới
export const getProductsByCategory = async (categoryId: string): Promise<Products[]> => {
  const res = await fetch(`http://localhost:3000/products?idcate=${categoryId}`);
  if (!res.ok) throw new Error("Lỗi khi tải sản phẩm theo danh mục");
  return await res.json();
};
//lấy sản phẩm theo danh mục con
export const getProductsBySubCategory = async (subCategoryId: string): Promise<Products[]> => {
  const res = await fetch(`http://localhost:3000/products?idsubcate=${subCategoryId}`);
  if (!res.ok) throw new Error("Lỗi khi tải sản phẩm theo danh mục con");
  return await res.json();
};