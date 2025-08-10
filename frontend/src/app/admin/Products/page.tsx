"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../admin.css";
import { useSuccessNotification } from "../../utils/useSuccessNotification";

type Product = {
  id: string;
  name: string;
  image: string;
  images?: string[];
  desc: string;
  price: number;
  quantity: number;
  size: string;
  category: string;
  status: string;
  variants?: { size: string; price: number; quantity: number }[]; // Add this line to support variants
};

export default function ProductManagement() {
  const notify = useSuccessNotification(); // <-- Gọi bên trong thân hàm component

  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [clock, setClock] = useState("");
  const [form, setForm] = useState<Omit<Product, "checked">>({
    id: "",
    name: "",
    image: "",
    desc: "",
    price: 0,
    quantity: 0,
    size: "",
    category: "",
    status: "",
  });
  const [createForm, setCreateForm] = useState<Omit<Product, "checked">>({
    id: "",
    name: "",
    image: "",
    desc: "",
    price: 0,
    quantity: 0,
    size: "",
    category: "",
    status: "",
  });
  const [categories, setCategories] = useState<any[]>([]); // Danh mụ
  const [mainImageFile, setMainImageFile] = useState<File | null>(null); // Sửa
  const [mainImagePreview, setMainImagePreview] = useState<string>("");   // Sửa
  const [createMainImageFile, setCreateMainImageFile] = useState<File | null>(null); // Tạo
  // Thumbnail
  const [thumbnailInputs, setThumbnailInputs] = useState<{ file: File | null, url: string | null }[]>([]); // Tạo
  const [editThumbnails, setEditThumbnails] = useState<
  { url: string; name: string; file: File | null; isNew: boolean }[]
>([]); // Sửa
  // Biến thể
  const [editVariants, setEditVariants] = useState<{ size: string; price: number; quantity: number }[]>([]);
  const [createVariants, setCreateVariants] = useState<{ size: string; price: number; quantity: number }[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Fetch sản phẩm từ backend nodejs
  const fetchProducts = async () => {
    try {
      // SỬA DÒNG NÀY: thêm ?all=true để lấy cả sản phẩm Ẩn
      const res = await fetch("http://localhost:3000/products?all=true");
      const data = await res.json();
      console.log("Raw data from API:", data);

      // Giả sử data là mảng sản phẩm từ API
      const products = data.map((prod: any) => ({
        id: prod._id,
        name: prod.name,
        price: prod.variants && prod.variants.length > 0
          ? prod.variants[0].price
          : prod.price, // lấy từ sản phẩm chính nếu không có variant
        quantity: prod.variants && prod.variants.length > 0
          ? prod.variants[0].quantity
          : prod.quantity || 0, // lấy từ sản phẩm chính nếu không có variant
        image: prod.images && prod.images.length > 0
          ? `http://localhost:3000/images/${prod.images[0]}`
          : "",
        images: prod.images,
        desc: prod.description,
        size: prod.variants && prod.variants.length > 0
          ? prod.variants.map((v: any) => v.size).join(", ")
          : "",
        category: prod.categoryId?.name || "",
        categoryId: prod.categoryId?._id || prod.categoryId,
        status: prod.status || "Còn hàng",
        checked: false,
        variants: prod.variants || [],
      }));
      console.log("Mapped products:", products);

      setProducts(products);
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch danh mục từ backend nodejs
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:3000/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi fetch danh mục:", error);
      }
    }
    fetchCategories();
  }, []);

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


  // Mở modal sửa
  const openEditModal = (id: string) => {
    const p = products.find((p) => p.id === id);
    if (!p) return;
    setEditIndex(products.findIndex((p) => p.id === id));
    setMainImageFile(null); // reset file khi mở modal sửa
    setMainImagePreview(
      p.images && p.images.length > 0
        ? (p.images[0].startsWith("http") ? p.images[0] : `http://localhost:3000/images/${p.images[0]}`)
        : ""
    );
    setForm({
      id: p.id,
      name: p.name,
      image: p.images && p.images.length > 0 ? p.images[0] : "",
      desc: p.desc,
      price: p.price,
      quantity: p.quantity,
      size: p.size,
      category: (p as any).categoryId || "", // ĐÚNG: truyền _id, không phải tên
      status: p.status,
    });
    setEditThumbnails(
      p.images?.slice(1).map((img: string) => ({
        url: img.startsWith("http") ? img : `http://localhost:3000/images/${img}`,
        name: img,
        file: null,
        isNew: false,
      })) || []
    );
    setEditVariants(
      p.variants?.map((v: any) => ({
        size: v.size,
        price: v.price,
        quantity: v.quantity,
      })) || []
    );
    setShowModal(true);
  };

  // Xử lý thay đổi form
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, files } = e.target as any;
    if (type === "file") {
      setForm({
        ...form,
        image: files[0] ? URL.createObjectURL(files[0]) : "",
      });
    } else if (type === "number") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Lưu sản phẩm (chỉ sửa trên frontend)

  // In bảng sản phẩm
  const handlePrint = () => {
    const printContent = document.getElementById("sampleTable")?.outerHTML;
    if (printContent) {
      const win = window.open("", "", "height=700,width=700");
      if (win) {
        win.document.write(printContent);
        win.document.close();
        win.print();
      }
    }
  };

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số sản phẩm mỗi trang

  // Tính toán phân trang
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentProducts = products.slice(startIdx, endIdx);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

useEffect(() => {
  const maxPage = Math.ceil(products.length / itemsPerPage);
  if (currentPage > maxPage) {
    setCurrentPage(maxPage > 0 ? maxPage : 1);
  }
}, [products]);


  // Thay đổi ảnh thu nhỏ
  const handleThumbnailChange = (idx: number, file: File | null) => {
    setThumbnailInputs(inputs =>
      inputs.map((input, i) =>
        i === idx
          ? { file, url: file ? URL.createObjectURL(file) : null }
          : input
      )
    );
  };

  // Thêm input ảnh thumbnail mới
  const addThumbnailInput = () => {
    setThumbnailInputs(inputs => [...inputs, { file: null, url: null }]);
  };

  useEffect(() => {
    if (showCreateModal && thumbnailInputs.length === 0) {
      setThumbnailInputs([{ file: null, url: null }]);
    }
  }, [showCreateModal]);

  // Sửa sản phẩm
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.desc);
    formData.append("price", String(form.price));
    formData.append("categoryId", form.category);
    formData.append("status", form.status);
    formData.append("variants", JSON.stringify(editVariants));

    // Ảnh chính (nếu có thay đổi)
    if (mainImageFile) {
      formData.append("img", mainImageFile);
    } else if (form.image && !form.image.startsWith("blob:") && !form.image.startsWith("http")) {
      // Nếu không upload mới, gửi tên file gốc (KHÔNG gửi URL)
      formData.append("image", form.image);
    }

    // Ảnh thumbnail mới
    editThumbnails.forEach((thumb) => {
      if (thumb.isNew && thumb.file) {
        formData.append("thumbnails", thumb.file);
      }
    });

    // Gửi danh sách tên ảnh thumbnail cũ giữ lại
    const oldThumbs = editThumbnails.filter(t => !t.isNew).map(t => t.name);
    formData.append("oldThumbnails", JSON.stringify(oldThumbs));

    // Gửi request PATCH
    const res = await fetch(`http://localhost:3000/products/${form.id}`, {
      method: "PATCH",
      body: formData,
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (res.ok) {
      notify("Cập nhật sản phẩm thành công!", "");
      setShowModal(false);
      await fetchProducts();
    } else {
      notify("Cập nhật sản phẩm thất bại!", "");
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Ẩn" ? "Còn hàng" : "Ẩn";
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        notify(`Đã chuyển sang trạng thái "${newStatus}"!`, "");
        fetchProducts(); // cập nhật lại danh sách
      } else {
        notify("Lỗi khi cập nhật trạng thái!", "");
      }
    } catch (error) {
      notify("Lỗi khi cập nhật trạng thái!", "");
    }
  };

  return (
    <div className="app-content">
      <div className="app-title">
        <ul className="app-breadcrumb breadcrumb side">
          <li className="breadcrumb-item active">
            <a href="#">
              <b>Danh sách sản phẩm</b>
            </a>
          </li>
        </ul>
        <div id="clock">{clock}</div>
      </div>
      <div className="row element-button">
        <div className="col-sm-2">
          <button
            className="btn btn-add btn-sm"
            type="button"
            title="Thêm"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i> Tạo mới sản phẩm
          </button>
        </div>

        <div className="col-sm-2">
          <button
            className="btn btn-delete btn-sm print-file"
            type="button"
            title="In"
            onClick={handlePrint}
          >
            <i className="fas fa-print"></i> In dữ liệu
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="tile">
            <div className="tile-body">
              <table className="table table-hover table-bordered" id="sampleTable">
                <thead>
                  <tr>
                    {/* <th style={{ width: "10px" }}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th> */}
                    <th style={{ width: "150px" }}>Tên sản phẩm</th>
                    <th style={{ width: "20px" }}>Ảnh</th>
                    <th style={{ width: "300px" }}>Mô tả</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Size</th>
                    <th>Danh mục</th>
                    <th>Trạng thái</th>
                    <th style={{ width: "100px" }}>Tính năng</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.filter(p => p && typeof p.price === "number").map((p) => (
                    <tr key={p.id}>
                      {/* <td>
                        <input
                          type="checkbox"
                          checked={p.checked}
                          onChange={() => handleCheck(p.id)}
                        />
                      </td> */}
                      <td>{p.name}</td>
                      <td>
                        {p.image ? (
                          <img
                            className="img-card-person"
                            src={p.image}
                            alt=""
                            width={50}
                          />
                        ) : null}
                      </td>
                      <td>{p.desc}</td>
                      <td>
                        {p.variants && p.variants.length > 0
                          ? p.variants[0].price.toLocaleString() + "đ"
                          : (typeof p.price === "number" ? p.price.toLocaleString() + "đ" : "Không xác định")}
                      </td>
                      <td>
                        {p.variants && p.variants.length > 0
                          ? p.variants[0].quantity
                          : p.quantity}
                      </td>
                      <td>
                        {p.variants && p.variants.length > 0
                          ? p.variants.map((v, idx) => (
                              <div key={idx}>{v.size}</div>
                            ))
                          : p.size}
                      </td>
                      <td>{p.category}</td>
                      <td>{p.status}</td>
                      <td className="table-td-center">
                        {p.status === "Ẩn" ? (
                          <button
                            className="btn btn-success btn-sm"
                            type="button"
                            title="Hiện sản phẩm"
                            onClick={() => toggleProductStatus(p.id, p.status)}
                          >
                            Hiện
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn btn-info btn-sm"
                              type="button"
                              title="Xem chi tiết"
                              onClick={() => {
                                setDetailProduct(p);
                                setShowDetailModal(true);
                              }}
                              style={{ marginRight: 6 }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-primary btn-sm edit"
                              type="button"
                              title="Sửa"
                              onClick={() => openEditModal(p.id)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              type="button"
                              title="Ẩn sản phẩm"
                              onClick={() => toggleProductStatus(p.id, p.status)}
                              style={{ marginLeft: 6 }}
                            >
                              Ẩn
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {currentProducts.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center">
                        Không có sản phẩm nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Modal Sửa Sản Phẩm */}
              {showModal && (
  <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: "rgba(0,0,0,0.3)" }}>
    <div className="modal-dialog modal-dialog-centered" role="document">
      <div className="modal-content">
        <form onSubmit={handleEditSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Chỉnh sửa sản phẩm</h5>
            <button
              type="button"
              className="close"
              onClick={() => setShowModal(false)}
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="form-group col-md-6">
                <label className="control-label">Tên sản phẩm</label>
                <input
                  className="form-control"
                  type="text"
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              {/* <div className="form-group col-md-6">
                <label className="control-label">Giá</label>
                <input
                  className="form-control"
                  type="number"
                  required
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div> */}
              <div className="form-group col-md-6">
                <label className="control-label">Danh mục</label>
                <select
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">--Chọn danh mục--</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Trạng thái</label>
                <select
                  className="form-control"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="">--Chọn trạng thái--</option>
                  <option>Còn hàng</option>
                  <option>Hết hàng</option>
                  <option>Ngừng kinh doanh</option>
                </select>
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Ảnh</label>
                <input
                  className="form-control"
                  type="file"
                  name="image"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMainImageFile(file);
                      setMainImagePreview(URL.createObjectURL(file));
                      setForm({
                        ...form,
                        image: file.name,
                      });
                    }
                  }}
                />
                {mainImagePreview && (
                  <img
                    src={mainImagePreview}
                    alt="preview"
                    className="mt-2"
                    width={100}
                  />
                )}
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Ảnh thumbnail</label>
                {editThumbnails.map((thumb, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    {thumb.url && (
                      <img src={thumb.url} alt="thumb" width={50} style={{ marginRight: 8 }} />
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setEditThumbnails(editThumbnails.filter((_, i) => i !== idx));
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      X
                    </button>
                  </div>
                ))}
                {/* Thêm input để upload thumbnail mới */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditThumbnails([
                        ...editThumbnails,
                        {
                          url: URL.createObjectURL(file),
                          name: file.name,
                          file,
                          isNew: true,
                        },
                      ]);
                    }
                  }}
                />
              </div>
              <div className="form-group col-md-12">
                <label className="control-label">Mô tả</label>
                <textarea
                  className="form-control"
                  required
                  name="desc"
                  value={form.desc}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-12">
  <label>Biến thể (Size/Giá/Số lượng)</label>
  {editVariants.map((v, idx) => (
    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <input
        type="text"
        className="form-control"
        placeholder="Size"
        value={v.size}
        style={{ width: 80 }}
        onChange={e => {
          const arr = [...editVariants];
          arr[idx].size = e.target.value;
          setEditVariants(arr);
        }}
      />
      <input
        type="number"
        className="form-control"
        placeholder="Giá"
        value={v.price}
        style={{ width: 120 }}
        onChange={e => {
          const arr = [...editVariants];
          arr[idx].price = Number(e.target.value);
          setEditVariants(arr);
        }}
      />
      <input
        type="number"
        className="form-control"
        placeholder="Số lượng"
        value={v.quantity}
        style={{ width: 100 }}
        onChange={e => {
          const arr = [...editVariants];
          arr[idx].quantity = Number(e.target.value);
          setEditVariants(arr);
        }}
      />
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => setEditVariants(editVariants.filter((_, i) => i !== idx))}
      >X</button>
    </div>
  ))}
  <button
    type="button"
    className="btn btn-primary btn-sm"
    onClick={() => setEditVariants([...editVariants, { size: "", price: 0, quantity: 0 }])}
  >+ Thêm biến thể</button>
</div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-save" type="submit">
              Lưu thay đổi
            </button>
            <button
              className="btn btn-cancel"
              type="button"
              onClick={() => setShowModal(false)}
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

              {/* End Modal */}
              {/* Modal Tạo Sản Phẩm Mới */}
              {showCreateModal && (
                <div
                  className="modal d-block"
                  tabIndex={-1}
                  role="dialog"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                >
                  <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            const formData = new FormData();
                            formData.append("name", createForm.name);
                            formData.append("description", createForm.desc);
                            formData.append("categoryId", createForm.category);
                            formData.append("status", createForm.status);
                            formData.append("variants", JSON.stringify(createVariants));
                            formData.append("price", String(createForm.price)); // Đừng quên price!

                            // Ảnh chính
                            if (createMainImageFile) {
                              formData.append("img", createMainImageFile);
                            }

                            // Ảnh thumbnail
                            thumbnailInputs.forEach((input) => {
                              if (input.file) {
                                formData.append("thumbnails", input.file);
                              }
                            });

                            const res = await fetch("http://localhost:3000/products", {
                              method: "POST",
                              body: formData,
                              headers: {
                                Authorization: "Bearer " + localStorage.getItem("token"),
                              },
                            });

                            if (res.ok) {
                              notify("Tạo sản phẩm thành công!", "");
                              setShowCreateModal(false);
                              await fetchProducts();
                              setCreateVariants([]); // reset biến thể
                              return;
                            } else {
                              notify("Thêm sản phẩm thất bại!", "");
                            }
                          } catch (error) {
                            notify("Lỗi khi thêm sản phẩm!", "");
                          }
                        }}
                      >
                        <div className="modal-header">
                          <h5 className="modal-title">Tạo sản phẩm mới</h5>
                          <button
                            type="button"
                            className="close"
                            onClick={() => setShowCreateModal(false)}
                          >
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          <div className="row">
                            <div className="form-group col-md-6">
                              <label className="control-label">Tên sản phẩm</label>
                              <input
                                className="form-control"
                                type="text"
                                required
                                name="name"
                                value={createForm.name}
                                onChange={(e) =>
                                  setCreateForm({
                                    ...createForm,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="form-group col-md-6">
                              <label className="control-label">Danh mục</label>
                              <select
                                className="form-control"
                                name="category"
                                value={createForm.category}
                                onChange={e =>
                                  setCreateForm({ ...createForm, category: e.target.value })
                                }
                              >
                                <option value="">--Chọn danh mục--</option>
                                {categories.map(c => (
                                  <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="form-group col-md-6">
                              <label className="control-label">Trạng thái</label>
                              <select
                                className="form-control"
                                name="status"
                                value={createForm.status}
                                onChange={e =>
                                  setCreateForm({ ...createForm, status: e.target.value })
                                }
                              >
                                <option value="">--Chọn trạng thái--</option>
                                <option>Còn hàng</option>
                              </select>
                            </div>
                            <div className="form-group col-md-6">
                              <label className="control-label">Ảnh</label>
                              <input
                                className="form-control"
                                type="file"
                                name="img"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    const file = e.target.files[0];
                                    setCreateForm({
                                      ...createForm,
                                      image: URL.createObjectURL(file),
                                    });
                                    setCreateMainImageFile(file); // Lưu file vào state
                                  }
                                }}
                              />
                              {createForm.image && (
                                <img
                                  src={createForm.image}
                                  alt="Ảnh sản phẩm"
                                  width={50}
                                  className="mt-2"
                                />
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label className="control-label">Ảnh thumbnail</label>
                              {thumbnailInputs.map((input, idx) => (
                                <div key={idx} style={{ marginBottom: 8 }}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                      const file = e.target.files?.[0] || null;
                                      handleThumbnailChange(idx, file);
                                    }}
                                  />
                                  {input.url && (
                                    <img
                                      src={input.url}
                                      alt="thumb"
                                      width={50}
                                      style={{ marginLeft: 8 }}
                                    />
                                  )}
                                </div>
                              ))}
                              <span
                                style={{
                                  color: "#007bff",
                                  cursor: "pointer",
                                  fontSize: 13,
                                  marginTop: 4,
                                  display: "inline-block",
                                  fontWeight: 600,
                                }}
                                onClick={addThumbnailInput}
                              >
                                Thêm ảnh thumbnail
                              </span>
                            </div>
                          </div>
                          <div className="row">
                            <div className="form-group col-md-12">
                              <label className="control-label">Mô tả</label>
                              <textarea
                                className="form-control"
                                required
                                name="desc"
                                value={createForm.desc}
                                onChange={e =>
                                  setCreateForm({ ...createForm, desc: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="form-group col-md-12">
  <label>Biến thể (Size/Giá/Số lượng)</label>
  {createVariants.map((v, idx) => (
    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <input
        type="text"
        className="form-control"
        placeholder="Size"
        value={v.size}
        style={{ width: 80 }}
        onChange={e => {
          const arr = [...createVariants];
          arr[idx].size = e.target.value;
          setCreateVariants(arr);
        }}
      />
      <input
        type="number"
        className="form-control"
        placeholder="Giá"
        value={v.price}
        style={{ width: 120 }}
        onChange={e => {
          const arr = [...createVariants];
          arr[idx].price = Number(e.target.value);
          setCreateVariants(arr);
        }}
      />
      <input
        type="number"
        className="form-control"
        placeholder="Số lượng"
        value={v.quantity}
        style={{ width: 100 }}
        onChange={e => {
          const arr = [...createVariants];
          arr[idx].quantity = Number(e.target.value);
          setCreateVariants(arr);
        }}
      />
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => setCreateVariants(createVariants.filter((_, i) => i !== idx))}
      >X</button>
    </div>
  ))}
  <button
    type="button"
    className="btn btn-primary btn-sm"
    onClick={() => setCreateVariants([...createVariants, { size: "", price: 0, quantity: 0 }])}
  >+ Thêm biến thể</button>
</div>
                          </div>
                          <a
                            href="#"
                            style={{
                              float: "right",
                              fontWeight: 600,
                              color: "#ea0000",
                            }}
                          >
                            Thêm nâng cao
                          </a>
                        </div>
                        <div className="modal-footer">
                          <button className="btn btn-save" type="submit">
                            Tạo sản phẩm
                          </button>
                          <button
                            className="btn btn-cancel"
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                          >
                            Hủy bỏ
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {/* End Modal */}
              {/* Phân trang và tổng số */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Hiện{" "}
                  {totalItems === 0 ? 0 : startIdx + 1} đến{" "}
                  {Math.min(endIdx, totalItems)} của {totalItems} sản phẩm
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li
                      className={`page-item${
                        currentPage === 1 ? " disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Lùi
                      </button>
                    </li>
                    {/* Hiển thị tối đa 3 số trang */}
                    {(() => {
                      let start = Math.max(1, currentPage - 1);
                      let end = Math.min(totalPages, start + 2);
                      if (end - start < 2) start = Math.max(1, end - 2);
                      const pages = [];
                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <li
                            key={i}
                            className={`page-item${
                              currentPage === i ? " active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(i)}
                            >
                              {i}
                            </button>
                          </li>
                        );
                      }
                      return pages;
                    })()}
                    <li
                      className={`page-item${
                        currentPage === totalPages ? " disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Tiếp
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Chi Tiết Sản Phẩm */}
      {showDetailModal && detailProduct && (
  <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: "rgba(0,0,0,0.3)" }}>
    <div className="modal-dialog modal-dialog-centered" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Chi tiết sản phẩm</h5>
          <button
            type="button"
            className="close"
            onClick={() => setShowDetailModal(false)}
          >
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div><b>Tên:</b> {detailProduct.name}</div>
          <div><b>Giá:</b> {detailProduct.price.toLocaleString()}đ</div>
          <div><b>Danh mục:</b> {detailProduct.category}</div>
          <div><b>Trạng thái:</b> {detailProduct.status}</div>
          <div><b>Mô tả:</b> {detailProduct.desc}</div>
          <div>
            <b>Ảnh chính:</b><br />
            {detailProduct.images && detailProduct.images.length > 0 && (
              <img
                src={detailProduct.images[0].startsWith("http") ? detailProduct.images[0] : `http://localhost:3000/images/${detailProduct.images[0]}`}
                alt="Ảnh chính"
                width={100}
                style={{ marginRight: 8, marginBottom: 8, border: "2px solid #d16ba5" }}
              />
            )}
          </div>
          <div>
            <b>Ảnh thumbnail:</b><br />
            {detailProduct.images && detailProduct.images.length > 1 ? (
              detailProduct.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img.startsWith("http") ? img : `http://localhost:3000/images/${img}`}
                  alt={`thumb-${idx}`}
                  width={60}
                  style={{ marginRight: 8, marginBottom: 8, border: "1px solid #ccc" }}
                />
              ))
            ) : (
              <span>Không có</span>
            )}
          </div>
          <div>
            <b>Biến thể:</b>
            {detailProduct.variants && detailProduct.variants.length > 0 ? (
              <ul>
                {detailProduct.variants.map((v, idx) => (
                  <li key={idx}>
                    Size: {v.size}, Giá: {v.price.toLocaleString()}đ, SL: {v.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <span>Không có</span>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" type="button" onClick={() => setShowDetailModal(false)}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* End Modal Chi Tiết */}
    </div>
  );
}