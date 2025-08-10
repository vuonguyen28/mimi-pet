import React, { useState } from "react";
import styles from "../styles/checkout.module.css";

const provinces = ["Tỉnh thành", "TP.Hồ Chí Minh"];
const districts = ["Quận huyện", "Quận 1", "Quận 2"];
const wards = ["Phường xã", "Quang Trung"];

export const CheckoutPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState(provinces[0]);
  const [district, setDistrict] = useState(districts[0]);
  const [ward, setWard] = useState(wards[0]);
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("");
  const [coupon, setCoupon] = useState("");

  const handlePaymentChange = (value: string) => {
    setPayment(value);
  };

  return (
    <div className={styles.container}>
      {/* Left: Info + Shipping + Payment */}
      <div className={styles.left}>
        <div className={styles.column}>
          <div className={styles.log}>
            <h3>Thông tin nhận hàng</h3>
            <div className={styles["log-dn"]}>
              <a href="#">
                <img src="assets/images/nhaOng/icon-dn.png" alt="" />
              </a>
              <a href="#">
                <button>Đăng nhập</button>
              </a>
            </div>
          </div>
          <input
            type="text"
            placeholder="Họ và tên"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Địa chỉ"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <select value={province} onChange={e => setProvince(e.target.value)}>
            {provinces.map(prov => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
          <select
            value={district}
            style={{ backgroundColor: "rgba(250, 146, 210, 0.452)" }}
            onChange={e => setDistrict(e.target.value)}
          >
            {districts.map(dist => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <select
            value={ward}
            style={{ backgroundColor: "rgba(250, 146, 210, 0.452)" }}
            onChange={e => setWard(e.target.value)}
          >
            {wards.map(w => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Ghi chú (tùy chọn)"
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
        <div className={styles.column}>
          <h3>Vận chuyển</h3>
          <input
            className={styles.nhaptt}
            value="Vui lòng nhập thông tin giao hàng"
            readOnly
          />
          <h4>Thanh toán</h4>
          <div
            className={styles["payment-method"]}
            onClick={() => handlePaymentChange("cod")}
          >
            <input
              type="radio"
              name="pay"
              checked={payment === "cod"}
              onChange={() => handlePaymentChange("cod")}
            />
            <label>Thanh toán khi giao hàng</label>
            <div className={styles.cod}>
              <img
                src="assets/images/nhaOng/icon-tien.png"
                alt="cod"
              />
            </div>
          </div>
          <div
            className={styles["payment-method"]}
            onClick={() => handlePaymentChange("zalopay")}
          >
            <input
              type="radio"
              name="pay"
              checked={payment === "zalopay"}
              onChange={() => handlePaymentChange("zalopay")}
            />
            <label>Thanh toán qua ZaloPay</label>
            <div className={styles.cod}>
              <img
                src="assets/images/nhaOng/zalopay.png"
                alt="ZaloPay"
                style={{ width: 65 }}
              />
            </div>
          </div>
          <div
            className={styles["payment-method"]}
            onClick={() => handlePaymentChange("vnpay")}
          >
            <input
              type="radio"
              name="pay"
              checked={payment === "vnpay"}
              onChange={() => handlePaymentChange("vnpay")}
            />
            <label>Thanh toán qua VnPay</label>
            <div className={styles.cod}>
              <img
                src="assets/images/nhaOng/vnpay.png"
                alt="VnPay"
                style={{ width: 85 }}
              />
            </div>
          </div>
          <div
            className={styles["payment-method"]}
            onClick={() => handlePaymentChange("momo")}
          >
            <input
              type="radio"
              name="pay"
              checked={payment === "momo"}
              onChange={() => handlePaymentChange("momo")}
            />
            <label>Thanh toán qua Momo</label>
            <div className={styles.cod}>
              <img
                src="assets/images/nhaOng/momo.png"
                alt="Momo"
                style={{ width: 35, height: 35 }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Right: Order summary */}
      <div className={styles.right}>
        <h3>Đơn hàng (1 sản phẩm)</h3>
        <div className={styles["order-summary"]}>
          <div className={styles.spTT}>
            <div className={styles.soSP} style={{ position: "relative" }}>
              <img
                className={styles.anhGH}
                src="assets/images/nhaOng/section2-1.jpg"
                alt=""
              />
              <span className={styles.siso} style={{
                position: "absolute",
                top: 0,
                right: 0
              }}>1</span>
            </div>
            <span>Nhấn giữ Vòng tay bạc khi đến địa chỉ T.Tỉnh, Quận Xxxx</span>
            <p>5438000 ₫</p>
          </div>
          <div className={styles.saleTT}>
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
            />
            <button>ÁP DỤNG</button>
          </div>
          <div className={styles.tinhTien}>
            <div className={styles.tTien}>
              <p>Tạm tính</p>
              <p>5438000 ₫</p>
            </div>
            <div className={styles.tTien}>
              <p>Phí vận chuyển</p>
              <p>--</p>
            </div>
          </div>
          <div className={styles.total}>
            <p>Tổng cộng</p>
            <span>5438000 ₫</span>
          </div>
          <div className={styles.actions}>
            <button className={styles.back}>◀ Quay về giỏ hàng</button>
            <button className={styles.submit}>ĐẶT HÀNG</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;