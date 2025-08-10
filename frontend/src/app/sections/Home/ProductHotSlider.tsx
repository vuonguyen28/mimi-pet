"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

import slideStyles from "@/app/styles/productitemslide.module.css"; // <-- slide-specific CSS
import itemStyles from "@/app/styles/productitem.module.css";      // <-- section/container CSS
import ProductItemSlide from "../../components/ProductItemSlide";
import { Products } from "../../types/productD";


type ProductHotSliderProps = {
  props: {
    title: string;
    products: Products[];
  };
};

export default function ProductHotSlider({ props }: ProductHotSliderProps) {
  const { title, products } = props;

  return (
    <section>
      <div className={itemStyles.container_product}>
        <p className={itemStyles.tieude}>{title}</p>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 1 },
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className={itemStyles.gb_products}
        >
          {products.map((product) => (
             <SwiperSlide key={product._id} className={slideStyles.slide}>
              <ProductItemSlide product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}