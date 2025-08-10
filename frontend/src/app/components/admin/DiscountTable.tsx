import { Voucher } from "@/app/types/voucherD";
import React from "react";
import styles from "@/app/styles/admin/discounttable.module.css";

type Props = {
    discounts: Voucher[];
};

function formatNumber(n?: number | null) {
    if (n == null) return "0";
    return n.toLocaleString("vi-VN");
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatMaxDiscount(n?: number | null) {
    if (!n || n <= 0) return "-";
    return formatNumber(n) + "đ";
}

export default function DiscountTable({ discounts }: Props) {
    const [typeFilter, setTypeFilter] = React.useState<string>("all");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");

    const renderStatusAndPeriod = (d: Voucher) => {
        const now = new Date();
        const from = d.startDate ? new Date(d.startDate) : null;
        const to = d.endDate ? new Date(d.endDate) : null;
        let statusEl: React.ReactNode;

        // Ưu tiên: Nếu đã hết hạn thì luôn hiện "Hết hạn"
        if (to && now > to) {
            statusEl = (
                <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
                    Hết hạn
                </span>
            );
        } else if (!d.active) {
            statusEl = (
                <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
                    Chưa kích hoạt
                </span>
            );
        } else {
            statusEl = (
                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                    Đang hoạt động
                </span>
            );
        }

        return (
            <div style={{ minWidth: 140 }}>
                {statusEl}
                <span className={styles.statusDate}>
                    ({formatDate(d.startDate)} - {formatDate(d.endDate)})
                </span>
            </div>
        );
    };

    const renderValue = (d: Voucher) => {
        if (d.percent != null) return `${d.percent}%`;
        if (d.amount != null) return `${formatNumber(d.amount)}đ`;
        return "0";
    };

    const renderDiscountType = (d: Voucher) => {
        let subText = "";
        if (d.targetType === "product") {
            subText = `(${d.productIds?.length || 0} sản phẩm)`;
            return (
                <span className={styles.discountTypeProduct}>
                    Mã giảm theo sản phẩm
                    <br />
                    <span className={styles.discountSubText}>{subText}</span>
                </span>
            );
        }
        if (d.targetType === "category") {
            subText = `(${d.categoryIds?.length || 0} danh mục)`;
            return (
                <span className={styles.discountTypeCategory}>
                    Mã giảm theo danh mục
                    <br />
                    <span className={styles.discountSubText}>{subText}</span>
                </span>
            );
        }
        if (d.targetType === "all") {
            subText = `(Toàn shop)`;
            return (
                <span className={styles.discountTypeAll}>
                    Mã giảm toàn Shop
                    <br />
                    <span className={styles.discountSubText}>{subText}</span>
                </span>
            );
        }
        return "";
    };

    const renderApplyTarget = (d: Voucher) => {
        if (d.targetType === "product") {
            return (
                <span>
                    {d.productIds?.length || 0} sản phẩm
                </span>
            );
        }
        if (d.targetType === "category") {
            return (
                <span>
                    {d.categoryIds?.length || 0} danh mục
                </span>
            );
        }
        if (d.targetType === "all") {
            return <span>Toàn shop</span>;
        }
        return "";
    };

    const renderStatus = (d: Voucher, onActive?: (id: string) => void) => {
        const now = new Date();
        const from = d.startDate ? new Date(d.startDate) : null;
        const to = d.endDate ? new Date(d.endDate) : null;
        let statusEl: React.ReactNode;
        let showActiveBtn = false;

        if (to && now > to) {
            statusEl = (
                <span className={`${styles.statusBadge} ${styles.statusExpired}`}>
                    Hết hạn
                </span>
            );
        } else if (!d.active) {
            statusEl = (
                <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
                    Chưa kích hoạt
                </span>
            );
            // Chỉ hiện nút nếu đang trong khoảng ngày hiệu lực
            if (from && to && now >= from && now <= to) showActiveBtn = true;
        } else {
            statusEl = (
                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                    Đang hoạt động
                </span>
            );
        }

        return (
            <div style={{ minWidth: 140 }}>
                {statusEl}
                <span className={styles.statusDate}>
                    ({formatDate(d.startDate)} - {formatDate(d.endDate)})
                </span>
                {showActiveBtn && onActive && (
                    <button
                        className="btn btn-success btn-sm mt-1"
                        onClick={() => onActive(d._id)}
                    >
                        Kích hoạt
                    </button>
                )}
            </div>
        );
    };

    const now = new Date();
    const filteredDiscounts = discounts.filter((d) => {
        // Lọc loại mã
        if (typeFilter === "allshop" && d.targetType !== "all") return false;
        if (typeFilter === "product" && d.targetType !== "product") return false;
        if (typeFilter === "category" && d.targetType !== "category") return false;

        // Lọc trạng thái
        const from = d.startDate ? new Date(d.startDate) : null;
        const to = d.endDate ? new Date(d.endDate) : null;
        if (statusFilter === "active") {
            if (to && now > to) return false;
            if (!d.active) return false;
            if (from && now < from) return false;
        }
        if (statusFilter === "expired" && (!to || now <= to)) return false;
        if (statusFilter === "inactive" && d.active) return false;
        if (statusFilter === "future" && (!from || now >= from)) return false;

        return true;
    });

    return (
        <>
            <div className="mb-2 d-flex gap-2">
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">Tất cả loại mã</option>
                    <option value="allshop">Toàn shop</option>
                    <option value="product">Theo sản phẩm</option>
                    <option value="category">Theo danh mục</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="expired">Hết hạn</option>
                    <option value="inactive">Chưa kích hoạt</option>
                </select>
            </div>
            <table className="table table-hover table-bordered">
                <thead>
                    <tr>
                        <th>Mã giảm giá</th>
                        <th>Mô tả</th>
                        <th>Loại mã áp dụng</th>
                        <th>Phần trăm / Số tiền</th>
                        <th>Đơn tối thiểu</th>
                        <th>Giảm tối đa</th>
                        <th>Lượt dùng</th>
                        <th>Trạng thái & hiệu lực</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDiscounts.map((d, idx) => (
                        <tr key={d._id}>
                            <td>{d.discountCode}</td>
                            <td>{d.description}</td>
                            <td>{renderDiscountType(d)}</td>
                            <td>{renderValue(d)}</td>
                            <td>{formatNumber(d.minOrderValue)}đ</td>
                            <td>{formatMaxDiscount(d.maxDiscount)}</td>
                            <td>{(d.used ?? 0)}/{d.usageLimit ?? 0}</td>
                            <td>{renderStatus(d)}</td>
                            <td>
                                <a
                                    href={`/admin/discount/editdiscount/${d._id}`}
                                    className="btn btn-primary btn-sm me-2"
                                    title="Sửa"
                                >
                                    <i className="fas fa-edit"></i>
                                </a>
                            </td>
                        </tr>
                    ))}
                    {filteredDiscounts.length === 0 && (
                        <tr>
                            <td colSpan={9} className="text-center">
                                Không có mã giảm giá nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
}
