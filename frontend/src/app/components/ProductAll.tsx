import { Products } from "../types/productD";
import styles from "../styles/productitem.module.css";
import Link from "next/link";
import { Category } from "../types/categoryD";
import ProductItem from "./ProductItem";

// Component con hiển thị từng sản phẩm


// Component cha hiển thị danh sách sản phẩm
export default function ProductAll({
  props,
}: {
  props: {
    title: string;
    image?: string;
    category?: Category[];
    product: Products[];
  };
}) {
  return (
    <section>
      <div className={styles.container_product}>
        <p className={styles.tieude}>{props.title}</p>

        {/* Ảnh nếu có */}
        {props.image && (
          <div className={styles["img_category_product"]}>
            <img src={props.image} alt="Category" />
          </div>
        )}

        {/* Hiển thị tất cả sản phẩm */}
        <div className={styles.products}>
          {props.product.map((p: Products) => (
            <ProductItem product={p} key={p._id} />
          ))}
        </div>
      </div>
    </section>
  );
}