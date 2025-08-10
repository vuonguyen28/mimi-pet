import React from "react";
import { ExclamationCircleOutlined, ShopOutlined, ShoppingCartOutlined, FolderOpenOutlined } from "@ant-design/icons";
import SectionApplyTarget from "./SectionApplyTarget";

interface VoucherFormProps {
  form: any;
  error: string | null;
  submitting: boolean;
  discountType: "amount" | "percent";
  maxDiscountLimit: "limited" | "unlimited";
  categoryTouched: boolean;
  categories: any[];
  products: any[];
  productSelect: any;
  categorySelect: any;
  handleVoucherType: (type: "all" | "product" | "category") => void;
  handleDiscountTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDiscountValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  getCategoryName: (id: string) => string;
  getProduct: (id: string) => any;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  styles: any;
  submitLabel?: string;
}

const VoucherForm: React.FC<VoucherFormProps> = ({
  form,
  error,
  submitting,
  discountType,
  maxDiscountLimit,
  categoryTouched,
  categories,
  products,
  productSelect,
  categorySelect,
  handleVoucherType,
  handleDiscountTypeChange,
  handleDiscountValueChange,
  handleChange,
  getCategoryName,
  getProduct,
  onSubmit,
  onCancel,
  styles,
  submitLabel = "Lưu",
}) => (
  <form onSubmit={onSubmit} noValidate>
    {/* 1. Chọn loại mã giảm giá */}
    <div className={styles["section-title"] + " mb-3"}>
      1. Loại mã giảm giá
    </div>
    <div className={styles["voucher-type-row"] + " mb-4"}>
      {/* Voucher toàn shop */}
      <div
        className={
          `voucher-type-card ${styles["voucher-type-card"]} ` +
          (form.targetType === "all"
            ? "active teddy " + styles["active"]
            : "")
        }
        onClick={() => handleVoucherType("all")}
      >
        <div className={styles["voucher-type-icon"] + " shop"}>
          <ShopOutlined style={{ fontSize: 32 }} />
        </div>
        <div>
          <div className={styles["voucher-type-label"]}>Voucher toàn</div>
          <div className={styles["voucher-type-label"]}>Shop</div>
        </div>
        {form.targetType === "all" && (
          <div className={styles["voucher-type-check"] + " teddy"}>
            <span>✔</span>
          </div>
        )}
      </div>
      {/* Voucher danh mục */}
      <div
        className={
          `voucher-type-card ${styles["voucher-type-card"]} ` +
          (form.targetType === "category"
            ? "active teddy " + styles["active"]
            : "")
        }
        onClick={() => handleVoucherType("category")}
      >
        <div className={styles["voucher-type-icon"] + " category"}>
          <FolderOpenOutlined style={{ fontSize: 32 }} />
        </div>
        <div>
          <div className={styles["voucher-type-label"]}>
            Voucher danh mục
          </div>
        </div>
        {form.targetType === "category" && (
          <div className={styles["voucher-type-check"] + " teddy"}>
            <span>✔</span>
          </div>
        )}
      </div>
      {/* Voucher sản phẩm */}
      <div
        className={
          `voucher-type-card ${styles["voucher-type-card"]} ` +
          (form.targetType === "product"
            ? "active teddy " + styles["active"]
            : "")
        }
        onClick={() => handleVoucherType("product")}
      >
        <div className={styles["voucher-type-icon"] + " product"}>
          <ShoppingCartOutlined style={{ fontSize: 32 }} />
        </div>
        <div>
          <div className={styles["voucher-type-label"]}>
            Voucher sản phẩm
          </div>
        </div>
        {form.targetType === "product" && (
          <div className={styles["voucher-type-check"] + " teddy"}>
            <span>✔</span>
          </div>
        )}
      </div>
    </div>

    {/* 2. Thông tin chi tiết mã giảm giá */}
    <div className={styles["section-title"] + " mb-3"}>
      2. Thông tin mã giảm giá
    </div>
    {error && (
      <div
        className="alert alert-danger d-flex align-items-center gap-2"
        style={{ fontWeight: 500 }}
      >
        <ExclamationCircleOutlined
          style={{ fontSize: 20, marginRight: 8 }}
        />
        {error}
      </div>
    )}
    <div className="row">
      {/* Mã giảm giá */}
      <div className="col-md-4 mb-3">
        <label>
          Mã giảm giá <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${error && (!form.discountCode.trim() || (form.discountCode.trim().length < 5)) ? "is-invalid" : ""}`}
          name="discountCode"
          value={form.discountCode}
          onChange={handleChange}
          placeholder="SALE50"
          required
          maxLength={30}
          autoComplete="off"
        />
      </div>
      {/* Mô tả */}
      <div className="col-md-4 mb-3">
        <label>Mô tả</label>
        <input
          type="text"
          className="form-control"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Giảm 50% đơn hàng"
          maxLength={80}
          autoComplete="off"
        />
      </div>
      {/* Loại giảm giá và giá trị giảm */}
      <div className="col-md-4 mb-3">
        <label>Loại giảm giá | Mức giảm</label>
        <div className={styles["discount-type-input-group"]}>
          <select
            className={"form-select " + styles["discount-type-select"]}
            value={discountType}
            onChange={handleDiscountTypeChange}
          >
            <option value="amount">Theo số tiền</option>
            <option value="percent">Theo phần trăm</option>
          </select>
          <input
            type="number"
            className={`form-control ${styles["discount-type-amount-input"]
              }
                ${error &&
                ((discountType === "amount" &&
                  (!form.amount || form.amount < 1)) ||
                  (discountType === "percent" &&
                    (!form.percent ||
                      form.percent < 1 ||
                      form.percent > 100)))
                ? "is-invalid"
                : ""
              }`}
            min={discountType === "percent" ? 1 : 1000}
            max={discountType === "percent" ? 100 : undefined}
            placeholder="Nhập vào"
            value={
              discountType === "amount"
                ? form.amount ?? ""
                : form.percent ?? ""
            }
            onChange={handleDiscountValueChange}
          />
          <span className={styles["discount-type-suffix"]}>
            {discountType === "percent" ? "%" : "đ"}
          </span>
        </div>
      </div>
    </div>
    <div className="row">
      {/* Giá trị đơn hàng tối thiểu */}
      <div className="col-md-4 mb-3">
        <label>Giá trị đơn hàng tối thiểu</label>
        <input
          type="number"
          className="form-control"
          name="minOrderValue"
          value={form.minOrderValue ?? ""}
          onChange={handleChange}
          placeholder="Nhập số tiền tối thiểu"
          min={0}
        />
      </div>
      {/* Số tiền giảm tối đa (chỉ hiện khi giảm %) */}
      {discountType === "percent" && (
        <div className="col-md-4 mb-3">
          <label>Số tiền giảm tối đa (cho voucher %)</label>
          <div className="d-flex align-items-center">
            <div className="form-check mr-4">
              <input
                className="form-check-input"
                type="radio"
                name="maxDiscountLimit"
                id="limitMaxDiscount"
                value="limited"
                checked={form.maxDiscount !== null}
                onChange={() => {
                  // setForm và setMaxDiscountLimit phải truyền từ props
                  handleChange({
                    target: {
                      name: "maxDiscount",
                      value: 0,
                      type: "number",
                    },
                  } as any);
                  // Nếu muốn setMaxDiscountLimit thì truyền thêm prop
                }}
              />
              <label
                className="form-check-label"
                htmlFor="limitMaxDiscount"
              >
                Giới hạn
              </label>
            </div>
            <div className="form-check mr-3">
              <input
                className="form-check-input"
                type="radio"
                name="maxDiscountLimit"
                id="unlimitMaxDiscount"
                value="unlimited"
                checked={form.maxDiscount === null}
                onChange={() => {
                  handleChange({
                    target: {
                      name: "maxDiscount",
                      value: null,
                      type: "number",
                    },
                  } as any);
                }}
              />
              <label
                className="form-check-label"
                htmlFor="unlimitMaxDiscount"
              >
                Không giới hạn
              </label>
            </div>
            {form.maxDiscount !== null && (
              <>
                <input
                  type="number"
                  className="form-control"
                  name="maxDiscount"
                  value={form.maxDiscount ?? ""}
                  onChange={handleChange}
                  placeholder="Nhập số tiền"
                  min={0}
                  style={{ width: 160, marginLeft: 16 }}
                />
                <span style={{ marginLeft: 8 }}>đ</span>
              </>
            )}
          </div>
        </div>
      )}
      {/* Số lượt sử dụng tối đa */}
      <div className="col-md-4 mb-3">
        <label>Số lượt sử dụng tối đa</label>
        <input
          type="number"
          className="form-control"
          name="usageLimit"
          value={form.usageLimit ?? ""}
          onChange={handleChange}
          placeholder="100, vô hạn"
          min={0}
        />
      </div>
    </div>
    {/* Thời gian áp dụng voucher */}
    <div className="row">
      <div className="col-md-6 mb-3">
        <label>
          Thời gian lưu mã giảm giá{" "}
          <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="date"
            name="startDate"
            value={form.startDate || ""}
            onChange={handleChange}
            required
            style={{ maxWidth: 160 }}
          />
          <input
            type="date"
            name="endDate"
            value={form.endDate || ""}
            onChange={handleChange}
            required
            style={{ maxWidth: 160 }}
          />
        </div>
      </div>
    </div>

    {/* 3. Chọn danh mục/sản phẩm áp dụng */}
    <SectionApplyTarget
      targetType={form.targetType}
      selectedCategoryIds={categorySelect.selectedCategoryIds}
      selectedProductIds={productSelect.selectedProductIds}
      categories={categories}
      products={products}
      openCategoryModal={categorySelect.openCategoryModal}
      openProductModal={productSelect.openProductModal}
      onRemoveCategory={categorySelect.removeCategory}
      onRemoveProduct={productSelect.removeProduct}
      getCategoryName={getCategoryName}
      getProduct={getProduct}
      touched={categoryTouched}
    />

    {/* Nút submit */}
    <div className="form-group mt-4 d-flex justify-content-end gap-2">
      <button
        type="button"
        className="btn btn-cancel mr-2"
        onClick={onCancel}
      >
        Hủy
      </button>
      <button type="submit" className="btn btn-save" disabled={submitting}>
        {submitting ? "Đang lưu..." : submitLabel}
      </button>
    </div>
  </form>
);

export default VoucherForm