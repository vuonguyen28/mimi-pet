"use client";
import React from "react";
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import styles from "@/app/styles/admin/adddiscount.module.css";

type Props = {
  targetType: "category" | "product" | "all";
  selectedCategoryIds: string[];
  selectedProductIds: string[];
  categories: any[];
  products: any[];
  openCategoryModal: () => void;
  openProductModal: () => void;
  onRemoveCategory: (id: string) => void;
  onRemoveProduct: (id: string) => void;
  getCategoryName: (id: string) => string;
  getProduct: (id: string) => any;
  touched: boolean;
  error?: string | null;
};

export default function SectionApplyTarget(props: Props) {
  const {
    targetType,
    selectedCategoryIds,
    selectedProductIds,
    openCategoryModal,
    openProductModal,
    onRemoveCategory,
    onRemoveProduct,
    getCategoryName,
    getProduct,
    touched,
  } = props;

  if (targetType === "category") {
    return (
      <>
        <div className={styles["section-title"] + " mb-3 mt-4"}>
          3. Danh mục được áp dụng mã giảm giá
        </div>
        <div className="form-group">
          <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap">
            <div>
              {selectedCategoryIds.length > 0 ? (
                <span>
                  Đã chọn:{" "}
                  <span style={{ fontWeight: 600, color: "#e7537a" }}>
                    {selectedCategoryIds.length} danh mục
                  </span>
                </span>
              ) : (
                <span className="text-muted pl-2">Chưa chọn danh mục</span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-info btn-sm"
              onClick={openCategoryModal}
            >
              <PlusOutlined style={{ marginRight: 5 }} /> Thêm danh mục
            </button>
          </div>
          <div className={styles["ctags-list"]}>
            {selectedCategoryIds.map((cid) => (
              <span className={styles["ctag"]} key={cid}>
                {getCategoryName(cid)}
                <button
                  type="button"
                  className={styles["ctag-remove"]}
                  tabIndex={-1}
                  onClick={() => onRemoveCategory(cid)}
                >
                  <DeleteOutlined />
                </button>
              </span>
            ))}
          </div>
          {touched && selectedCategoryIds.length === 0 && (
            <div className="text-danger mt-2" style={{ fontWeight: 500 }}>
              <ExclamationCircleOutlined style={{ fontSize: 17, marginRight: 5 }} />
              Vui lòng chọn ít nhất 1 danh mục áp dụng!
            </div>
          )}
        </div>
      </>
    );
  }

  if (targetType === "product") {
    return (
      <>
        <div className={styles["section-title"] + " mb-3 mt-4"}>
          3. Sản phẩm được áp dụng mã giảm giá
        </div>
        <div className="form-group">
          <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap">
            <div>
              {selectedProductIds.length > 0 ? (
                <span>
                  Sản phẩm đã được áp dụng:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {selectedProductIds.length} sản phẩm được chọn
                  </span>
                </span>
              ) : (
                <span className="text-muted pl-2">Chưa chọn sản phẩm</span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-info btn-sm"
              onClick={openProductModal}
            >
              <PlusOutlined style={{ marginRight: 5 }} /> Thêm sản phẩm
            </button>
          </div>
          {selectedProductIds.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="table table-sm table-bordered table-selected-products mt-2 mb-0">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th style={{ width: 48 }}>Xoá</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProductIds.map((pid) => {
                    const p = getProduct(pid);
                    if (!p) return null;
                    return (
                      <tr key={pid}>
                        <td>
                          <img
                            src={`http://localhost:3000/images/${p.image}`}
                            alt={p.name}
                            style={{
                              width: 38,
                              height: 38,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "2px solid #ffe0ef",
                              background: "#fff",
                            }}
                          />
                        </td>
                        <td>{p.name}</td>
                        <td>{p.price.toLocaleString()} đ</td>
                        <td>
                          {Array.isArray(p.variants)
                            ? p.variants.reduce(
                                (total: number, v: any) =>
                                  total + (v.quantity ? Number(v.quantity) : 0),
                                0
                              )
                            : p.quantity ?? 0}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-danger p-0"
                            title="Xóa"
                            onClick={() => onRemoveProduct(pid)}
                            style={{
                              fontSize: 20,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <DeleteOutlined />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {touched && selectedProductIds.length === 0 && (
            <div className="text-danger mt-2" style={{ fontWeight: 500 }}>
              <ExclamationCircleOutlined style={{ fontSize: 17, marginRight: 5 }} />
              Vui lòng chọn ít nhất 1 sản phẩm áp dụng!
            </div>
          )}
        </div>
      </>
    );
  }

  return null;
}