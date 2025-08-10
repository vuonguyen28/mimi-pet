"use client"

import React, { useState } from "react";
import styles from "@/app/styles/productitem.module.css"

const services = [
  {
    title: "Giặt Gấu",
    img: "http://localhost:3000/images/image%2062.png",
    description: `Việc tắm giặt cho các em ý là điều hoàn toàn đơn giản. Bạn chỉ cần cho em đó vào một chiếc vỏ gối hay một chiếc túi vải, cuốn chặt lại, sau đó cho vào máy giặt.
    Sau khi giặt xong, bạn lấy sấy khô hoặc phơi dưới nắng to để đảm bảo em gấu được thơm mùi nắng nhé!`,
    link: "/posts/detail/giat-gau-chuyen-nghiep-cham-soc-gau-yeu",
    linkText: "Xem thêm",
  },
  {
    title: "Bọc Quà - Tặng Thiệp",
    img: "http://localhost:3000/images/thiepmoi.webp",
    description: "Chúng tôi cung cấp dịch vụ bọc quà và tặng thiệp miễn phí cho mọi đơn hàng.",
    link: "/posts/detail/tang-thiep-y-nghia",
    linkText: "Xem thêm",
  },
];

export default function ServiceSection() {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className={styles.thanh_dieu_huong}>
        <h1>DỊCH VỤ TẠI CỬA HÀNG</h1>
        {services.map((service, idx) => (
          <a
            href="#"
            className={active === idx ? styles.active : ""}
            onClick={e => {
              e.preventDefault();
              setActive(idx);
            }}
            key={idx}
          >
            {service.title}
          </a>
        ))}
      </div>
      <div className={styles.hop_noi_dung}>
        <div className={styles.khoi_dich_vu}>
          <div className={styles.cot_hinh_anh}>
            {services[active].img && (
              <img src={services[active].img} alt={services[active].title} />
            )}
          </div>
          <div className={styles.cot_noi_dung}>
            <p>{services[active].description}</p>
            <a href={services[active].link} className={styles.nut_xem_them}>
              {services[active].linkText}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}