import { getProducts, getDetail } from "../../services/productService";
import ProductAll from "../../components/ProductAll";
import Gallery from "../Gallery";
import ProductInfo from "../ProductInfo";
import ProductTabs from "../ProductTabs";
import ReviewList from "../ReviewList";
import styles from "../../styles/productsDetail.module.css";
import { Products } from "../../types/productD";
import RelatedProductsSection from '@/app/components/RelatedProductsSection';
import InstagramSection from "@/app/components/InstagramSection";
import ReviewForm from "../ReviewForm";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return null;

  const product = await getDetail(id);
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  // Lấy tất cả sản phẩm
  const allProducts = await getProducts();

 

const currentCategoryId = product.categoryId?._id || product.categoryId;

const relatedProducts = allProducts.filter((p) => {
  const catId = p.categoryId?._id || p.categoryId;
  return p._id !== product._id && catId === currentCategoryId;
});



  return (
    <div className={styles.container_tong}>
      <div className={styles.container_content}>
        <div className={styles.container_v3}>
          <Gallery
            images={
              Array.isArray(product.images)
                ? product.images.map((img) => `http://localhost:3000/images/${img}`)
                : []
            }
          />
          <ProductInfo product={product} />
        </div>
        <div className={styles.content_container_tong}>
           <ProductTabs product={product} />
           <ReviewList productId={product._id} />

        </div>
           <ReviewForm productId={product._id} />
        
      </div>

      {/* --- Sản phẩm liên quan --- */}
        <RelatedProductsSection relatedProducts={relatedProducts}/>
         <InstagramSection />
    </div>
  );
}