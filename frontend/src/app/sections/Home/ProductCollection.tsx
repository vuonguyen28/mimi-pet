import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
import { Category } from "../../types/categoryD";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "@/app/styles/productcollection.module.css";

// Ánh xạ id danh mục => ảnh
const images = [
  "https://bemori.vn/wp-content/uploads/2025/05/thumb-bst-canh-cut-bong.webp",
  "https://bemori.vn/wp-content/uploads/2025/05/thumb-bst-thu-bong-hot-cho-be.webp",
  "https://upload.bemori.vn/Bo-suu-tap-gau-bong/BST-gau-bong-sinh-nhat/thumb-bst-birthday-bear.webp",
  "https://upload.bemori.vn/Bo-suu-tap-gau-bong/BST-bup-be-bong/thumb-bst-bup-be-cho-be.webp",
  "https://upload.bemori.vn/Bo-suu-tap-gau-bong/BST-loopy-trung-thu-2024/thumb-bst-loopy-trung-thu-1.webp",
  "https://bemori.vn/wp-content/uploads/2025/05/thumb-bst-gau-bong-summer-chill.webp",
  "https://bemori.vn/wp-content/uploads/2025/05/thumb-bst-summer-chill.webp",
  "https://bemori.vn/wp-content/uploads/2025/05/thumb-bst-trai-cay.webp",
  "https://bemori.vn/wp-content/uploads/2025/05/thumb-bst-gau-bong-summer-chill.webp",
  // ... thêm các id và ảnh tương ứng nếu cần
];

export default function ProductCollection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Lỗi khi lấy danh mục:", err));
  }, []);

  return (
    <div className={styles.wrapper}>
      <p className={styles.tieude}>Bộ sưu tập gấu bông</p>
      <div className={styles.bangTruot}>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          loop={true}
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
          }}
        >
          {categories
            .filter((cat) => !cat.hidden) // Lọc các danh mục hidden = true ra
            .map((cat, index) => (
              <SwiperSlide key={cat._id}>
                <a href={`products?category=${cat._id}`} className={styles.theSanPham}>
                  <img src={images[index % images.length]} alt={cat.name} />
                  <p className={styles.tenSanPham}>{cat.name}</p>
                </a>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
}
