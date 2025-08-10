'use client';
import React, { useState } from 'react';
import './addressmanager.css';

interface Address {
  id: string;
  detail: string;
}

interface Props {
  addresses?: Address[];
  onUpdateAddresses: (newAddresses: Address[]) => void;
  onSaveAddresses?: () => void;
  readOnly?: boolean;
}

const AddressManager: React.FC<Props> = ({
  addresses = [],
  onUpdateAddresses,
  onSaveAddresses,
  readOnly = false,
}) => {
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = () => {
    if (readOnly) return;
    if (newAddress.trim() === '') return;
    const newEntry: Address = {
      id: Date.now().toString(),
      detail: newAddress.trim(),
    };
    const updated = [...addresses, newEntry];
    onUpdateAddresses(updated);
    setNewAddress('');
    if (onSaveAddresses) onSaveAddresses();
  };

  const handleDeleteAddress = (id: string) => {
    if (readOnly) return;
    const updated = addresses.filter(addr => addr.id !== id);
    onUpdateAddresses(updated);
    if (onSaveAddresses) onSaveAddresses();
  };

  return (
    <div className="address-manager">
      <h3>Quản lý địa chỉ</h3>
      {(!addresses || addresses.length === 0) ? (
        <>
          <p className="empty-text">
            Địa chỉ của bạn trống, vui lòng nhập vào.
          </p>
          {/* Nếu đang chỉnh sửa thì luôn hiển thị input thêm */}
          {!readOnly && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Nhập địa chỉ mới"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
              />
              <button onClick={handleAddAddress}>Thêm địa chỉ</button>
            </div>
          )}
        </>
      ) : (
        <>
          <ul className="address-list">
            {addresses.map(addr => (
              <li key={addr.id}>
                {addr.detail}
                {/* Nút xóa chỉ hiện khi đang chỉnh sửa */}
                {!readOnly && (
                  <button
                    className="delete-btn"
                    title="Xóa địa chỉ"
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    ❌
                  </button>
                )}
              </li>
            ))}
          </ul>
          {/* Nếu đang chỉnh sửa thì luôn hiển thị input thêm */}
          {!readOnly && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Nhập địa chỉ mới"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
              />
              <button onClick={handleAddAddress}>Thêm địa chỉ</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddressManager;