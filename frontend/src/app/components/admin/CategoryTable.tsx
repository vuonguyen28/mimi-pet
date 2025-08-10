import { Category } from "@/app/types/categoryD";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "@/app/admin/admin.css";

type Props = {
  categories: Category[];
  onToggleVisibility: (_id: string, isSub?: boolean, parentId?: string) => void;
  onEdit: (_id: string, isSub?: boolean, parentId?: string) => void;
  onAddSub: (parentId: string) => void;
};

export const CategoryTable = ({
  categories = [],
  onToggleVisibility,
  onEdit,
  onAddSub,
}: Props) => {
  const [showSubs, setShowSubs] = useState<{ [id: string]: boolean }>({});

  const handleToggleSubs = (catId: string) => {
    setShowSubs(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <table className="table table-hover table-bordered">
      <thead>
        <tr>
          <th>Tên danh mục</th>
          <th>Trạng thái</th>
          <th>Ẩn/Hiện</th>
          <th>Sửa</th>
          <th>Danh mục con</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.map((cat) => (
            <React.Fragment key={cat._id}>
              <tr>
                <td>
                  <span style={{ fontWeight: "bold" }}>
                    {cat.name}{" "}
                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      <button
                        style={{
                          border: "none",
                          background: "none",
                          marginRight: 6,
                          cursor: "pointer",
                          color: "#007bff"
                        }}
                        title={showSubs[cat._id] ? "Ẩn danh mục con" : "Hiện danh mục con"}
                        onClick={() => handleToggleSubs(cat._id)}
                      >
                        <i className={`fas fa-chevron-${showSubs[cat._id] ? "down" : "right"}`}></i>
                      </button>
                    ) : (
                      <i></i>
                    )}
                  </span>
                </td>
                <td>
                  <span className={`badge ${cat.hidden ? "bg-secondary" : "bg-success"}`}>
                    {cat.hidden ? "Đã ẩn" : "Hiển thị"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => {
                      console.log("[Table] Ẩn/Hiện category", cat._id, "hidden:", cat.hidden);
                      onToggleVisibility(cat._id);
                    }}
                  >
                    <i className={`fas ${cat.hidden ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => onEdit(cat._id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => onAddSub(cat._id)}
                  >
                    <i className="fas fa-plus"></i> Thêm danh mục con
                  </button>
                </td>
              </tr>
{cat.subcategories && cat.subcategories.length > 0 && showSubs[cat._id] && (
  <>
    {/* Log toàn bộ mảng subcategories của category này */}
    {/* {console.log("Subcategories của category", cat.name, ":", cat.subcategories)} */}
    {cat.subcategories.map((sub) => {
      // Log từng subcategory (với cả hidden và typeof)
      console.log("Render sub:", sub.name, "hidden:", sub.hidden, "typeof:", typeof sub.hidden);
      return (
        <tr key={sub._id} style={{ background: "#f9f9f9" }}>
          <td style={{ paddingLeft: 40 }}>
            <span>{sub.name}</span>
          </td>
          <td>
            <span className={`badge ${sub.hidden ? "bg-secondary" : "bg-success"}`}>
              {sub.hidden ? "Đã ẩn" : "Hiển thị"}
            </span>
          </td>
          <td>
            <button
              className="btn btn-light btn-sm"
              onClick={() => {
                console.log("[Table] Ẩn/Hiện subcategory", sub._id, "trong category", cat._id, "hidden:", sub.hidden);
                onToggleVisibility(sub._id, true, cat._id);
              }}
            >
              <i className={`fas ${sub.hidden ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </td>
          <td>
            <button
              className="btn btn-info btn-sm"
              onClick={() => onEdit(sub._id, true, cat._id)}
            >
              <i className="fas fa-edit"></i>
            </button>
          </td>
          <td></td>
        </tr>
      );
    })}
  </>
)}
            </React.Fragment>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="text-center">
              Không có danh mục nào.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};