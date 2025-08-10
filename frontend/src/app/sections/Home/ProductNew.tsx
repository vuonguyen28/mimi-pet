"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import styles from "@/app/styles/producthot.module.css";
import itemStyles from "@/app/styles/productitemslide.module.css"; 
import { Products } from "@/app/types/productD";
import ProductItemSlide from "@/app/components/ProductItemSlide";
import { useRouter } from "next/navigation"; // Thêm dòng này

type ProductHotProps = {
  props: {
    title: string;
    description: string;
    products: Products[];
  };
};

export default function ProductNew({ props }: ProductHotProps) {
  const { title, description, products } = props;
  const swiperRef = useRef<any>(null);
  const router = useRouter(); // Thêm dòng này

  return (
    <div className={styles.section}>
      <div className={styles.sliderCol}>
        <div className={styles.sliderHoverWrap}>
          <button
            className={`${styles.slickArrow} ${styles.slickPrev}`}
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Trước"
            type="button"
          >
            <LeftOutlined style={{ fontSize: 28, color: "#fff" }} />
          </button>
          <Swiper
            modules={[Navigation, Autoplay]}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop
            slidesPerView={2}
            spaceBetween={24}
            breakpoints={{
              0: { slidesPerView: 1 },
              700: { slidesPerView: 2 },
            }}
            className={styles.slickCustom}
            navigation={false} // Ẩn navigation mặc định
          >
            {products.map((product, idx) => (
              <SwiperSlide key={`${product._id ?? "prod"}-${idx}`}>
                <ProductItemSlide product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className={`${styles.slickArrow} ${styles.slickNext}`}
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Sau"
            type="button"
          >
            <RightOutlined style={{ fontSize: 28, color: "#fff" }} />
          </button>
        </div>
      </div>
      <div className={styles.contentCol}>
        <h2>
          {title}
          <br />
          {/* <span>{title}</span> */}
        </h2>
        <p>{description}</p>
        <div className={styles.storyActions}>
        {/*  */}
          <button className={styles.btnMain} onClick={() => router.push("/products?new=true")}>
            TÌM HIỂU THÊM &nbsp;→
          </button>
        {/*  */}
        </div>
      </div>
    </div>
  );
}