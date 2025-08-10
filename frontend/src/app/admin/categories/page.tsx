"use client";
import { SubcategoryModal } from "@/app/components/admin/SubcategoryModal";
import { CategoryTable } from "@/app/components/admin/CategoryTable";
import { useCategory } from "@/app/hooks/useCategory";
import React, { useState, useEffect } from "react";
import { CategoryModal } from "@/app/components/admin/CategoryModal";
import "../admin.css";

export default function CategoryManagement() {
  const {
    categories,
    addCategory,
    toggleVisibility,
    updateCategoryName,
    addSubcategoryToCategory,
    toggleSubcategoryVisibility,
    updateSubcategoryName,
    fetchCategories,
  } = useCategory();

  // Modal states:
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showSubModal, setShowSubModal] = useState(false);
  const [subParentId, setSubParentId] = useState<string | null>(null);

  // --- Sửa subcategory ---
  const [showSubEditModal, setShowSubEditModal] = useState(false);
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubParentId, setEditSubParentId] = useState<string | null>(null);

  const [clock, setClock] = useState("");

  // Đồng hồ realtime
  useEffect(() => {
    function updateClock() {
      const today = new Date();
      const weekday = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const day = weekday[today.getDay()];
      let dd: string | number = today.getDate();
      let mm: string | number = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      let h: string | number = today.getHours();
      let m: string | number = today.getMinutes();
      let s: string | number = today.getSeconds();
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s;
      dd = dd < 10 ? "0" + dd : dd;
      mm = mm < 10 ? "0" + mm : mm;
      const nowTime = `${h} giờ ${m} phút ${s} giây`;
      const dateStr = `${day}, ${dd}/${mm}/${yyyy}`;
      setClock(`${dateStr} - ${nowTime}`);
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);


  // Bắt sự kiện sửa
  const handleEdit = (_id: string, isSub?: boolean, parentId?: string) => {
    if (isSub && parentId) {
      const cat = categories.find(c => c._id === parentId);
      const sub = cat?.subcategories?.find(s => s._id === _id);
      if (sub) {
        setEditSubId(_id);
        setEditSubParentId(parentId);
        setEditSubName(sub.name);
        setShowSubEditModal(true);
      }
      return;
    }
    const cat = categories.find(c => c._id === _id);
    if (cat) {
      setEditId(_id);
      setEditName(cat.name);
      setShowModal(true);
    }
  };

  const handleSaveEdit = async ({ name }: { name: string; hidden: boolean }) => {
    if (editId) {
      await updateCategoryName(editId, name);
      setShowModal(false);
      setEditId(null);
      setEditName("");
    }
  };

  // Sửa subcategory (gọi useCategory, sau đó fetchCategories lại)
  const handleSaveEditSub = async (name: string) => {
    if (editSubId && editSubParentId) {
      await updateSubcategoryName(editSubId, name, editSubParentId);
      setShowSubEditModal(false);
      setEditSubId(null);
      setEditSubName("");
      setEditSubParentId(null);
    }
  };

  const handleAddSub = (parentId: string) => {
    setSubParentId(parentId);
    setShowSubModal(true);
  };
  const handleSaveSub = async (name: string) => {
    if (subParentId) {
      await addSubcategoryToCategory(subParentId, { name, hidden: false });
    }
    setShowSubModal(false);
    setSubParentId(null);
  };

  return (
    <main className="app-content">
      <div className="app-title">
        <ul className="app-breadcrumb breadcrumb side">
          <li className="breadcrumb-item active">
            <a href="#categories">
              <b>Danh sách danh mục</b>
            </a>
          </li>
        </ul>
        <div id="clock">{clock}</div>
      </div>
      <div className="tile">
        <div className="tile-body">
          <button className="btn btn-add btn-sm mb-3" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Thêm danh mục
          </button>
            <CategoryTable
              categories={categories}
              onToggleVisibility={(id, isSub, parentId) => {
                if (isSub && parentId) {
                  toggleSubcategoryVisibility(id, parentId);
                } else {
                  toggleVisibility(id);
                }
              }}
              onEdit={handleEdit}
              onAddSub={handleAddSub}
            />
          {showModal && (
            <CategoryModal
              onClose={() => {
                setShowModal(false);
                setEditId(null);
                setEditName("");
              }}
              onSave={editId ? handleSaveEdit : addCategory}
              initialName={editId ? editName : ""}
            />
          )}
          {showSubModal && (
            <SubcategoryModal
              onClose={() => setShowSubModal(false)}
              onSave={handleSaveSub}
            />
          )}
          {showSubEditModal && (
            <SubcategoryModal
              onClose={() => setShowSubEditModal(false)}
              onSave={handleSaveEditSub}
              initialName={editSubName}
            />
          )}
        </div>
      </div>
    </main>
  );
}