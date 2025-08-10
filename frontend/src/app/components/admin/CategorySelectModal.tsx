"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Modal, Table, Button } from "antd";
import { DeleteOutlined, RightOutlined, DownOutlined } from "@ant-design/icons";
import styles from "@/app/styles/admin/categoryselectmodal.module.css";

export interface Category {
    id: string;
    name: string;
    children?: Category[];
}
export interface CategorySelectModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (selectedIds: string[]) => void;
    categories: Category[];
    selectedIds: string[];
}

export default function CategorySelectModal(props: CategorySelectModalProps) {
    const { show, onClose, onSave, categories, selectedIds } = props;

    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(selectedIds);
    const [openParentIds, setOpenParentIds] = useState<string[]>([]);

    useEffect(() => {
        if (show) {
            setSelectedRowKeys(selectedIds);
            setOpenParentIds([]);
        }
    }, [show, selectedIds]);

    // Flatten all categories for tag display
    const allCategories = useMemo(() => {
        const flatten = (cats: Category[]) => {
            let arr: { id: string; name: string }[] = [];
            cats.forEach((cat) => {
                arr.push({ id: cat.id, name: cat.name });
                if (cat.children && cat.children.length > 0)
                    arr = arr.concat(flatten(cat.children));
            });
            return arr;
        };
        return flatten(categories);
    }, [categories]);
    const getNameById = (id: string) => allCategories.find((cat) => cat.id === id)?.name || id;

    const handleRemove = (id: string) => setSelectedRowKeys((prev) => prev.filter((cid) => cid !== id));

    // Table columns
    const columns = [
        {
            title: "Tên danh mục",
            dataIndex: "name",
            render: (_: any, record: { id: string; name: string; isSub?: boolean; hasChildren?: boolean }) => (
                <div
                    className={`${styles.rowFlex} ${record.isSub ? styles.subcategory : ""}`}
                    style={record.isSub ? { paddingLeft: 40 } : undefined}
                >
                    <span>{record.name}</span>
                    {!record.isSub && record.hasChildren ? (
                        <span
                            onClick={e => {
                                e.stopPropagation();
                                const isOpen = openParentIds.includes(record.id);
                                setOpenParentIds(isOpen
                                    ? openParentIds.filter(id => id !== record.id)
                                    : [...openParentIds, record.id]);
                            }}
                            className={`${styles.arrowBtn} ${openParentIds.includes(record.id) ? styles.arrowOpen : ""}`}
                        >
                            {openParentIds.includes(record.id) ? (
                                <DownOutlined />
                            ) : (
                                <RightOutlined />
                            )}
                        </span>
                    ) : null}
                </div>
            ),
        },
    ];

    // Xử lý chọn cha tự động chọn con và expand (và sửa warning antd Modal)
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[], selectedRows: any[]) => {
            let newSelectedKeys = [...(keys as string[])];
            let newOpenParentIds = [...openParentIds];

            categories.forEach(cat => {
                if (newSelectedKeys.includes(cat.id)) {
                    if (cat.children && cat.children.length > 0) {
                        const childIds = cat.children.map(c => c.id);
                        childIds.forEach(cid => {
                            if (!newSelectedKeys.includes(cid)) newSelectedKeys.push(cid);
                        });
                        // Tự expand cha nếu chưa expand
                        if (!newOpenParentIds.includes(cat.id)) {
                            newOpenParentIds.push(cat.id);
                        }
                    }
                } else {
                    if (cat.children && cat.children.length > 0) {
                        const childIds = cat.children.map(c => c.id);
                        newSelectedKeys = newSelectedKeys.filter(k => !childIds.includes(k));
                        // Nếu muốn tự động thu lại khi bỏ chọn cha, bỏ comment dòng dưới:
                        // newOpenParentIds = newOpenParentIds.filter(id => id !== cat.id);
                    }
                }
            });

            setSelectedRowKeys(newSelectedKeys);
            setOpenParentIds(newOpenParentIds);
        },
        getCheckboxProps: (record: { id: string }) => ({
            disabled: false,
        }),
    };

    // Build dataSource: insert subcategories after parent if expanded
    function buildTableData(cats: Category[]): any[] {
        let res: any[] = [];
        cats.forEach((cat) => {
            const { children, ...restCat } = cat;
            res.push({
                key: restCat.id,
                ...restCat,
                hasChildren: !!(cat.children && cat.children.length > 0)
            });
            if (cat.children && cat.children.length > 0 && openParentIds.includes(cat.id)) {
                res = res.concat(
                    cat.children.map((c) => {
                        const { children, ...restSub } = c;
                        return {
                            key: restSub.id,
                            ...restSub,
                            isSub: true
                        };
                    })
                );
            }
        });
        return res;
    }

    const tableData = useMemo(() => buildTableData(categories), [categories, openParentIds]);

    return (
        <Modal
            open={show}
            onCancel={onClose}
            title={
                <span className={styles.modalTitle}>
                    Chọn Danh Mục
                </span>
            }
            footer={[
                <Button
                    key="cancel"
                    onClick={onClose}
                    className={styles.cancelBtn}
                >
                    Hủy
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    className={styles.saveBtn}
                    onClick={() => onSave(selectedRowKeys)}
                    disabled={selectedRowKeys.length === 0}
                >
                    Xác nhận
                </Button>,
            ]}
            width={700}
            style={{ top: 64, borderRadius: 14 }}
            styles={{ body: { padding: 0 } }}  // Sửa warning bodyStyle
            destroyOnHidden                   // Sửa warning destroyOnClose
        >
            <div style={{ padding: "18px 24px 0 24px" }}>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ y: 330 }}
                    style={{ marginBottom: 0, background: "#fff" }}
                    rowSelection={rowSelection}
                    rowClassName={record => record.isSub ? styles.subcategoryRow : ""}
                    components={{
                        body: {
                            row: (props: any) => {
                                const { prefixCls, ...rest } = props;
                                if (props.className?.includes(styles.subcategoryRow)) {
                                    return <tr {...rest} style={{ ...props.style, background: "#f8fafd" }} />;
                                }
                                return <tr {...rest} />;
                            }
                        }
                    }}
                />

                {/* Tag đã chọn */}
                <div style={{ margin: "16px 0 8px 0" }}>
                    <ul className={styles.ctagsList}>
                        {selectedRowKeys.map((cid) => (
                            <li key={cid} className={styles.ctag}>
                                <span style={{ marginRight: 8 }}>{getNameById(cid)}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(cid)}
                                    className={styles.deleteBtn}
                                    tabIndex={-1}
                                    title="Xóa"
                                >
                                    <DeleteOutlined />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={styles.selectedCount}>
                        Đã chọn {selectedRowKeys.length} danh mục
                    </span>
                </div>
            </div>
        </Modal>
    );
}