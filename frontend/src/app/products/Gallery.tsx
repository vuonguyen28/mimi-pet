"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "../styles/productsDetail.module.css";

type Props = {
  images: string[];
};

const Gallery: React.FC<Props> = ({ images }) => {
  const [current, setCurrent] = useState<number>(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);


  // Khi chuyển ảnh chính, cuộn thumbnail
  useEffect(() => {
    const currentImg = imageRefs.current[current];
    if (currentImg) {
      currentImg.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [current]);

  const nextImage = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  if (images.length === 0) return <p>Không có ảnh sản phẩm</p>;

  return (
    <div className={styles.product_img_container}>
      {/* Ảnh lớn */}
      <div className={styles.product_img_main}>
        <button onClick={prevImage} className={styles.prevBtn}>←</button>
        <img
          src={images[current]}
          alt={`Ảnh sản phẩm ${current + 1}`}
          className={styles.product_img}
        />
        <button onClick={nextImage} className={styles.nextBtn}>→</button>
      </div>

      {/* Ảnh nhỏ */}
      <div className={styles.thumbnail_wrapper}>
        
        <div className={styles.product_img_thumbnails} ref={thumbnailsRef}>
          {Array.isArray(images) && images.length > 1 &&
            images.map((img, idx) => (
              <img
                key={img + idx}
                ref={(el) => {
                  if (el) imageRefs.current[idx] = el;
                }}
                className={`${styles.thumb} ${idx === current ? styles.thumb_active : ""}`}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                onClick={() => setCurrent(idx)}
              />
            ))
          }
         
        </div>
      </div>
    </div>
  );
};

export default Gallery;
