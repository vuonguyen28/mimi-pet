import React from "react";
import styles from "../styles/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles["footer-container"]}>
        {/* Cột 1 */}
        <div className={styles["footer-col"]}>
          <img src="http://localhost:3000/images/logoXP.png" alt="MiMiBear Logo" className={styles["footer-logo"]} />
          <p>
            MiMiBear - Cửa hàng gấu bông chất lượng, quà tặng yêu thương dành cho mọi lứa tuổi. Khám phá bộ sưu tập thú nhồi bông độc đáo, mềm mại và an toàn, hoàn hảo để làm quà sinh nhật, kỷ niệm, hay gửi gắm tình cảm.
          </p>
          <p>
            MiMiBear - Chạm vào yêu thương! Gomi mong muốn mang đến cho khách hàng trải nghiệm của sự ấm áp và chân thành qua từng món quà!
          </p>
        </div>

        {/* Cột 2 */}
        <div className={styles["footer-col"]}>
          <h3>HỆ THỐNG CỬA HÀNG</h3>
          <p><strong>TP. HỒ CHÍ MINH</strong></p>
          <p><i className="fas fa-map-marker-alt"></i> 41/1c Tô Ký, P. Trung Mỹ Tây, Q.12, TP. HCM</p>
          <p>Nhận - 092 492 3399</p>
          <p>OPEN DAILY: 8H30 - 23H00</p>
          <h3>KẾT NỐI VỚI CHÚNG TÔI</h3>
          <div className={styles["social-icons"]}>
            <a href="#"><img src="http://localhost:3000/images/iconfb.png" alt="Facebook" /></a>
            <a href="#"><img src="http://localhost:3000/images/iconzalo.png" alt="Zalo" /></a>
            <a href="#"><img src="http://localhost:3000/images/icontt.png" alt="TikTok" /></a>
            <a href="#"><img src="http://localhost:3000/images/iconyt.png" alt="YouTube" /></a>
          </div>
          <a href="#"><img src="http://localhost:3000/images/bct.webp" alt="Đã thông báo Bộ Công Thương" className={styles["bct-logo"]} /></a>
        </div>

        {/* Cột 3 */}
        <div className={styles["footer-col"]}>
          <h3>HỖ TRỢ KHÁCH HÀNG</h3>
          <ul className={styles["support-list"]}>
            <li>Chính sách chung</li>
            <li>Bảo hành & Đổi trả</li>
            <li>Giới thiệu & Liên hệ</li>
            <li>Câu hỏi thường gặp</li>
            <li>Chính sách vận chuyển</li>
          </ul>
          <h3>TỔNG ĐÀI HỖ TRỢ</h3>
          <p>Đặt hàng Online: 0964473459</p>
          <p>Hotline phản ánh SP/DV: 0339332690</p>
          <p>Email: MiMiBear.cskh@gmail.com</p>
          <h3>PHƯƠNG THỨC THANH TOÁN</h3>
          <div className={styles["payment-icons"]}>
            <img src="http://localhost:3000/images/thanhtoan.png" alt="Thanh toán" />
          </div>
        </div>
      </div>
      <div className={styles["footer-bottom"]}>
        © Since 2025. Cữa Hàng Gấu Bông MiMiBear
      </div>
    </footer>
  );
}
