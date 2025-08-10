"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// import {
//   ShopOutlined, ShoppingCartOutlined, ExclamationCircleOutlined,
// } from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "boxicons/css/boxicons.min.css";
import styles from "@/app/styles/admin/adddiscount.module.css";
import "@/app/admin/admin.css";
import ProductSelectModal from "@/app/components/admin/ProductSelectModal";
import CategorySelectModal from "@/app/components/admin/CategorySelectModal";
import { getCategories } from "@/app/services/categoryService";
import { getProducts } from "@/app/services/productService";
import { addVoucher } from "@/app/services/voucherService";
import { Voucher } from "@/app/types/voucherD";
import { validateVoucherForm } from "@/app/utils/useVoucherForm";
import SectionApplyTarget from "@/app/components/admin/SectionApplyTarget";
import useProductSelect from "@/app/hooks/useProductSelect";
import useCategorySelect from "@/app/hooks/useCategorySelect";
import { useSuccessNotification } from "@/app/utils/useSuccessNotification";
import VoucherForm from "@/app/components/admin/VoucherForm";

// Giá trị mặc định của form voucher
const emptyForm: Voucher = {
  discountCode: "",
  percent: null,
  amount: null,
  startDate: "",
  endDate: "",
  description: "",
  targetType: "all",
  productIds: [],
  categoryIds: [],
  minOrderValue: undefined,
  maxDiscount: null,
  usageLimit: undefined,
  used: 0,
  active: true,
};

export default function DiscountAddPage() {
  const router = useRouter();

  // State chính (danh mục, sản phẩm, thông tin form, trạng thái UI)
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<Voucher>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<"amount" | "percent">("percent");
  const [maxDiscountLimit, setMaxDiscountLimit] = useState<"limited" | "unlimited">("unlimited");
  const [categoryTouched, setCategoryTouched] = useState(false);

  const showSuccess = useSuccessNotification();

  // Sử dụng custom hook cho quản lý chọn sản phẩm và danh mục
  const productSelect = useProductSelect(form.productIds);
  const categorySelect = useCategorySelect(form.categoryIds);

  // Khi chọn loại voucher thì reset state sản phẩm/danh mục nếu cần
  const handleVoucherType = useCallback((type: "all" | "product" | "category") => {
    setForm((f) => ({
      ...f,
      targetType: type,
      productIds: type === "category" ? [] : f.productIds,
      categoryIds: type === "product" ? [] : f.categoryIds,
    }));
    setCategoryTouched(false);
    setError(null);

    // Reset state product/category select khi đổi loại
    if (type === "category") productSelect.setSelectedProductIds([]);
    if (type === "product") categorySelect.setSelectedCategoryIds([]);
  }, [productSelect, categorySelect]);

  // Fetch dữ liệu danh mục và sản phẩm khi load trang
  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(
          cats.map((cat: any) => ({
            id: cat._id || cat.id,
            name: cat.name,
            children: cat.subcategories
              ? cat.subcategories.map((sub: any) => ({
                  id: sub._id || sub.id,
                  name: sub.name,
                  children: [],
                }))
              : [],
          }))
        );
        setProducts(
          prods.map((p: any) => ({
            id: p._id || p.id,
            code: p.code || "",
            name: p.name,
            price: p.price,
            image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "",
            categoryId:
              typeof p.categoryId === "object" && p.categoryId
                ? p.categoryId._id || p.categoryId.id
                : p.categoryId,
            subcategoryId: p.subcategoryId
              ? typeof p.subcategoryId === "object"
                ? {
                    id: p.subcategoryId._id || p.subcategoryId.id,
                    name: p.subcategoryId.name,
                  }
                : null
              : null,
            variants: Array.isArray(p.variants) ? p.variants : [],
          }))
        );
      } catch (err) {}
    }
    fetchData();
  }, []);

  // Xử lý đổi loại giảm giá (amount/percent)
  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "amount" | "percent";
    setDiscountType(value);
    setForm((f) => ({
      ...f,
      amount: value === "amount" ? 0 : null,
      percent: value === "percent" ? 0 : null,
    }));
  };

  // Xử lý nhập amount/percent
  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [discountType]: value === "" ? null : Number(value),
    }));
  };

  // Xử lý các trường input khác
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  // Hàm lấy tên danh mục từ id (đệ quy)
  function getCategoryName(id: string): string {
    function findCat(cats: any[]): any | null {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCat(cat.children);
          if (found) return found;
        }
      }
      return null;
    }
    const cat = findCat(categories);
    return cat?.name || id;
  }

  // Hàm lấy sản phẩm từ id
  function getProduct(pid: string) {
    return products.find((p) => p.id === pid);
  }

  // Xử lý submit, luôn lấy state mới nhất của product/category select
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryTouched(true);

    const now = new Date();
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;
    let active = false;
    if (start && end && now >= start && now <= end) active = true;

    const dataToSave = {
      ...form,
      productIds: productSelect.selectedProductIds,
      categoryIds: categorySelect.selectedCategoryIds,
      active,
    };

    const errMsg = validateVoucherForm(dataToSave, discountType);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setSubmitting(true);
    try {
      const { _id, ...data } = dataToSave;
      await addVoucher(data);
      showSuccess("Tạo thành công", "Mã giảm giá đã được thêm mới!");
      window.location.href = "/admin/discount";
    } catch (err: any) {
      setError(err.message || "Lỗi khi lưu mã giảm giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb">
            <li className="breadcrumb-item">
              <a href="/admin/discounts">Quản lý giảm giá</a>
            </li>
            <li className="breadcrumb-item active">Tạo mã giảm giá mới</li>
          </ul>
        </div>
        <div
          className="tile px-0 py-4 px-md-4"
          style={{
            borderRadius: 16,
            background: "#fff",
            boxShadow: "0 2px 8px #f9e5ef33",
            border: "1px solid #ffe0ef",
          }}
        >
          <VoucherForm
            form={form}
            error={error}
            submitting={submitting}
            discountType={discountType}
            maxDiscountLimit={maxDiscountLimit}
            categoryTouched={categoryTouched}
            categories={categories}
            products={products}
            productSelect={productSelect}
            categorySelect={categorySelect}
            handleVoucherType={handleVoucherType}
            handleDiscountTypeChange={handleDiscountTypeChange}
            handleDiscountValueChange={handleDiscountValueChange}
            handleChange={handleChange}
            getCategoryName={getCategoryName}
            getProduct={getProduct}
            onSubmit={handleSubmit}
            onCancel={() => window.history.back()}
            styles={styles}
            submitLabel="Lưu"
          />
        </div>
      </div>
      <ProductSelectModal
        show={productSelect.showProductModal}
        onClose={productSelect.closeProductModal}
        onSave={productSelect.saveSelectedProducts}
        products={products}
        categories={categories}
        selectedIds={productSelect.selectedProductIds}
      />
      <CategorySelectModal
        show={categorySelect.showCategoryModal}
        onClose={categorySelect.closeCategoryModal}
        onSave={categorySelect.saveSelectedCategories}
        categories={categories}
        selectedIds={categorySelect.selectedCategoryIds}
      />
    </main>
  );
}