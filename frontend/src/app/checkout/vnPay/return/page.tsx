"use client";
import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { clearCart } from "../../../store/features/cartSlice";
import axios from "axios";

// Trang này sẽ nhận orderId và resultCode từ URL (do BE redirect về khi thanh toán xong)
// FE sẽ gọi API GET /orders/status/:orderId?resultCode=... để kiểm tra trạng thái đơn hàng

const VnpayReturnPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const resultCode = searchParams.get("resultCode");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!resultCode || !orderId) return;

    const checkOrderStatus = async () => {
      try {
        // Gọi backend để kiểm tra trạng thái đơn hàng
        const res = await axios.get(`http://localhost:3000/orders/status/${orderId}?resultCode=${resultCode}`);
        const { status } = res.data;
        if (status === "paid") {
          Swal.fire({
            icon: "success",
            title: "Thanh toán thành công!",
            text: "Cảm ơn bạn đã mua hàng.",
            timer: 3000,
            showConfirmButton: false,
          }).then(() => {
            dispatch(clearCart());
            localStorage.removeItem("cart");
            router.replace("/");
          });
        } else if (status === "failed" || status === "unpaid") {
          Swal.fire({
            icon: "error",
            title: "Thanh toán thất bại",
            text: "Có lỗi xảy ra. Vui lòng thử lại.",
            confirmButtonText: "Quay lại đặt hàng",
          }).then(() => {
            router.replace("/checkout");
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Đang xử lý thanh toán...",
            text: "Đơn hàng của bạn chưa được xác nhận thanh toán, vui lòng đợi hoặc liên hệ hỗ trợ!",
            confirmButtonText: "Quay lại đặt hàng",
          }).then(() => {
            router.replace("/checkout");
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không kiểm tra được trạng thái đơn hàng!",
          confirmButtonText: "Quay lại đặt hàng",
        }).then(() => {
          router.replace("/checkout");
        });
      }
    };u

    checkOrderStatus();
  }, [resultCode, orderId, router, dispatch]);

  return (
    <div style={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <span>Đang xử lý kết quả thanh toán VNPAY...</span>
    </div>
  );
};

export default VnpayReturnPage;