"use client";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../admin.css";
import { useVouchers } from "@/app/hooks/useVoucher";
import DiscountTable from "@/app/components/admin/DiscountTable";

export default function DiscountManagement() {
  const { vouchers, fetchVouchers } = useVouchers();

  return (
    <main className="app-content">
      <div className="app-title">
        <ul className="app-breadcrumb breadcrumb">
          <li className="breadcrumb-item">Quản lý giảm giá</li>
        </ul>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="tile">
            <h3 className="tile-title d-flex justify-content-between align-items-center">
              Danh sách mã giảm giá
              <a href="/admin/discount/adddiscount" className="btn btn-add btn-sm">
                <i className="fas fa-plus"></i> Thêm mã giảm giá
              </a>
            </h3>
            <div className="tile-body">
              <DiscountTable
                discounts={vouchers}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}