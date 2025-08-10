"use client";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../admin.css";

type Comment = {
  id: string;
  user: string;
  product: string;
  content: string;
  date: string;
  visible: boolean;
};

const initialComments: Comment[] = [
  {
    id: "BL001",
    user: "Nguyễn Văn A",
    product: "Sản phẩm A",
    content: "Chất lượng tốt, giao hàng nhanh.",
    date: "25/05/2025",
    visible: true,
  },
  {
    id: "BL002",
    user: "Trần Thị B",
    product: "Sản phẩm B",
    content: "Hàng ổn, sẽ ủng hộ tiếp.",
    date: "24/05/2025",
    visible: false,
  },
  // Thêm các bình luận khác nếu cần
];

export default function CommentManagement() {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Toggle ẩn/hiện bình luận
  const handleToggleVisibility = (id: string) => {
    setComments(comments =>
      comments.map(c =>
        c.id === id ? { ...c, visible: !c.visible } : c
      )
    );
  };

  // Xóa bình luận
  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      setComments(comments => comments.filter(c => c.id !== id));
    }
  };

  return (
    <main className="app-content">
      <div className="app-title">
        <ul className="app-breadcrumb breadcrumb">
          <li className="breadcrumb-item">Quản lý bình luận</li>
        </ul>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="tile">
            <h3 className="tile-title">Danh sách bình luận</h3>
            <div className="tile-body">
              <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>ID bình luận</th>
                    <th>Tên người dùng</th>
                    <th>Tên sản phẩm</th>
                    <th>Bình luận</th>
                    <th>Ngày đăng</th>
                    <th>Trạng thái</th>
                    <th>Hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map(comment => (
                    <tr key={comment.id}>
                      <td>{comment.id}</td>
                      <td>{comment.user}</td>
                      <td>{comment.product}</td>
                      <td>{comment.content}</td>
                      <td>{comment.date}</td>
                      <td>
                        <span className={`badge ${comment.visible ? "bg-success" : "bg-secondary"}`}>
                          {comment.visible ? "Hiển thị" : "Đã ẩn"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-light btn-sm toggle-visibility"
                          type="button"
                          title="Ẩn/Hiện"
                          onClick={() => handleToggleVisibility(comment.id)}
                        >
                          <i className={`fas ${comment.visible ? "fa-eye" : "fa-eye-slash"}`}></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-delete-comment"
                          type="button"
                          title="Xóa"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {comments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center">Không có bình luận nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}