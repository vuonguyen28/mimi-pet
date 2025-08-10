import { useEffect, useState } from "react";

type CategoryModalProps = {
  onClose: () => void;
  onSave: (data: { name: string; hidden: boolean }) => void;
  initialName?: string;
};

export const CategoryModal = ({
  onClose,
  onSave,
  initialName = "",
}: CategoryModalProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;

    onSave({ name: name.trim(), hidden: false });
    onClose(); // Đóng modal sau khi lưu
  };

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {initialName ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Nhập tên danh mục"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};