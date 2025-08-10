'use client';
import React, { useEffect, useState } from 'react';
import './userprofile.css';
import './addressmanager.css';
import UserOrders from './orderList';
import { useShowMessage } from '@/app/utils/useShowMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBox, faLock, faRightFromBracket, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

// AddressManager component
interface Address {
  id: string;
  detail: string;      // tên đường, số nhà
  ward: string;        // phường, xã
  district: string;    // quận, huyện
  city: string;        // tỉnh, thành phố
}

interface AddressManagerProps {
  addresses?: Address[];
  onUpdateAddresses: (newAddresses: Address[]) => void;
  onSaveAddresses?: () => void;
  readOnly?: boolean;
  onAddAddressSuccess?: () => void;
  onDeleteAddressSuccess?: () => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({
  addresses = [],
  onUpdateAddresses,
  onSaveAddresses,
  onAddAddressSuccess,
  onDeleteAddressSuccess,
  readOnly = false,
}) => {

  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Lỗi tải địa chỉ:', err));
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const city = cities.find(c => c.Id === cityId);
    setSelectedCity(cityId);
    setDistricts(city?.Districts || []);
    setSelectedDistrict('');
    setWards([]);
    setSelectedWard('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const district = districts.find(d => d.Id === districtId);
    setSelectedDistrict(districtId);
    setWards(district?.Wards || []);
    setSelectedWard('');
  };
  const [newAddress, setNewAddress] = useState('');

const handleAddAddress = () => {
  if (readOnly) return;
  if (!detailAddress || !selectedCity || !selectedDistrict || !selectedWard) return;

  const city = cities.find(c => c.Id === selectedCity)?.Name || '';
  const district = districts.find(d => d.Id === selectedDistrict)?.Name || '';
  const ward = wards.find(w => w.Id === selectedWard)?.Name || '';

  const newEntry: Address = {
    id: Date.now().toString(),
    detail: detailAddress.trim(),
    ward,
    district,
    city,
  };

  const updated = [...addresses, newEntry];
  onUpdateAddresses(updated);
  if (onAddAddressSuccess) onAddAddressSuccess();
  if (onSaveAddresses) onSaveAddresses();

  setDetailAddress('');
  setSelectedCity('');
  setDistricts([]);
  setSelectedDistrict('');
  setWards([]);
  setSelectedWard('');
};

  const handleDeleteAddress = (id: string) => {
    if (readOnly) return;
    const updated = addresses.filter(addr => addr.id !== id);
    onUpdateAddresses(updated);
    if (onSaveAddresses) onSaveAddresses();
  if (onDeleteAddressSuccess) onDeleteAddressSuccess(); 
  };

  return (
    <div className="address-manager">
      <h3>Quản lý địa chỉ</h3>
      {(!addresses || addresses.length === 0) ? (
        <>
          <p className="empty-text">
            Địa chỉ của bạn trống, vui lòng nhập vào.
          </p>
          {!readOnly && (
           <div className="input-group">
              <input
                type="text"
                placeholder="Số nhà, tên đường..."
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
              />

              <select value={selectedCity} onChange={handleCityChange}>
                <option value="">Chọn Tỉnh/Thành</option>
                {cities.map((city: any) => (
                  <option key={city.Id} value={city.Id}>{city.Name}</option>
                ))}
              </select>

              <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedCity}>
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d: any) => (
                  <option key={d.Id} value={d.Id}>{d.Name}</option>
                ))}
              </select>

              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict}>
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w: any) => (
                  <option key={w.Id} value={w.Id}>{w.Name}</option>
                ))}
              </select>

              <button onClick={() => {
                if (!detailAddress || !selectedCity || !selectedDistrict || !selectedWard) return;
                const city = cities.find(c => c.Id === selectedCity)?.Name;
                const district = districts.find(d => d.Id === selectedDistrict)?.Name;
                const ward = wards.find(w => w.Id === selectedWard)?.Name;

                const newEntry: Address = {
                  id: Date.now().toString(),
                  detail: detailAddress.trim(),
                  ward: ward || '',
                  district: district || '',
                  city: city || '',
                };

                const updated = [...addresses, newEntry];
                onUpdateAddresses(updated);
                if (onAddAddressSuccess) onAddAddressSuccess();
                if (onSaveAddresses) onSaveAddresses();

                // Reset
                setDetailAddress('');
                setSelectedCity('');
                setDistricts([]);
                setSelectedDistrict('');
                setWards([]);
                setSelectedWard('');
              }}>
                Thêm địa chỉ
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <ul className="address-list">
            {addresses.map(addr => (
              <li key={addr.id}>
                {`${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.city}`}
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
          {!readOnly && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Số nhà, tên đường..."
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
              />

              <select value={selectedCity} onChange={handleCityChange}>
                <option value="">Chọn Tỉnh/Thành</option>
                {cities.map((city: any) => (
                  <option key={city.Id} value={city.Id}>{city.Name}</option>
                ))}
              </select>

              <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedCity}>
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d: any) => (
                  <option key={d.Id} value={d.Id}>{d.Name}</option>
                ))}
              </select>

              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict}>
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w: any) => (
                  <option key={w.Id} value={w.Id}>{w.Name}</option>
                ))}
              </select>

              <button onClick={() => {
                if (!detailAddress || !selectedCity || !selectedDistrict || !selectedWard) return;
                const city = cities.find(c => c.Id === selectedCity)?.Name;
                const district = districts.find(d => d.Id === selectedDistrict)?.Name;
                const ward = wards.find(w => w.Id === selectedWard)?.Name;

                const newEntry: Address = {
                  id: Date.now().toString(),
                  detail: detailAddress.trim(),
                  ward: ward || '',
                  district: district || '',
                  city: city || '',
                };


                const updated = [...addresses, newEntry];
                onUpdateAddresses(updated);
                if (onAddAddressSuccess) onAddAddressSuccess();
                if (onSaveAddresses) onSaveAddresses();

                // Reset
                setDetailAddress('');
                setSelectedCity('');
                setDistricts([]);
                setSelectedDistrict('');
                setWards([]);
                setSelectedWard('');
              }}>
                Thêm địa chỉ
              </button>
            </div>

          )}
        </>
      )}
    </div>
  );
};

// Main UserProfile component
interface Profile {
  phone?: string;
  gender?: string;
  birthDate?: string;
  addresses?: Address[];
}

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  status: string;
  googleId?: string;
  profile?: Profile;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentTab, setCurrentTab] = useState<'profile' | 'orders' | 'password'>('profile');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassMsg, setChangePassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ oldPassword?: string; newPassword?: string; confirmPassword?: string }>({});
  const showMessage = useShowMessage("userprofile", "user");

useEffect(() => {
  const userData = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (!userData) {
    window.location.href = '/login';
    return;
  }

  const parsedUser = JSON.parse(userData);
  const username = parsedUser.username;
  const isGoogleUser = !!parsedUser.googleId;

  if (!token) {
    window.location.href = '/login';
    return;
  }

  // Gọi API để luôn lấy user + profile mới nhất từ server
  fetch(`http://localhost:3000/api/usersProfile/username/${username}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Không thể lấy thông tin người dùng');
      return res.json();
    })
    .then((data: any) => {
      if (!data.profile) data.profile = { addresses: [] };
      else if (!data.profile.addresses) data.profile.addresses = [];
      setUser(data);
    })
    .catch(err => {
      console.error('Lỗi khi lấy user:', err);
      window.location.href = '/login';
    });
}, []);


  const isGoogleUser = !!user?.googleId;

  const handleUserEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editUser) return;
    const { name, value } = e.target;
    setEditUser(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleProfileEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editUser) return;
    const { name, value } = e.target;
    setEditUser(prev => prev ? {
      ...prev,
      profile: { ...prev.profile, [name]: value }
    } : prev);
  };

  const handleEditAddresses = (newAddresses: Address[]) => {
    if (!editUser) return;
    setEditUser(prev => prev ? {
      ...prev,
      profile: { ...prev.profile, addresses: newAddresses }
    } : prev);
  };
     //chuyển định dạng giới tính
    const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return '';
    }
  };
  // Hàm định dạng ngày dạng yyyy-mm-dd => dd/mm/yyyy
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`; 
    };


  const renderUserInfo = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Họ</label>
        <input type="text" value={user?.lastName || ''} disabled />
      </div>
      <div className="form-group">
        <label>Tên</label>
        <input type="text" value={user?.firstName || ''} disabled />
      </div>
      <div className="form-group">
        <label>Tên đăng nhập</label>
        <input type="text" value={user?.username || ''} disabled />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="text" value={user?.email || ''} disabled />
      </div>
      <div className="form-group">
        <label>Số điện thoại</label>
        <input type="text" value={user?.profile?.phone || ''} disabled />
      </div>
      <div className="form-group">
        <label>Giới tính</label>
        <input type="text" value={getGenderLabel(user?.profile?.gender || '')} disabled />
      </div>
      <div className="form-group">
        <label>Ngày sinh</label>
        <input type="text" value={user?.profile?.birthDate ? formatDate(user.profile.birthDate) : ''} disabled />
      </div>
    </div>
  );

const renderEditFormNormal = () => (
  <div className="form-grid">
    <div className="form-group">
      <label htmlFor="lastName">Họ</label>
      <input type="text" id="lastName" name="lastName" value={editUser?.lastName || ''} onChange={handleUserEditChange} />
    </div>
    <div className="form-group">
      <label htmlFor="firstName">Tên</label>
      <input type="text" id="firstName" name="firstName" value={editUser?.firstName || ''} onChange={handleUserEditChange} />
    </div>
    <div className="form-group">
      <label htmlFor="username">Tên đăng nhập</label>
      <input type="text" id="username" name="username" value={editUser?.username || ''} disabled />
    </div>
    <div className="form-group">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" value={editUser?.email || ''} disabled />
    </div>
    <div className="form-group">
      <label htmlFor="phone">Số điện thoại</label>
      <input
        type="text"
        id="phone"
        name="phone"
        value={editUser?.profile?.phone || ''}
        onChange={(e) => {
          const value = e.target.value;
          // Chỉ giữ lại số và tối đa 10 ký tự
          if (/^\d{0,10}$/.test(value)) {
            handleProfileEditChange(e); // giữ nguyên logic cập nhật state
          }
        }}
        placeholder="Nhập số điện thoại (10 chữ số)"
        maxLength={10}
      />
    </div>
    <div className="form-group">
      <label htmlFor="gender">Giới tính</label>
      <select id="gender" name="gender" value={editUser?.profile?.gender || ''} onChange={handleProfileEditChange}>
        <option value="">Chọn giới tính</option>
        <option value="male">Nam</option>
        <option value="female">Nữ</option>
        <option value="other">Khác</option>
      </select>
    </div>
    <div className="form-group">
      <label htmlFor="birthDate">Ngày sinh</label>
      <input type="date" id="birthDate" name="birthDate" value={editUser?.profile?.birthDate ? editUser.profile.birthDate.slice(0, 10) : ''} onChange={handleProfileEditChange} />
    </div>
  </div>
);

  const renderEditFormGoogle = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Họ</label>
        <input type="text" value={editUser?.lastName || ''} disabled />
      </div>
      <div className="form-group">
        <label>Tên</label>
        <input type="text" value={editUser?.firstName || ''} disabled />
      </div>
      <div className="form-group">
        <label>Tên đăng nhập</label>
        <input type="text" value={editUser?.username || ''} disabled />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="text" value={editUser?.email || ''} disabled />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Số điện thoại</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={editUser?.profile?.phone || ''}
          onChange={(e) => {
            const value = e.target.value;
            // Chỉ giữ lại số và tối đa 10 ký tự
            if (/^\d{0,10}$/.test(value)) {
              handleProfileEditChange(e); // giữ nguyên logic cập nhật state
            }
          }}
          placeholder="Nhập số điện thoại (10 chữ số)"
          maxLength={10}
        />
      </div>
      <div className="form-group">
        <label htmlFor="gender">Giới tính</label>
        <select id="gender" name="gender" value={editUser?.profile?.gender || ''} onChange={handleProfileEditChange}>
          <option value="">Chọn giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="birthDate">Ngày sinh</label>
        <input type="date" id="birthDate" name="birthDate" value={editUser?.profile?.birthDate ? editUser.profile.birthDate.slice(0, 10) : ''} onChange={handleProfileEditChange} />
      </div>
    </div>
  );

  const startEdit = () => {
    setIsEditing(true);
    setEditUser(JSON.parse(JSON.stringify(user)));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditUser(null);
  };

  /**
   * Lưu hoặc tạo mới profile nếu chưa từng có (chuẩn RESTful: POST nếu chưa có, PUT nếu đã có)
   * - Nếu user đã có profile, gọi PUT /api/usersProfile/:username
   * - Nếu user chưa có profile, gọi POST /api/usersProfile/:username
   */
  const handleSave = () => {
    if (!editUser) return;

    const { firstName, lastName, username } = editUser;

    if (!lastName?.trim() || !firstName?.trim()) {
      showMessage.error("Họ và tên không được để trống!");
      return;
    }
    const phone = editUser.profile?.phone?.trim();
    if (!phone) {
      showMessage.error("Vui lòng nhập số điện thoại!");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showMessage.error("Số điện thoại phải gồm đúng 10 chữ số!");
      return;
    }

    if (!editUser.profile?.gender) {
      showMessage.error("Vui lòng chọn giới tính!");
      return;
    }

    if (!editUser.profile?.birthDate) {
      showMessage.error("Vui lòng chọn ngày sinh!");
      return;
    }
    const token = localStorage.getItem('token');

    if (!username) {
      showMessage.error('Thiếu username!');
      return;
    }

    const profilePayload = {
      firstName,
      lastName,
      phone: editUser.profile?.phone || '',
      gender: editUser.profile?.gender || '',
      birthDate: editUser.profile?.birthDate || '',
      addresses: editUser.profile?.addresses || [],
    };

    const hasProfile = !!user?.profile && (
      user.profile.phone ||
      user.profile.gender ||
      user.profile.birthDate ||
      (user.profile.addresses && user.profile.addresses.length > 0)
    );

    const method = hasProfile ? 'PUT' : 'POST';

    fetch(`http://localhost:3000/api/usersProfile/${username}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profilePayload),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Lỗi khi lưu dữ liệu');
        }
        return res.json();
      })
        .then(() => {
        // ✅ Gọi lại API để lấy user mới nhất từ server
        return fetch(`http://localhost:3000/api/usersProfile/username/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      })
      .then(res => {
        if (!res.ok) throw new Error('Không thể lấy lại thông tin người dùng sau khi lưu');
        return res.json();
      })
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        setIsEditing(false);
        setEditUser(null);
        showMessage.success('Cập nhật thành công!');
      })
      .catch(err => {
        console.error('Lỗi khi lưu:', err);
        showMessage.error(err.message || 'Lỗi khi lưu!');
      });
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChangePassMsg(null);
    const errors: { oldPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    if (!oldPassword) errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại!";
    if (!newPassword) errors.newPassword = "Vui lòng nhập mật khẩu mới!";
    else if (newPassword.length < 6) errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự!";
    if (!confirmPassword) errors.confirmPassword = "Vui lòng nhập lại mật khẩu mới!";
    else if (newPassword && newPassword !== confirmPassword) errors.confirmPassword = "Mật khẩu xác nhận không khớp!";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const token = localStorage.getItem('token');
    const username = user?.username;

    if (!token || !username) {
      setChangePassMsg({ type: 'error', text: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
      return;
    }

    fetch(`http://localhost:3000/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    })
      .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Đổi mật khẩu không thành công');
        }
        return data;
      })
      .then(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setChangePassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      })
      .catch(err => {
        console.error(err);
        setChangePassMsg({ type: 'error', text: err.message || 'Đổi mật khẩu không thành công' });
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowLogoutConfirm(false);
    window.location.href = '/login';
  };

  if (!user) return <p></p>;

  return (
    <div className="container">
      <div className="header">
        <div className="profile-header">
          <div className="avatar">{user.username?.charAt(0).toUpperCase() || '?'}</div>
          <div className="user-info">
            <h2>{user.lastName} {user.firstName}</h2>
            <div className="user-status">
              <span className="status-badge status-active">{user.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <div className={`menu-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setCurrentTab('profile')}>
            <FontAwesomeIcon icon={faUser} style={{ marginRight: 8 }} /> Thông tin cá nhân
          </div>
          <div className={`menu-item ${currentTab === 'orders' ? 'active' : ''}`} onClick={() => setCurrentTab('orders')}>
            <FontAwesomeIcon icon={faBox} style={{ marginRight: 8 }} /> Đơn hàng
          </div>
          {!isGoogleUser && (
            <div className={`menu-item ${currentTab === 'password' ? 'active' : ''}`} onClick={() => setCurrentTab('password')}>
              <FontAwesomeIcon icon={faLock} style={{ marginRight: 8 }} /> Đổi mật khẩu
            </div>
          )}
          <div className="menu-item" onClick={() => setShowLogoutConfirm(true)}>
            <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: 8 }} /> Đăng xuất
          </div>
        </div>

        <div className="content-area">
          {currentTab === 'profile' && (
            <>
              <div className="section-title">Thông tin cá nhân</div>
              {!isEditing && (
                <>
                  {renderUserInfo()}
                  <div style={{ marginTop: 24 }}>
                    <AddressManager
                      addresses={user.profile?.addresses || []}
                      onUpdateAddresses={() => {}}
                      readOnly={true}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={startEdit}>Chỉnh sửa</button>
                </>
              )}
              {isEditing && (
                <>
                  {isGoogleUser ? renderEditFormGoogle() : renderEditFormNormal()}
                  <div style={{ marginTop: 24 }}>
                    <AddressManager
                      addresses={editUser?.profile?.addresses || []}
                      onUpdateAddresses={handleEditAddresses}
                      onAddAddressSuccess={() => showMessage.success('Đã thêm địa chỉ mới!')}
                      onDeleteAddressSuccess={() => showMessage.success('Đã xoá địa chỉ!')}
                      readOnly={false}
                    />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={handleSave}>Lưu thay đổi</button>
                    <button className="btn btn-cancel" style={{ marginLeft: 8 }} onClick={cancelEdit}>Huỷ</button>
                  </div>
                </>
              )}
            </>
          )}
          {currentTab === 'orders' && <UserOrders username={user.username} />}
          {currentTab === 'password' && (
  <div className="change-password-box">
    <h3
      style={{
        fontSize: 28,
        fontWeight: 700,
        textAlign: "left",
        marginBottom: 24,
        marginTop: 0,
        color: "#222"
      }}
    >
      Đổi mật khẩu
    </h3>
    <form onSubmit={handleChangePassword}>
      <div className="form-group">
        <label>Mật khẩu hiện tại</label>
        <input
          type="password"
          className="input-password"
          value={oldPassword}
          onChange={e => { setOldPassword(e.target.value); setFieldErrors(f => ({ ...f, oldPassword: undefined })); }}
          required
        />
        {fieldErrors.oldPassword && (
          <div style={{ color: "red", fontSize: 13, marginTop: 2 }}>{fieldErrors.oldPassword}</div>
        )}
      </div>
      <div className="form-group">
        <label>Mật khẩu mới</label>
        <input
          type="password"
          className="input-password"
          value={newPassword}
          onChange={e => {
            const value = e.target.value;
            setNewPassword(value);
            setFieldErrors(f => ({
              ...f,
              newPassword: !value
                ? "Vui lòng nhập mật khẩu mới!"
                : value.length < 6
                ? "Mật khẩu mới phải có ít nhất 6 ký tự!"
                : undefined,
              // XÓA kiểm tra confirmPassword ở đây vì đã kiểm tra ở input xác nhận bên dưới
            }));
          }}
          required
        />
        {fieldErrors.newPassword && (
          <div style={{ color: "red", fontSize: 13, marginTop: 2 }}>{fieldErrors.newPassword}</div>
        )}
      </div>
      <div className="form-group">
        <label>Nhập lại mật khẩu mới</label>
        <input
          type="password"
          className="input-password"
          value={confirmPassword}
          onChange={e => {
            const value = e.target.value;
            setConfirmPassword(value);
            setFieldErrors(f => ({
              ...f,
              confirmPassword: !value
                ? "Vui lòng nhập lại mật khẩu mới!"
                : newPassword && value !== newPassword
                ? "Mật khẩu xác nhận không khớp!"
                : undefined,
            }));
          }}
          required
        />
        {fieldErrors.confirmPassword && (
          <div style={{ color: "red", fontSize: 13, marginTop: 2 }}>{fieldErrors.confirmPassword}</div>
        )}
      </div>
      {changePassMsg && (
        <div style={{ color: changePassMsg.type === "error" ? "red" : "green", marginBottom: 8 }}>
          {changePassMsg.text}
        </div>
      )}
      <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}>Đổi mật khẩu</button>
    </form>
  </div>
)}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              <FontAwesomeIcon icon={faCircleQuestion} style={{ marginRight: 8 }} />
              Bạn có chắc chắn muốn đăng xuất?
            </h3>
            <p>Nhấn tiếp tục để rời khỏi tài khoản.</p>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Huỷ</button>
              <button className="btn btn-confirm" onClick={handleLogout}>Tiếp tục</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;