'use client';
import { useEffect, useState } from 'react';
import { useShowMessage } from '@/app/utils/useShowMessage';
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../admin.css";

interface PostCategory {
  _id: string;
  title: string;
  slug: string;
  hidden?: boolean;
}

export default function PostCategoriesPage() {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const showMessage = useShowMessage('','');

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/postscategories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:3000/api/postscategories/${editingId}`
      : 'http://localhost:3000/api/postscategories';

    const body = JSON.stringify({ title });

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error('Lỗi khi lưu danh mục');

      setTitle('');
      setEditingId(null);
      fetchCategories();
      showMessage.success(editingId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
    } catch (err) {
      showMessage.error('Lỗi khi lưu danh mục');
      console.error(err);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/postscategories/${id}`);
      const data = await res.json();
      setTitle(data.title);
      setEditingId(data._id);
    } catch (err) {
      showMessage.error('Lỗi khi lấy chi tiết danh mục');
      console.error(err);
    }
  };

  const toggleVisibility = async (id: string, currentHidden: boolean = false) => {
    try {
      const res = await fetch(`http://localhost:3000/api/postscategories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !currentHidden }),
      });

      if (!res.ok) throw new Error('Lỗi khi cập nhật trạng thái hiển thị');

      fetchCategories();
      showMessage.success(!currentHidden ? 'Danh mục đã được ẩn' : 'Danh mục đã được hiển thị');
    } catch (err) {
      showMessage.error('Lỗi khi cập nhật trạng thái hiển thị');
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Quản lý danh mục bài viết</h2>

      <form onSubmit={handleSubmit} className="mb-4 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Tên danh mục"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button className="btn btn-primary">
          {editingId ? 'Lưu' : 'Thêm'}
        </button>
      </form>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Tên danh mục</th>
            <th>Slug</th>
            <th>Trạng thái</th>
            <th>Ẩn / Hiện</th>
            <th>Chỉnh sửa</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td>{cat.title}</td>
              <td>{cat.slug}</td>
              <td>
                <span className={`badge ${cat.hidden ? 'bg-secondary' : 'bg-success'}`}>
                  {cat.hidden ? 'Đã ẩn' : 'Hiển thị'}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => toggleVisibility(cat._id, cat.hidden)}
                >
                  <i className={`fas ${cat.hidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleEdit(cat._id)}
                >
                  <i className="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
