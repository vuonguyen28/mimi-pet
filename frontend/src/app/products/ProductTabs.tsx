"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/productsDetail.module.css";
import { Products } from "../types/productD";
import { Variant } from "../types/variantD";

type Props = {
  product: Products;
};

const ProductTabs: React.FC<Props> = ({ product }) => {
  const [tab, setTab] = useState("info");
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const variants: Variant[] = product.variants ?? [];

  return (
    <div className={styles.productTabs}>
      <div className={styles.tab_buttons}>
        <button
          className={`${styles.tabBtn} ${
            tab === "info" ? styles.tabBtn_active : ""
          }`}
          onClick={() => setTab("info")}
        >
          THÔNG TIN
        </button>
        <button
          className={`${styles.tabBtn} ${
            tab === "spec" ? styles.tabBtn_active : ""
          }`}
          onClick={() => setTab("spec")}
        >
          THÔNG SỐ
        </button>
        <button
          className={`${styles.tabBtn} ${
            tab === "care" ? styles.tabBtn_active : ""
          }`}
          onClick={() => setTab("care")}
        >
          BẢO QUẢN &amp; GIẶT GẤU
        </button>
      </div>

      {/* THÔNG TIN SẢN PHẨM */}
      <div
        className={`${styles.tabContent} ${
          tab === "info" ? styles.tabContent_active : ""
        }`}
      >
        <h4 className={styles.tabTitle}>THÔNG TIN SẢN PHẨM</h4>
        <p>
          <strong>{product.name}</strong>
        </p>
        <img
          className={styles.productInfoImage}
          src={
            Array.isArray(product.images) && product.images.length > 0
              ? `http://localhost:3000/images/${product.images[0]}`
              : ""
          }
          alt={product.name}
        />

        <div
          ref={contentRef}
          className={styles.productInfoText}
          style={{
            maxHeight: isExpanded ? contentHeight : 140,
            overflow: "hidden",
            transition: "max-height 0.5s ease",
          }}
        >
          <p>
            <strong>Mã sản phẩm:</strong>
            {product._id}
          </p>

          {variants.length > 0 && (
            <>
              <p>
                <strong>Kích Thước & Giá:</strong>
              </p>
              {variants.map((v, idx) => (
                <div key={v.size || idx}>
                  Size: {v.size} – {v.price.toLocaleString("vi-VN")}đ
                </div>
              ))}
            </>
          )}

          <p>
            <strong>Chất liệu:</strong>
            <br />
            Vải bên ngoài: lông thú cao cấp.
            <br />
            Bông nhồi bên trong: 100% bông polyester trắng đàn hồi loại 1.
          </p>
          {Array.isArray(product.images) && product.images.length > 1 && (
            <img
              className={styles.productInfoImage}
              src={`http://localhost:3000/images/${product.images[1]}`}
              alt={product.name}
            />
          )}

          <p>
            <strong>Công dụng:</strong>
            <br />
            Dùng làm gấu ôm, tựa lưng hoặc làm quà tặng. <br />
            Chơi với gấu bông không chỉ giúp tăng tính độc lập, mà còn giúp giảm
            thiểu căng thẳng, điều hòa huyết áp và kích thích sản sinh hormon
            Endorphins. Hormon này có tác dụng đem lại cảm giác vui vẻ, yêu đời,
            tự tin, căng tràn sức sống và kích thích sự sáng tạo.
          </p>
        </div>

        <button className={styles.seeMore} onClick={toggleExpand}>
          {isExpanded ? "THU GỌN NỘI DUNG" : "XEM THÊM NỘI DUNG"}
        </button>
      </div>

      {/* THÔNG SỐ */}
      <div
        className={`${styles.tabContent} ${
          tab === "spec" ? styles.tabContent_active : ""
        }`}
        style={{ display: tab === "spec" ? "block" : "none" }}
      >
        <h4 className={styles.tabTitle}>BẢNG SIZE</h4>
        <table className={styles.tabContent_table}>
          <thead>
            <tr>
              {variants.map((v, idx) => (
                <th key={idx}>Size {idx + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {variants.map((v, idx) => (
                <td key={idx}>{v.size}</td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className={styles.bearInfoBox}>
          <p className={styles.bearInfoTitle}>
            🌟 Hướng dẫn chọn size gấu bông phù hợp
          </p>
          <ul className={styles.bearInfoList}>
            <li>
              <b>Size nhỏ</b> (dưới 30cm): Dễ thương, tiện mang theo, thích hợp
              làm móc khóa, trang trí balo hoặc bàn học.
            </li>
            <li>
              <b>Size vừa</b> (30-60cm): Phù hợp làm quà tặng sinh nhật, trang
              trí phòng ngủ, ôm khi ngủ trưa.
            </li>
            <li>
              <b>Size lớn</b> (trên 60cm): Gấu bông ôm cực đã, trang trí sofa,
              giường ngủ, tạo điểm nhấn cho không gian sống.
            </li>
          </ul>
          <p className={styles.bearInfoNote}>
            <b>Lưu ý:</b> Màu sắc và kích thước gấu bông có thể chênh lệch nhẹ
            (±1-2cm) do sản xuất thủ công.
            <br />
            Nếu cần tư vấn chọn size hoặc mẫu gấu phù hợp, đừng ngần ngại liên
            hệ shop nhé!
          </p>
          <div className={styles.bearContact}>
            <span> Liên hệ tư vấn nhanh:&nbsp;</span>
            <a
              href="https://zalo.me/0373828100"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zalo 0373828100
            </a>
            &nbsp;|&nbsp;
            <a  href="https://zalo.me/0373828100">Gọi 0373828100</a>
          </div>
        </div>
      </div>

      {/* BẢO QUẢN */}
      <div
        className={`${styles.tabContent} ${
          tab === "care" ? styles.tabContent_active : ""
        }`}
        style={{ display: tab === "care" ? "block" : "none" }}
      >
        <h4 className={styles.tabTitle}>BẢO QUẢN &amp; GIẶT GẤU</h4>
        <p>
          Gấu bông là người bạn thân thiết của nhiều người, đặc biệt là trẻ em.
          Tuy nhiên, sau một thời gian sử dụng, gấu bông sẽ bám bụi bẩn, vi
          khuẩn và trở thành nơi ẩn trú của các tác nhân gây dị ứng...
        </p>
        <p>
          Chúng tôi đã có một số mẹo để bảo quản và giặt gấu bông hiệu quả mà
          MiMiBear muốn chia sẻ đến bạn.
        </p>
        <img
          src="https://bemori.vn/wp-content/uploads/2024/08/bao-quan-va-giat-gau-scaled.webp"
          className={styles.productInfoImage}
          alt={product.name}
        />
        <p>
          Để bảo quản gấu bông, bạn nên giữ gấu bông ở nơi khô thoáng, tránh ẩm
          ướt và ánh nắng trực tiếp. Khi giặt gấu bông, bạn nên giặt bằng nước
          lạnh, tránh giặt nước nóng và sử dụng chất tẩy mạnh. Bạn cũng nên cho
          gấu bông vào túi giặt trước khi giặt bằng máy giặt và chọn chế độ giặt
          nhẹ.
        </p>
        <p>
          <a className={styles.tabContent_a} href="/posts/categories/dich-vu">
            Xem thêm bài viết
          </a>
        </p>
      </div>
    </div>
  );
};

export default ProductTabs;
