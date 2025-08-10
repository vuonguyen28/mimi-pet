import React, { useState, useEffect } from "react";

type SubcategoryModalProps = {
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string; // truyền vào khi sửa, bỏ qua hoặc "" khi thêm mới
};

export const SubcategoryModal = ({ onClose, onSave, initialName = "" }: SubcategoryModalProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;
    onSave(name.trim());
    onClose();
  };

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {initialName ? "Chỉnh sửa danh mục con" : "Thêm danh mục con"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên danh mục con"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {initialName ? "Lưu" : "Thêm"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};