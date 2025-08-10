import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CheckoutAddress({
  onChange
}: {
  onChange?: (value: { city: any; district: any; ward: any }) => void;
}) {
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Load cities
  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
      )
      .then((response) => {
        setCities(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Khi chọn city, cập nhật districts
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      setWards([]);
      setSelectedWard("");
      if (onChange) onChange({ city: null, district: null, ward: null });
      return;
    }
    const cityObj = cities.find((c) => c.Id === selectedCity);
    setDistricts(cityObj?.Districts || []);
    setSelectedDistrict("");
    setWards([]);
    setSelectedWard("");
    if (onChange) onChange({ city: cityObj, district: null, ward: null });
  }, [selectedCity]);

  // Khi chọn district, cập nhật wards
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      if (onChange) onChange({
        city: cities.find((c) => c.Id === selectedCity) || null,
        district: null,
        ward: null
      });
      return;
    }
    const cityObj = cities.find((c) => c.Id === selectedCity);
    const districtObj = districts.find((d) => d.Id === selectedDistrict);
    setWards(districtObj?.Wards || []);
    setSelectedWard("");
    if (onChange) onChange({
      city: cityObj,
      district: districtObj,
      ward: null
    });
  }, [selectedDistrict]);

  // Khi chọn ward, báo lên parent nếu cần
  useEffect(() => {
    if (!selectedWard) {
      if (onChange) onChange({
        city: cities.find((c) => c.Id === selectedCity) || null,
        district: districts.find((d) => d.Id === selectedDistrict) || null,
        ward: null
      });
      return;
    }
    const cityObj = cities.find((c) => c.Id === selectedCity);
    const districtObj = districts.find((d) => d.Id === selectedDistrict);
    const wardObj = wards.find((w) => w.Id === selectedWard);
    if (onChange) onChange({
      city: cityObj,
      district: districtObj,
      ward: wardObj
    });
  }, [selectedWard]);

  return (
    <>
      <div className="form-group">
        <label htmlFor="city">Tỉnh/Thành phố</label>
        <select
          className="form-control"
          id="city"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">Chọn Tỉnh/Thành</option>
          {cities.map((city) => (
            <option key={city.Id} value={city.Id}>
              {city.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="district">Quận/Huyện</label>
        <select
          className="form-control"
          id="district"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedCity}
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts.map((district) => (
            <option key={district.Id} value={district.Id}>
              {district.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="ward">Phường/Xã</label>
        <select
          className="form-control"
          id="ward"
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          disabled={!selectedDistrict}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map((ward) => (
            <option key={ward.Id} value={ward.Id}>
              {ward.Name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}