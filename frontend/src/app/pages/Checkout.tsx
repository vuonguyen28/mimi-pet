import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Checkout = () => {
  const [product, setProduct] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const productId = query.get("productId");

  useEffect(() => {
    if (productId) {
      fetch(`http://localhost:3000/products/${productId}`)
        .then(res => res.json())
        .then(data => setProduct({ ...data, price: 0, quantity: 1 }));
    }
  }, [productId]);

  if (!product) return <div>Đang tải sản phẩm...</div>;

  return (
    <div>
      <h2>Đơn hàng (1 sản phẩm)</h2>
      <img src={product.images} alt={product.name} style={{ width: 80 }} />
      <p>Tên sản phẩm: {product.name}</p>
      <p>Số lượng: {product.quantity}</p>
      <p>Giá: {product.price}đ</p>
      {/* ...các phần còn lại... */}
    </div>
  );
};

export default Checkout;