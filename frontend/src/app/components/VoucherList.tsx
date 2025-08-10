"use client";
import styles from "@/app/styles/voucherlist.module.css";
import React, { useEffect, useState } from "react";
import { getVouchers } from "../services/voucherService";
import { Voucher } from "../types/voucherD";

export default function VoucherList() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    getVouchers().then((data) => {
      const now = new Date();
      setVouchers(
        data.filter((v) => {
          if (v.targetType !== "all") return false;
          if (v.active === false) return false;
          if (v.startDate && new Date(v.startDate) > now) return false;
          if (v.endDate && new Date(v.endDate) < now) return false;
          return true;
        })
      );
    });
  }, []);

  const handleCopy = (code: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    navigator.clipboard.writeText(code).then(() => {
      const originalText = btn.textContent;
      btn.textContent = "Đã sao chép";
      btn.style.backgroundColor = "#4caf50";
      setTimeout(() => {
        btn.textContent = originalText!;
        btn.style.backgroundColor = "#ee4d2d";
      }, 1500);
    });
  };
  return (
    vouchers.length === 0 ? null : ( // Nếu không có voucher thì không render gì cả
      <div className={styles.container}>
        <h1 className={styles.title}>Mã Giảm Giá Toàn Shop</h1>
        <div className={styles["voucher-row"]}>
          {vouchers.map((v, i) => (
            <div className={styles.voucher} key={v._id || i}>
              <div className={`${styles["voucher-left"]} ${styles["color-red"]}`}>
                <span className={styles["voucher-percent"]}>
                  {v.percent
                    ? `${v.percent}%`
                    : v.amount
                    ? `${(v.amount / 1000).toLocaleString("vi-VN")}K`
                    : ""}
                </span>
                <span className={styles["voucher-label"]}>GIẢM</span>
                {v.discountCode && (
                  <div className={styles["voucher-badge"]}>HOT</div>
                )}
              </div>
              <div className={styles["voucher-right"]}>
                <div className={styles["voucher-header"]}>
                  <div>
                    <h3 className={styles["voucher-title"]}>{v.discountCode}</h3>
                    <p className={styles["voucher-desc"]}>{v.description}</p>
                  </div>
                  <button
                    className={styles["copy-btn"]}
                    onClick={(e) => handleCopy(v.discountCode, e)}
                  >
                    Sao chép
                  </button>
                </div>
                <div className={styles["voucher-footer"]}>
                  <p className={styles["voucher-remaining"]}>
                    Còn lại:{" "}
                    <span>
                      {v.usageLimit && v.used !== undefined
                        ? `${v.usageLimit - v.used}/${v.usageLimit}`
                        : "Không giới hạn"}
                    </span>
                  </p>
                  <p className={styles["voucher-expiry"]}>
                    HSD:{" "}
                    {v.endDate
                      ? new Date(v.endDate).toLocaleDateString("vi-VN")
                      : "Không xác định"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className={styles["footer-note"]}>
          Lưu ý: Mã giảm giá áp dụng toàn shop
        </p>
      </div>
    )
  );
}