// Component: CheckoutPayment
// Chức năng: Hiển thị cột "Thanh toán & Vận chuyển" ở trang checkout.
// - Hiển thị thông báo vận chuyển (chỉ là input disabled).
// - Hiển thị các phương thức thanh toán (COD, ZaloPay, VnPay, Momo) dưới dạng radio button.
// - Hiển thị lỗi chọn phương thức thanh toán nếu có.
// - Nhận props: payment (giá trị đã chọn), handlePaymentChange (callback khi chọn phương thức), errors (object lỗi).

import React from "react";

interface Props {
  payment: string;
  handlePaymentChange: (v: string) => void;
  errors: { [k: string]: string };
  isShippingInfoFilled: boolean; // 👈 Cập nhật Props trong CheckoutPayment
}

const CheckoutPayment: React.FC<Props> = ({
  payment,
  handlePaymentChange,
  errors,
  isShippingInfoFilled,
}) => (
  <div className="column">
    <h3>Vận chuyển</h3>

    <input
      className="nhaptt"
      value={isShippingInfoFilled ? "Thông tin đã nhập đầy đủ" : "Vui lòng nhập thông tin giao hàng"}
      readOnly
      style={{
        backgroundColor: isShippingInfoFilled ? "#e3f7e3" : "#fdf0f0",
        color: isShippingInfoFilled ? "#2e7d32" : "#c62828",
        fontWeight: "bold"
      }}
    />

    <h4>Thanh toán</h4>
    {errors.payment && <div className="error">{errors.payment}</div>}
    <br />
    <div className="payment-method" onClick={() => handlePaymentChange("cod")}>
      <input
        type="radio"
        name="pay"
        checked={payment === "cod"}
        onChange={() => handlePaymentChange("cod")}
      />
      <label>Thanh toán khi giao hàng</label>
      <div className="cod">
        <img
          src="http://localhost:3000/images/icon-tien.png"
          alt="cod"
          style={{
            filter:
              "invert(71%) sepia(94%) saturate(600%) hue-rotate(85deg) brightness(90%) contrast(90%)",
          }}
        />
      </div>
    </div>
    {/* <div className="payment-method" onClick={() => handlePaymentChange("zalopay")}>
      <input
        type="radio"
        name="pay"
        checked={payment === "zalopay"}
        onChange={() => handlePaymentChange("zalopay")}
      />
      <label>Thanh toán qua ZaloPay</label>
      <div className="cod">
        <img src="http://localhost:3000/images/zalopay.png" alt="ZaloPay" style={{ width: 65 }} />
      </div>
    </div> */}
    <div className="payment-method" onClick={() => handlePaymentChange("vnpay")}>
      <input
        type="radio"
        name="pay"
        checked={payment === "vnpay"}
        onChange={() => handlePaymentChange("vnpay")}
      />
      <label>Thanh toán qua VnPay</label>
      <div className="cod">
        <img src="http://localhost:3000/images/vnpay.png" alt="VnPay" style={{ width: 85 }} />
      </div>
    </div>
    <div className="payment-method" onClick={() => handlePaymentChange("momo")}>
      <input
        type="radio"
        name="pay"
        checked={payment === "momo"}
        onChange={() => handlePaymentChange("momo")}
      />
      <label>Thanh toán qua Momo</label>
      <div className="cod">
        <img
          src="http://localhost:3000/images/momo.png"
          alt="Momo"
          style={{ width: 35, height: 35 }}
        />
      </div>
    </div>
  </div>
);

export default CheckoutPayment;