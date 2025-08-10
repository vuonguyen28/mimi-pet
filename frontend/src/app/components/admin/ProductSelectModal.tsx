"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Modal, Table, Input, Select, Pagination, Button } from "antd";
import type { TableProps } from "antd/es/table";
import { SearchOutlined, FilterFilled } from "@ant-design/icons";
import styles from "@/app/styles/admin/productselectmodal.module.css"; // Sử dụng CSS module

const { Option } = Select;

export interface ProductSelectModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (selectedIds: string[]) => void;
    products: {
        id: string;
        name: string;
        price: number;
        image: string;
        categoryId: string;
        subcategoryId?: { id: string; name: string } | null;
        variants?: { quantity: number }[];
    }[];
    categories: {
        id: string;
        name: string;
        children?: { id: string; name: string }[];
    }[];
    selectedIds: string[];
}

type PriceFilterType = "all" | "0-100" | "100-500" | "500-1000" | "1000+";
type StockFilterType = "all" | "0" | "1-10" | "11-100" | "100+";

export default function ProductSelectModal(props: ProductSelectModalProps) {
    const { show, onClose, onSave, products, categories, selectedIds } = props;

    const [productSearch, setProductSearch] = useState("");
    const [productCategoryFilter, setProductCategoryFilter] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(selectedIds);

    const [priceFilter, setPriceFilter] = useState<PriceFilterType>("all");
    const [stockFilter, setStockFilter] = useState<StockFilterType>("all");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    const prevShow = useRef(show);
    useEffect(() => {
        if (!prevShow.current && show) setSelectedRowKeys(selectedIds);
        prevShow.current = show;
    }, [show, selectedIds]);

    useEffect(() => {
        setPage(1);
    }, [productSearch, productCategoryFilter, priceFilter, stockFilter]);

    function getAllCategoryIds(category: any): string[] {
        if (!category.children || !category.children.length) return [category.id];
        return [category.id, ...category.children.flatMap(getAllCategoryIds)];
    }

    const allValidCategoryIds = useMemo(() => {
        if (!productCategoryFilter) return [];
        const findCat = (cats: any[]): any | null =>
            cats.find(cat => cat.id === productCategoryFilter) ||
            cats.flatMap(cat => cat.children || []).map(findCat).find(Boolean);
        const found = findCat(categories);
        return found ? getAllCategoryIds(found) : [productCategoryFilter];
    }, [productCategoryFilter, categories]);

    const getQuantity = (prod: ProductSelectModalProps['products'][0]) => {
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            return prod.variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);
        }
        return 0;
    };

    let filteredProducts = useMemo(
        () =>
            products.filter((prod) => {
                const qty = getQuantity(prod);
                const matchName =
                    (prod.name ?? "")
                        .toLowerCase()
                        .includes((productSearch ?? "").toLowerCase());
                const matchCat = !productCategoryFilter
                    ? true
                    : allValidCategoryIds.includes(prod.categoryId) ||
                    (prod.subcategoryId && prod.subcategoryId.id && allValidCategoryIds.includes(prod.subcategoryId.id));
                let matchPrice = true;
                let price = prod.price ?? 0;
                if (priceFilter !== "all") {
                    if (priceFilter === "0-100") matchPrice = price >= 0 && price < 100_000;
                    else if (priceFilter === "100-500") matchPrice = price >= 100_000 && price < 500_000;
                    else if (priceFilter === "500-1000") matchPrice = price >= 500_000 && price < 1_000_000;
                    else if (priceFilter === "1000+") matchPrice = price >= 1_000_000;
                }
                let matchStock = true;
                if (stockFilter !== "all") {
                    if (stockFilter === "0") matchStock = qty === 0;
                    else if (stockFilter === "1-10") matchStock = qty >= 1 && qty <= 10;
                    else if (stockFilter === "11-100") matchStock = qty >= 11 && qty <= 100;
                    else if (stockFilter === "100+") matchStock = qty > 100;
                }
                if (stockFilter === "all" && qty === 0) return false;
                return matchName && matchCat && matchPrice && matchStock;
            }),
        [products, productSearch, productCategoryFilter, allValidCategoryIds, priceFilter, stockFilter]
    );

    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, page, pageSize]);

    const getImageUrl = (image: string) => {
        if (!image) return "http://localhost:3000/images/no-image.png";
        if (/^https?:\/\//.test(image)) return image;
        const fileName = image.split("/").pop();
        return `http://localhost:3000/images/${fileName}`;
    };

    const priceFilters: { text: string; value: PriceFilterType }[] = [
        { text: "Tất cả", value: "all" },
        { text: "0 - 100k", value: "0-100" },
        { text: "100k - 500k", value: "100-500" },
        { text: "500k - 1 triệu", value: "500-1000" },
        { text: "Trên 1 triệu", value: "1000+" },
    ];
    const stockFilters: { text: string; value: StockFilterType }[] = [
        { text: "Tất cả", value: "all" },
        { text: "Hết hàng", value: "0" },
        { text: "1 - 10", value: "1-10" },
        { text: "11 - 100", value: "11-100" },
        { text: "Trên 100", value: "100+" },
    ];


    const columns: TableProps<ProductSelectModalProps['products'][0]>['columns'] = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            width: 240,
            render: (_: any, record) => (
                <div className={styles["psm-product-cell"]}>
                    <img
                        src={getImageUrl(record.image)}
                        alt={record.name}
                        className={styles["psm-product-img"]}
                        onError={(e) => { (e.target as HTMLImageElement).src = "http://localhost:3000/images/no-image.png"; }}
                    />
                    <div>
                        <div className={styles["psm-product-name"]}>{record.name}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            width: 160,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div style={{ padding: 8, minWidth: 180 }}>
                    {priceFilters.map(opt => (
                        <div key={opt.value} style={{ marginBottom: 4 }}>
                            <label style={{ cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    checked={selectedKeys[0] === opt.value}
                                    onChange={() => setSelectedKeys([opt.value])}
                                    style={{ marginRight: 6 }}
                                />
                                {opt.text}
                            </label>
                        </div>
                    ))}
                    <div style={{ marginTop: 8, textAlign: "right" }}>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => confirm()}
                            style={{ background: "#e7537a", border: "none" }}
                        >
                            Áp dụng
                        </Button>
                    </div>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterFilled style={{
                    color: filtered && priceFilter !== "all" ? "#e7537a" : "#aaa",
                    fontSize: 18,
                }} />
            ),
            filteredValue: [priceFilter],
            render: (price: number) => <span>{price?.toLocaleString?.() ?? "-"} đ</span>,
        },
        {
            title: "Kho hàng",
            dataIndex: "variants",
            width: 120,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div style={{ padding: 8, minWidth: 180 }}>
                    {stockFilters.map(opt => (
                        <div key={opt.value} style={{ marginBottom: 4 }}>
                            <label style={{ cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    checked={selectedKeys[0] === opt.value}
                                    onChange={() => setSelectedKeys([opt.value])}
                                    style={{ marginRight: 6 }}
                                />
                                {opt.text}
                            </label>
                        </div>
                    ))}
                    <div style={{ marginTop: 8, textAlign: "right" }}>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => confirm()}
                            style={{ background: "#e7537a", border: "none" }}
                        >
                            Áp dụng
                        </Button>
                    </div>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterFilled style={{
                    color: filtered && stockFilter !== "all" ? "#e7537a" : "#aaa",
                    fontSize: 18,
                }} />
            ),
            filteredValue: [stockFilter],
            render: (_: any, record) => {
                const qty = getQuantity(record);
                return qty === 0 ? <span style={{ color: "#ff4d4f", fontWeight: 500 }}>Hết hàng</span> : qty;
            },
        },
    ];


    const handleTableChange: TableProps<ProductSelectModalProps['products'][0]>["onChange"] = (pagination, filters, sorter) => {
        if (filters.price && Array.isArray(filters.price) && filters.price[0]) {
            setPriceFilter(filters.price[0] as PriceFilterType);
        }
        if (filters.variants && Array.isArray(filters.variants) && filters.variants[0]) {
            setStockFilter(filters.variants[0] as StockFilterType);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
        getCheckboxProps: (record: ProductSelectModalProps['products'][0]) => ({
            disabled: false,
        }),
    };

    return (
        <Modal
            open={show}
            onCancel={onClose}
            title={<span style={{ color: "#e7537a", fontWeight: 700, fontSize: 20 }}>Chọn Sản Phẩm</span>}
            footer={[
                <Button key="cancel" onClick={onClose} style={{ border: "1px solid #ffb6d5", color: "#e7537a", fontWeight: 600 }}>
                    Hủy
                </Button>,
                <Button key="save" type="primary" style={{ color: "white", background: "#e7537a", border: "none", fontWeight: 600 }} onClick={() => onSave(selectedRowKeys)} disabled={selectedRowKeys.length === 0}>
                    Xác nhận
                </Button>,
            ]}
            width={1000}
            style={{ top: 64, borderRadius: 14 }}
            styles={{ body: { padding: 0 } }}
            destroyOnHidden
        >
            <div style={{ padding: "18px 24px 0 24px" }}>
                <div className="d-flex align-items-end" style={{ gap: 14, marginBottom: 18 }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: "#df6b99" }} />}
                        placeholder="Tìm sản phẩm theo tên"
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        style={{ width: 350, borderRadius: 8, background: "#fff", border: "1px solid #ffc1e1" }}
                        allowClear
                    />
                    <Select
                        value={productCategoryFilter}
                        onChange={(val) => setProductCategoryFilter(val)}
                        style={{ width: 230, borderRadius: 8, background: "#fff", border: "1px solid #ffc1e1", fontWeight: 500, color: "#e7537a" }}
                        allowClear
                        placeholder="Tất cả danh mục"
                    >
                        <Option value="">Tất cả danh mục</Option>
                        {categories.map(cat => (
                            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                        ))}
                    </Select>
                </div>
                <Table
                    columns={columns}
                    dataSource={paginatedProducts}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ y: 340, x: 800 }}
                    style={{ marginBottom: 0, background: "#fff" }}
                    rowSelection={rowSelection}
                    onChange={handleTableChange}
                />
                <div className="d-flex justify-content-end mt-3 mb-2">
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={filteredProducts.length}
                        onChange={(p, size) => {
                            setPage(p);
                            setPageSize(size || 8);
                        }}
                        showSizeChanger
                        pageSizeOptions={["8", "12", "20"]}
                        showTotal={total => `Tổng ${total} sản phẩm`}
                    />
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontWeight: 600, color: "#e7537a", fontSize: 16 }}>
                        Đã chọn {selectedRowKeys.length} sản phẩm
                    </span>
                </div>
            </div>
        </Modal>
    );
}