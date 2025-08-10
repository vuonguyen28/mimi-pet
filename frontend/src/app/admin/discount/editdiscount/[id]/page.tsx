"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShopOutlined, ShoppingCartOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "@/app/styles/admin/adddiscount.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "@/app/admin/admin.css";
import ProductSelectModal from "@/app/components/admin/ProductSelectModal";
import CategorySelectModal from "@/app/components/admin/CategorySelectModal";
import { getCategories } from "@/app/services/categoryService";
import { getProducts } from "@/app/services/productService";
import { getVoucherById, editVoucher } from "@/app/services/voucherService";
import { Voucher } from "@/app/types/voucherD";
import { validateVoucherForm } from "@/app/utils/useVoucherForm";
import SectionApplyTarget from "@/app/components/admin/SectionApplyTarget";
import useProductSelect from "@/app/hooks/useProductSelect";
import useCategorySelect from "@/app/hooks/useCategorySelect";
import { useSuccessNotification } from "@/app/utils/useSuccessNotification";
import VoucherForm from "@/app/components/admin/VoucherForm";

// Hàm format ngày cho input type="date"
function formatDateInput(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function DiscountEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) && params.id.length > 0 ? params.id[0] : "";

  const [form, setForm] = useState<Voucher | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<"amount" | "percent">("percent");
  const [maxDiscountLimit, setMaxDiscountLimit] = useState<"limited" | "unlimited">("unlimited");
  const [categoryTouched, setCategoryTouched] = useState(false);

  const productSelect = useProductSelect(form?.productIds || []);
  const categorySelect = useCategorySelect(form?.categoryIds || []);
  const showSuccess = useSuccessNotification();

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setError("Thiếu ID voucher để chỉnh sửa!");
        setForm(null);
        return;
      }
      try {
        const [cats, prods, voucherData] = await Promise.all([
          getCategories(),
          getProducts(),
          getVoucherById(id),
        ]);
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

        if (!voucherData || !voucherData._id) {
          setError("Không tìm thấy voucher này!");
          setForm(null);
          return;
        }

        setForm({
          ...voucherData,
          startDate: formatDateInput(voucherData.startDate),
          endDate: formatDateInput(voucherData.endDate),
        });
        setDiscountType(voucherData.amount !== null ? "amount" : "percent");
        setMaxDiscountLimit(voucherData.maxDiscount !== null ? "limited" : "unlimited");
        productSelect.setSelectedProductIds(voucherData.productIds ?? []);
        categorySelect.setSelectedCategoryIds(voucherData.categoryIds ?? []);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu voucher");
        setForm(null);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const handleVoucherType = useCallback((type: "all" | "product" | "category") => {
    if (!form) return;
    setForm((f) => ({
      ...f!,
      targetType: type,
      productIds: type === "category" ? [] : f!.productIds,
      categoryIds: type === "product" ? [] : f!.categoryIds,
    }));
    setCategoryTouched(false);
    setError(null);
    if (type === "category") productSelect.setSelectedProductIds([]);
    if (type === "product") categorySelect.setSelectedCategoryIds([]);
  }, [form, productSelect, categorySelect]);

  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "amount" | "percent";
    setDiscountType(value);
    setForm((f) => ({
      ...f!,
      amount: value === "amount" ? 0 : null,
      percent: value === "percent" ? 0 : null,
    }));
  };

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f!,
      [discountType]: value === "" ? null : Number(value),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev!,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

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
  function getProduct(pid: string) {
    return products.find((p) => p.id === pid);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryTouched(true);

    if (!form) return;

    // Tính lại trạng thái active dựa vào ngày bắt đầu/kết thúc
    const now = new Date();
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;
    let active = false;
    if (start && end && now >= start && now <= end) active = true;

    const dataToSave = {
      ...form,
      productIds: productSelect.selectedProductIds,
      categoryIds: categorySelect.selectedCategoryIds,
      active, // luôn cập nhật active theo ngày
    };

    const errMsg = validateVoucherForm(dataToSave, discountType);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setSubmitting(true);
    try {
      await editVoucher(form._id!, dataToSave);
      showSuccess("Cập nhật thành công", "Mã giảm giá đã được cập nhật!");
      setTimeout(() => {
        window.location.href = "/admin/discount";
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Lỗi khi cập nhật mã giảm giá");
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu có lỗi thì hiện ra, còn lại không có hiệu ứng đang tải
  if (!form && error) {
    return <div style={{ padding: 40, color: "red", textAlign: "center" }}>{error}</div>;
  }
  if (!form) return null;

  return (
    <main className="app-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb">
            <li className="breadcrumb-item">
              <a href="/admin/discounts">Quản lý giảm giá</a>
            </li>
            <li className="breadcrumb-item active">Chỉnh sửa mã giảm giá</li>
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
            onCancel={() => router.back()}
            styles={styles}
            submitLabel="Lưu thay đổi"
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