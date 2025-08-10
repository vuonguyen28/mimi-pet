import { useEffect, useState } from "react";
import { Products } from "../types/productD";
import ProductAll from "./ProductAll";

interface Props {
  categoryId: string;
  limit?: number;
  title?: string;
}

const CategoryProduct = ({ categoryId, limit, title }: Props) => {
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/products?category=${categoryId}`)
      .then(res => res.json())
      .then(data => {
        setProducts(limit ? data.slice(0, limit) : data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [categoryId, limit]);

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (!products.length) return <div>Không có sản phẩm nào.</div>;

  return (
    <ProductAll
      props={{
        title: title || "Sản phẩm",
        product: products,
      }}
    />
  );
};

export default CategoryProduct;