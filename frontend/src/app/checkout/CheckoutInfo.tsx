import React, { useState } from "react";

interface Props {
  isLoggedIn: boolean;
  userInfo: any;
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  cities: any[];
  districts: any[];
  wards: any[];
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (v: string) => void;
  selectedWard: string;
  setSelectedWard: (v: string) => void;
  errors: { [k: string]: string };
  handleLoginRedirect: () => void;
}

const fields = [
  { key: "fullName", label: "Họ và tên" },
  { key: "phone", label: "Số điện thoại" },
  { key: "address", label: "Địa chỉ" },
  { key: "city", label: "Tỉnh/Thành" },
  { key: "district", label: "Quận/Huyện" },
  { key: "ward", label: "Phường/Xã" },
];

const CheckoutInfo: React.FC<Props> = ({
  isLoggedIn,
  userInfo,
  fullName,
  setFullName,
  phone,
  setPhone,
  address,
  setAddress,
  note,
  setNote,
  cities,
  districts,
  wards,
  selectedCity,
  setSelectedCity,
  selectedDistrict,
  setSelectedDistrict,
  selectedWard,
  setSelectedWard,
  errors,
  handleLoginRedirect,
}) => {
  // Trạng thái touched và focus cho từng field
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [focused, setFocused] = useState<string | null>(null);

  // Lấy giá trị mỗi field
  const getFieldValue = (key: string) => {
    switch (key) {
      case "fullName":
        return fullName;
      case "phone":
        return phone;
      case "address":
        return address;
      case "city":
        return selectedCity;
      case "district":
        return selectedDistrict;
      case "ward":
        return selectedWard;
      default:
        return "";
    }
  };

  // Khi focus vào một trường, đánh dấu các trường phía trên là touched nếu chưa nhập
  const handleFocus = (fieldKey: string) => {
    setFocused(fieldKey);
    const idx = fields.findIndex(f => f.key === fieldKey);
    setTouched(prev => {
      const updated = { ...prev };
      for (let i = 0; i < idx; i++) {
        const prevField = fields[i].key;
        if (!getFieldValue(prevField)) updated[prevField] = true;
      }
      return updated;
    });
  };

  // Khi blur khỏi một trường, nếu chưa nhập thì hiện lỗi
  const handleBlur = (fieldKey: string) => {
    setFocused(null);
    setTouched(prev => ({ ...prev, [fieldKey]: true }));
  };

  // Hàm render lỗi: chỉ hiện nếu trường bị bỏ qua (touched), chưa nhập, và không phải ô đang focus
  const showFieldError = (fieldKey: string, message: string) => {
    if (
      touched[fieldKey] &&
      !getFieldValue(fieldKey) &&
      focused !== fieldKey
    ) {
      return <div className="error">{message}</div>;
    }
    return null;
  };

  return (
    <div className="column">
      <div className="log">
        <h3>Thông tin nhận hàng</h3>
        {!isLoggedIn && (
          <div className="log-dn">
            <a href="#" tabIndex={-1}>
              <img src="http://localhost:3000/images/icon-dn.png" alt="" />
            </a>
            <button type="button" onClick={handleLoginRedirect}>
              Đăng nhập
            </button>
          </div>
        )}
      </div>
      {/* Họ và tên */}
      {showFieldError("fullName", "Vui lòng nhập họ và tên")}
      <input
        type="text"
        placeholder="Họ và tên"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        onFocus={() => handleFocus("fullName")}
        onBlur={() => handleBlur("fullName")}
        readOnly={!!isLoggedIn && !!userInfo?.username}
      />
      {/* Số điện thoại */}
      {showFieldError("phone", "Vui lòng nhập số điện thoại")}
      <input
        type="tel"
        placeholder="Số điện thoại"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        onFocus={() => handleFocus("phone")}
        onBlur={() => handleBlur("phone")}
      />
      {/* Địa chỉ */}
      {showFieldError("address", "Vui lòng nhập địa chỉ")}
      <input
        type="text"
        placeholder="Địa chỉ (số nhà, tên đường...)"
        value={address}
        onChange={e => setAddress(e.target.value)}
        onFocus={() => handleFocus("address")}
        onBlur={() => handleBlur("address")}
      />
      {/* Tỉnh/Thành */}
      <div className="form-group">
        {showFieldError("city", "Vui lòng chọn tỉnh/thành phố")}
        <select
          className="form-control"
          id="city"
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          onFocus={() => handleFocus("city")}
          onBlur={() => handleBlur("city")}
        >
          <option value="">Chọn Tỉnh/Thành</option>
          {cities.map(city => (
            <option key={city.Id} value={city.Id}>
              {city.Name}
            </option>
          ))}
        </select>
      </div>
      {/* Quận/Huyện */}
      <div className="form-group">
        {showFieldError("district", "Vui lòng chọn quận/huyện")}
        <select
          className="form-control"
          id="district"
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          onFocus={() => handleFocus("district")}
          onBlur={() => handleBlur("district")}
          disabled={!selectedCity}
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts.map(district => (
            <option key={district.Id} value={district.Id}>
              {district.Name}
            </option>
          ))}
        </select>
      </div>
      {/* Phường/Xã */}
      <div className="form-group">
        {showFieldError("ward", "Vui lòng chọn phường/xã")}
        <select
          className="form-control"
          id="ward"
          value={selectedWard}
          onChange={e => setSelectedWard(e.target.value)}
          onFocus={() => handleFocus("ward")}
          onBlur={() => handleBlur("ward")}
          disabled={!selectedDistrict}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map(ward => (
            <option key={ward.Id} value={ward.Id}>
              {ward.Name}
            </option>
          ))}
        </select>
      </div>
      {/* Ghi chú */}
      <textarea
        placeholder="Ghi chú (tùy chọn)"
        rows={4}
        value={note}
        onChange={e => setNote(e.target.value)}
      />
    </div>
  );
};

export default CheckoutInfo;