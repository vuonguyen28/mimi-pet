"use client";
import React, { useEffect, useState } from "react";
import { useShowMessage } from '@/app/utils/useShowMessage';
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../admin.css";

// Kiểu dữ liệu bài viết trả về từ backend
type Post = {
  _id: string;
  title: string;
  categoryId: string;
  createdAt?: string;
  date?: string;
  visible?: boolean;
  hidden?: boolean;
  priority?: boolean;
  img?: string;
  images?: string[];
  description?: string;
  content?: string;
  tags?: string;
  shortDesc?: string;
};

// Kiểu dữ liệu cho category
type Category = {
  _id: string;
  title: string;
  slug: string;
};

const emptyForm = {
  title: "",
  date: "",
  img: null as File | string | null,
  images: [] as (File | string)[],
  categoryId: "",
  tags: "",
  content: "",
  description: "",
  priority: false,
};

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories
useEffect(() => {
  const token = localStorage.getItem("token"); // hoặc từ cookie nếu bạn dùng cookie

  fetch("http://localhost:3000/api/postscategories", {
    headers: {
      Authorization: `Bearer ${token || ""}`
    }
  })
    .then((res) => res.json())
    .then((data) => {
      let arr: Category[] = [];
      if (Array.isArray(data)) {
        arr = data;
      } else if (data.categories && Array.isArray(data.categories)) {
        arr = data.categories;
      } else if (data.data && Array.isArray(data.data)) {
        arr = data.data;
      }
      setCategories(arr);
    })
    .catch(() => setCategories([]));
}, []);
  
  // Hiển thị thông báo
  const showMessage = useShowMessage('', '');
  // thong báo xác nhận xóa bài viết
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  // Fetch posts
  const fetchPosts = () => {
    setLoading(true);
    fetch("http://localhost:3000/api/posts")
      .then((res) => res.json())
      .then((data) => {
        let arr: Post[] = Array.isArray(data) ? data : data.items || [];
        setPosts(arr);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Hiển thị form sửa
  const handleEditPost = (post: Post) => {
    setEditingId(post._id);
    setForm({
      title: post.title,
      date: post.date?.slice(0, 10) || post.createdAt?.slice(0, 10) || "",
      img: post.img || null,
      images: post.images ? [...post.images] : [],
      categoryId: post.categoryId,
      tags: post.tags || "",
      content: post.content || "",
      description: post.shortDesc || post.description || "",
      priority: post.priority || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [removedImages, setRemovedImages] = useState<string[]>([]);

  // Khi chọn ảnh mới
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm(prev => ({
      ...prev,
      images: [...(prev.images || []), ...files]
    }));
  };

  // Xóa ảnh 
  const handleRemoveImage = (indexToRemove: number) => {
    const removed = form.images[indexToRemove];
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    showMessage.info(`Đã xóa ảnh ${typeof removed === 'string' ? removed : removed.name}`);
  };


//  // Xóa ảnh đại diện
//   const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setForm(prev => ({ ...prev, img: file }));
//     }
//   };

  const handleRemoveMainImage = () => {
    setForm(prev => ({ ...prev, img: null }));
    showMessage.info("Đã xóa ảnh đại diện");
  };


  // Toggle ẩn/hiện
const handleToggleVisibility = async (id: string) => {
  const post = posts.find(p => p._id === id);
  if (!post) return;

  const isVisible = typeof post.visible === 'boolean' ? post.visible : !post.hidden;

  await fetch(`http://localhost:3000/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visible: !isVisible,
      hidden: isVisible,
    }),
  });

  fetchPosts();
};



  // Xóa bài viết
  const handleDeletePost = (post: Post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };
  // Xác nhận xóa bài viết
    const confirmDeletePost = async () => {
    if (!postToDelete) return;
    await fetch(`http://localhost:3000/api/posts/${postToDelete._id}`, {
      method: "DELETE",
    });
    showMessage.success("Đã xóa bài viết");
    setShowDeleteConfirm(false);
    setPostToDelete(null);
    fetchPosts();
  };



const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value, type, checked, files } = e.target as any;

  if (type === "checkbox") {
    setForm((prev) => ({ ...prev, [name]: checked }));
  } else if (type === "file") {
    if (name === "img") {
      setForm((prev) => ({ ...prev, img: files[0] }));
    } else if (name === "images") {
      const newFiles = Array.from(files) as File[];
      setForm((prevForm) => ({
        ...prevForm,
        images: [...((prevForm.images || []) as (File | string)[]), ...newFiles],
      }));
    }
  } else {
    setForm((prev) => ({ ...prev, [name]: value }));
  }
};



  // Thêm hoặc cập nhật bài viết
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("date", form.date);
  formData.append("categoryId", form.categoryId);
  formData.append("tags", form.tags || "");
  formData.append("content", form.content || "");
  formData.append("description", form.description || "");
  formData.append("shortDesc", form.description || "");
  formData.append("priority", form.priority ? "true" : "false");

  // Ảnh chính
  if (form.img && typeof form.img !== "string") {
    formData.append("img", form.img); // file mới
  } else if (typeof form.img === "string") {
    formData.append("existingImg", form.img); // giữ ảnh cũ
  }

  // Ảnh phụ
  form.images.forEach((img) => {
    if (typeof img === "string") {
      formData.append("existingImages", img); // giữ ảnh cũ
    } else {
      formData.append("images", img); // thêm ảnh mới
    }
  });

  if (editingId) {
    await fetch(`http://localhost:3000/api/posts/${editingId}`, {
      method: "PUT",
      body: formData,
    });
    showMessage.success("Cập nhật bài viết thành công");
  } else {
    await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      body: formData,
    });
    showMessage.success("Thêm bài viết thành công");
  }

  setForm({ ...emptyForm });
  setEditingId(null);
  fetchPosts();
};


  // Hủy bỏ form
  const handleCancel = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  // Lấy tên danh mục từ id
  const getCategoryTitle = (categoryId: string) => {
    return categories.find(cat => cat._id === categoryId)?.title || "";
  };

  return (
    <main className="app-content">
      <div className="app-title">
        <ul className="app-breadcrumb breadcrumb">
          <li className="breadcrumb-item">Danh sách bài viết</li>
          <li className="breadcrumb-item">
            <a href="#">{editingId ? "Sửa bài viết" : "Tạo bài viết mới"}</a>
          </li>
        </ul>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="tile">
            <h3 className="tile-title">
              {editingId ? "Sửa bài viết" : "Tạo mới bài viết"}
            </h3>
            <div className="tile-body">
              <form className="row" onSubmit={handleSubmit} autoComplete="off" encType="multipart/form-data">
                <div className="form-group col-md-6">
                  <label className="control-label">Tiêu đề bài viết</label>
                  <input
                    className="form-control"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề bài viết"
                    required
                  />
                </div>
                <div className="form-group col-md-6">
                  <label className="control-label">Ngày đăng</label>
                  <input
                    className="form-control"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group col-md-6">
                  <label className="control-label">Ảnh đại diện (img)</label>
                  <input
                    className="form-control"
                    type="file"
                    name="img"
                    accept="image/*"
                    onChange={handleChange}
                    required={!editingId && !form.img} 
                  />
                  {form.img && (
                    <div className="mt-2 d-flex align-items-center gap-2">
                      <span>
                        {typeof form.img === "string" ? form.img : form.img.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={handleRemoveMainImage}
                      >
                        Xóa ảnh đại diện
                      </button>
                    </div>
                  )}
                </div>
                <div className="form-group col-md-6">
                  <label className="control-label">Ảnh mô tả (nhiều ảnh/images)</label>
                  <input
                    className="form-control"
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                  />
                  {form.images?.length > 0 && (
                    <div className="mt-2">
                      <b>Ảnh đã thêm:</b>
                      <ul style={{ paddingLeft: 20 }}>
                        {form.images.map((img, idx) => (
                          <li key={idx} className="d-flex align-items-center gap-2">
                            {typeof img === "string" ? img : img.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="btn btn-sm btn-danger"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="form-group col-md-6">
                  <label className="control-label">Danh mục</label>
                  <select
                    className="form-control"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {Array.isArray(categories) &&
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.title}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group col-md-6">
                <label className="control-label">Tags (phân tách bằng dấu phẩy)</label>
                <input
                  className="form-control"
                  type="text"
                  name="tags"
                  value={(form as any).tags || ""}
                  onChange={handleChange}
                  placeholder="VD: tin tức, công nghệ, react"
                  required
                />
              </div>
                <div className="form-group col-md-12">
                  <label className="control-label">Nội dung bài viết</label>
                  <textarea
                    className="form-control"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="Nhập nội dung bài viết"
                    style={{ minHeight: "200px" }} 
                    required
                  />
                </div>
                <div className="form-group col-md-12">
                  <label className="control-label">Mô tả ngắn</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Nhập mô tả ngắn"
                    required
                  />
                </div>
                <div className="form-group col-md-12">
                  <button className="btn btn-save" type="submit">
                    {editingId ? "Cập nhật" : "Lưu lại"}
                  </button>
                  <button
                    className="btn btn-cancel"
                    type="button"
                    onClick={handleCancel}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Danh sách bài viết */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="tile">
            <h3 className="tile-title">Danh sách bài viết</h3>
            <div className="tile-body">
              <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề bài viết</th>
                    <th>Danh mục</th>
                    <th>Ngày đăng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Không có bài viết nào.
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => {
                      const isVisible = typeof post.visible === "boolean"
                        ? post.visible
                        : !post.hidden;
                      return (
                        <tr key={post._id}>
                          <td>{post._id}</td>
                          <td>{post.title}</td>
                          <td>{getCategoryTitle(post.categoryId)}</td>
                          <td>
                            {post.date?.slice(0, 10) ||
                              post.createdAt?.slice(0, 10) ||
                              ""}
                          </td>
                          <td>
                            <span className={`badge ${isVisible ? "bg-success" : "bg-secondary"}`}>
                              {isVisible ? "Hiển thị" : "Đã ẩn"}
                            </span>
                          </td>
                          <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-light btn-sm toggle-visibility"
                              type="button"
                              title="Ẩn/Hiện"
                              onClick={() => handleToggleVisibility(post._id)}
                            >
                              <i className={`fas ${isVisible ? "fa-eye" : "fa-eye-slash"}`}></i>
                            </button>
                            <button
                              className="btn btn-info btn-sm"
                              type="button"
                              title="Sửa"
                              onClick={() => handleEditPost(post)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {/* <button
                              className="btn btn-danger btn-sm"
                              type="button"
                              title="Xóa"
                              onClick={() => handleDeletePost(post)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button> */}
                          </div>
                        </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Modal xác nhận xoá */}
     {/* {showDeleteConfirm && postToDelete && (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Xác nhận xóa</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowDeleteConfirm(false)}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Bạn có chắc chắn muốn xóa bài viết:{" "}
              <strong>{postToDelete.title}</strong>?
            </p>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Hủy
            </button>
            <button className="btn btn-danger" onClick={confirmDeletePost}>
              Xác nhận xoá
            </button>
          </div>
        </div>
      </div>
    </div>
  )} */}


    </main>
  );
}