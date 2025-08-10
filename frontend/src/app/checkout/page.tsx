"use client";
// 
import { useSearchParams } from "next/navigation";
// 
import React, { useState, useEffect } from "react";
import "./checkout.css";
import { useAppSelector } from "../store/store";
import { useDispatch } from "react-redux";
import { clearCart } from "../store/features/cartSlice";
import axios from "axios";
import Swal from "sweetalert2";
import CheckoutInfo from "./CheckoutInfo";
import CheckoutPayment from "./CheckoutPayment";
import CheckoutOrderSummary from "./OrderSummary";
import { getVouchers } from "../services/voucherService";
import { validateVoucher } from "../utils/validateVoucher";
// 
const SHIPPING_FEE = 10000; //phí ship mặc định

interface UserInfo {
  username: string;
  [key: string]: any;
}

const CheckoutPage: React.FC = () => {
  const [fullName, setFullName] = useState(""); // fullName là username
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  // Địa chỉ động
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  //Chi tiết sp
  const [buyNowItem, setBuyNowItem] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const [luckyProduct, setLuckyProduct] = useState<any | null>(null);

  useEffect(() => {
    const isBuyNow = searchParams.get("buyNow") === "1";
    if (isBuyNow) {
      const itemStr = localStorage.getItem("buyNowItem");
      if (itemStr) {
        try {
          const parsed = JSON.parse(itemStr);
          setBuyNowItem(parsed);
        } catch (e) {
          console.error("Lỗi đọc buyNowItem", e);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (productId) {
      fetch(`http://localhost:3000/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          setLuckyProduct({
            product: { ...data, price: 0 },
            quantity: 1,
          });
        });
    }
  }, [productId]);

  // Thông báo lỗi
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // Đăng nhập state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Redux dispatch
  const dispatch = useDispatch();

  // State lưu tên để mapping sau khi có data
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selectedWardName, setSelectedWardName] = useState("");

  // Lấy data địa chỉ VN từ GitHub
  useEffect(() => {
    axios
      .get("https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json")
      .then((response) => {
        setCities(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Khi có dữ liệu địa giới + user, thì mapping địa chỉ
  useEffect(() => {
    if (!cities.length) return;

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsLoggedIn(true);
      try {
        const parsedUser: UserInfo = JSON.parse(user);
        setUserInfo(parsedUser);
        setFullName(parsedUser.username || "");

        fetch(`http://localhost:3000/api/usersProfile/username/${parsedUser.username}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((profileData) => {
            if (profileData?.profile?.phone) setPhone(profileData.profile.phone);
            const addr = profileData?.profile?.addresses?.[0];
            if (addr) {
              setAddress(addr.detail || "");
              // Lưu tên để mapping sau
              setSelectedCityName(addr.city || "");
              setSelectedDistrictName(addr.district || "");
              setSelectedWardName(addr.ward || "");
            }
          });
      } catch {
        setUserInfo(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
      setFullName("");
    }
  }, [cities]);

  //B1 Sau khi đã có selectedCityName, tìm ID tương ứng và set
  useEffect(() => {
    if (!cities.length || !selectedCityName) return;
    const city = cities.find((c) => c.Name === selectedCityName);
    if (city) {
      setSelectedCity(city.Id);
    }
  }, [cities, selectedCityName]);

  // B2 Khi selectedCity đổi, cập nhật danh sách quận/huyện
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }
    const city = cities.find((c) => c.Id === selectedCity);
    if (city) {
      setDistricts(city.Districts || []);
    }
  }, [selectedCity, cities]);

  // B3 Sau khi đã có selectedDistrictName, tìm ID tương ứng và set
  useEffect(() => {
    if (!districts.length || !selectedDistrictName) return;
    const district = districts.find((d) => d.Name === selectedDistrictName);
    if (district) {
      setSelectedDistrict(district.Id);
    }
  }, [districts, selectedDistrictName]);

  // B4 Khi selectedDistrict đổi, cập nhật danh sách phường/xã
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    const city = cities.find((c) => c.Id === selectedCity);
    const district = city?.Districts.find((d) => d.Id === selectedDistrict);
    if (district) {
      setWards(district.Wards || []);
    }
  }, [selectedDistrict, selectedCity, cities]);

  //B5 Sau khi đã có selectedWardName, tìm ID tương ứng và set
  useEffect(() => {
    if (!wards.length || !selectedWardName) return;
    const ward = wards.find((w) => w.Name === selectedWardName);
    if (ward) {
      setSelectedWard(ward.Id);
    }
  }, [wards, selectedWardName]);

  // thay đổi dòng Vui lòng nhập thông tin giao hàng- truyền Props từ hàm này vào CheckoutPayment
  const isShippingInfoFilled = () => {
    return (
      fullName.trim() &&
      phone.trim() &&
      /^(0[0-9]{9,10})$/.test(phone.trim()) &&
      address.trim() &&
      selectedCity &&
      selectedDistrict &&
      selectedWard
    );
  };


  // const cartItems = useAppSelector((state) => state.cart.items);
  const cartItemsRedux = useAppSelector((state) => state.cart.items);
  const cartItems = luckyProduct ? [luckyProduct] : buyNowItem ? [buyNowItem] : cartItemsRedux;
  // 
  const handlePaymentChange = (value: string) => {
    setPayment(value);
  };

  
  // Validate đơn hàng
  const validate = () => {
    const newErrors: { [k: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^(0[0-9]{9,10})$/.test(phone.trim())) newErrors.phone = "Số điện thoại không hợp lệ";
    if (!address.trim()) newErrors.address = "Vui lòng nhập địa chỉ chi tiết";
    if (!selectedCity) newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    if (!selectedDistrict) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!selectedWard) newErrors.ward = "Vui lòng chọn phường/xã";
    if (!payment) newErrors.payment = "Vui lòng chọn phương thức thanh toán";
    if (cartItems.length === 0) newErrors.cart = "Giỏ hàng trống!";
    return newErrors;
  };

  // TÍNH TỔNG TIỀN
  const total = cartItems.reduce(
    (sum, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
      return sum + price * item.quantity;
    },
    0
  );
  const totalWithShipping = total + SHIPPING_FEE - discount;

  // Hàm xử lý lưu đơn hàng về backend (CÓ GỬI TOKEN, dùng cho COD & thanh toán thường)
  const saveOrder = async () => {
    // Chuẩn bị data gửi backend
    const shippingInfo = {
      name: fullName, // username
      phone,
      address: `${address}, ${wards.find(w => w.Id === selectedWard)?.Name || ""}, ${districts.find(d => d.Id === selectedDistrict)?.Name || ""}, ${cities.find(c => c.Id === selectedCity)?.Name || ""}`,
      note,
      city: cities.find(c => c.Id === selectedCity)?.Name || "",
      district: districts.find(d => d.Id === selectedDistrict)?.Name || "",
      ward: wards.find(w => w.Id === selectedWard)?.Name || "",
    };
    const items = cartItems.map(item => ({
      productId: item.product._id,
      productName: item.product.name, //tên sản phẩm
      variant: item.selectedVariant ? item.selectedVariant.size : undefined,
      quantity: item.quantity,
      price: item.selectedVariant ? item.selectedVariant.price : item.product.price,
      images: item.product.images,
    }));

    // LẤY TOKEN TỪ LOCALSTORAGE
    const token = localStorage.getItem("token");
    // Gửi API POST lên backend (có gửi token)
    const res = await axios.post("http://localhost:3000/orders", {
      items,
      shippingInfo,
      totalPrice: totalWithShipping,
      shippingFee: SHIPPING_FEE, //lấy phí ship
      paymentMethod: payment,
      coupon: coupon || undefined,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return res.data;
  };
  // Hàm gửi đơn hàng để lấy paymentUrl của MOMO (DÙNG CHO THANH TOÁN MOMO)
  // GHI CHÚ:
  // - Gọi API /payment/momo (backend bạn phải tạo route này)
  // - Gửi tổng tiền, orderId, orderInfo và token xác thực
  // - Nhận về paymentUrl, redirect sang trang thanh toán của MOMO
  const handleOnlineOrderMomo = async () => {

    const orderId = "order" + Date.now() + Math.floor(Math.random() * 1000000); // Luôn duy nhất!
    
    const shippingInfo = {
    name: fullName,
    phone,
    address: `${address}, ${wards.find(w => w.Id === selectedWard)?.Name || ""}, ${districts.find(d => d.Id === selectedDistrict)?.Name || ""}, ${cities.find(c => c.Id === selectedCity)?.Name || ""}`,
    note,
    city: cities.find(c => c.Id === selectedCity)?.Name || "",
    district: districts.find(d => d.Id === selectedDistrict)?.Name || "",
    ward: wards.find(w => w.Id === selectedWard)?.Name || "",
  };
  const items = cartItems.map(item => ({
    productId: item.product._id,
    productName: item.product.name,
    variant: item.selectedVariant ? item.selectedVariant.size : undefined,
    quantity: item.quantity,
    price: item.selectedVariant ? item.selectedVariant.price : item.product.price,
    images: item.product.images,
  }));

    try {
      const res = await axios.post("http://localhost:3000/payment/momo", {
        amount: totalWithShipping,
        orderId, // Dùng biến này!
        orderInfo: "Thanh toán đơn hàng MimiBear",
        items,
        shippingInfo,
        coupon,
        shippingFee: SHIPPING_FEE, //phí ship
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      Swal.fire("Lỗi", "Không thể tạo thanh toán Momo!", "error");
    }
  };


  // --- HÀM GỬI ĐƠN HÀNG ĐỂ LẤY LINK THANH TOÁN VNPAY (THÊM MỚI) ---
  const handleOnlineOrderVnpay = async () => {
    const orderId = "order" + Date.now() + Math.floor(Math.random() * 1000000); // Luôn duy nhất
    const shippingInfo = {
      name: fullName,
      phone,
      address: `${address}, ${wards.find(w => w.Id === selectedWard)?.Name || ""}, ${districts.find(d => d.Id === selectedDistrict)?.Name || ""}, ${cities.find(c => c.Id === selectedCity)?.Name || ""}`,
      note,
      city: cities.find(c => c.Id === selectedCity)?.Name || "",
      district: districts.find(d => d.Id === selectedDistrict)?.Name || "",
      ward: wards.find(w => w.Id === selectedWard)?.Name || "",
    };
    const items = cartItems.map(item => ({
      productId: item.product._id,
      productName: item.product.name,
      variant: item.selectedVariant ? item.selectedVariant.size : undefined,
      quantity: item.quantity,
      price: item.selectedVariant ? item.selectedVariant.price : item.product.price,
      image: item.product.images?.[0],
    }));

    try {
      const res = await axios.post("http://localhost:3000/payment/vnpay", {
        amount: totalWithShipping,
        orderId,
        orderInfo: "Thanh toán đơn hàng MimiBear qua VNPAY",
        items,
        shippingInfo,
        coupon,
        shippingFee: SHIPPING_FEE,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      Swal.fire("Lỗi", "Không thể tạo thanh toán VNPAY!", "error");
    }
  };


  // Khi bấm nút đăng nhập ở trang thanh toán
  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = "/login";
  };

  // Hàm áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    setVoucherMessage("");
    setDiscount(0);
    setAppliedVoucher(null);
    if (!coupon.trim()) {
      setVoucherMessage("Vui lòng nhập mã giảm giá");
      return;
    }
    try {
      const vouchers = await getVouchers();
      const voucher = vouchers.find(v => v.discountCode.toLowerCase() === coupon.trim().toLowerCase());
      if (!voucher) {
        setVoucherMessage("Mã giảm giá không tồn tại");
        return;
      }
      const result = validateVoucher({
        voucher,
        cartItems,
        total,
      });
      if (!result.valid) {
        setVoucherMessage(result.message || "Mã giảm giá không hợp lệ");
        setDiscount(0);
        setAppliedVoucher(null);
      } else {
        setDiscount(result.discount || 0);
        setVoucherMessage("Áp dụng mã giảm giá thành công!");
        setAppliedVoucher(voucher);
      }
    } catch (err) {
      setVoucherMessage("Có lỗi khi kiểm tra mã giảm giá");
    }
  };

  // Xử lý đặt hàng
  // - Nếu chọn COD thì giữ logic cũ
  // - Nếu chọn MOMO thì gọi handleOnlineOrderMomo()
  // - Nếu chọn các thanh toán thường khác thì vẫn gọi saveOrder()
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const check = validate();
    setErrors(check);

    if (Object.keys(check).length === 0) {
      if (payment === "cod") {
        // COD: xác nhận bằng SweetAlert như cũ
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
          },
          buttonsStyling: false
        });
        swalWithBootstrapButtons.fire({
          title: "Bạn xác nhận đặt hàng?",
          text: "Bạn chắc chắn muốn đặt đơn hàng này?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Xác nhận đặt hàng",
          cancelButtonText: "Hủy",
          reverseButtons: true
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await saveOrder();

              // Tăng lượt quay lucky wheel
              const turns = Number(localStorage.getItem("turns") || "0");
              localStorage.setItem("turns", String(turns + 1));

              swalWithBootstrapButtons.fire({
                title: "Đặt hàng thành công!",
                text: "Cảm ơn bạn đã mua hàng.",
                icon: "success"
              }).then(() => {
                if (!buyNowItem) {
                  dispatch(clearCart());
                }
                localStorage.removeItem("buyNowItem");
                window.location.href = "/"; // quay về trang chủ
              });

            } catch (err) {
              swalWithBootstrapButtons.fire({
                title: "Lỗi!",
                text: "Đặt hàng thất bại, vui lòng thử lại.",
                icon: "error"
              });
            }
          } else if (
            result.dismiss === Swal.DismissReason.cancel
          ) {
            swalWithBootstrapButtons.fire({
              title: "Đã hủy!",
              text: "Đơn hàng đã bị hủy.",
              icon: "error"
            });
          }
        });
      } else if (payment === "momo") {
        // THANH TOÁN ONLINE MOMO: chuyển sang cổng thanh toán
        await handleOnlineOrderMomo();
      } else if(payment === "vnpay") {
        // thanh toán online VNPAY
        await handleOnlineOrderVnpay();
      } else {
        // Các phương thức khác (ví dụ: zalopay, thanh toán thông thường)
        try {
          await saveOrder();
          // Tăng lượt quay lucky wheel
          const turns = Number(localStorage.getItem("turns") || "0");
          localStorage.setItem("turns", String(turns + 1));
          Swal.fire("Thanh toán thành công", "Cảm ơn bạn đã mua hàng!", "success").then(() => {
            if (!buyNowItem) {
              dispatch(clearCart());
            }
            localStorage.removeItem("buyNowItem");
            window.location.href = "/";
          });
        } catch (err) {
          Swal.fire("Lỗi", "Thanh toán thất bại, vui lòng thử lại!", "error");
        }
      }
    } else {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
        icon: "error"
      });
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleOrder}>
        <div className="left">
          <CheckoutInfo
            isLoggedIn={isLoggedIn}
            userInfo={userInfo}
            fullName={fullName}
            setFullName={setFullName}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            note={note}
            setNote={setNote}
            cities={cities}
            districts={districts}
            wards={wards}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedWard={selectedWard}
            setSelectedWard={setSelectedWard}
            errors={errors}
            handleLoginRedirect={handleLoginRedirect}
          />
          <CheckoutPayment
            payment={payment}
            handlePaymentChange={handlePaymentChange}
            errors={errors}
            isShippingInfoFilled={!!isShippingInfoFilled()}//truyền từ trên xuống đổi dòng vận chuyển
          />
        </div>
      </form>
      <CheckoutOrderSummary
        cartItems={cartItems}
        coupon={coupon}
        setCoupon={setCoupon}
        total={total}
        SHIPPING_FEE={SHIPPING_FEE}
        totalWithShipping={totalWithShipping}
        handleOrder={handleOrder}
        onApplyCoupon={handleApplyCoupon}
        discount={discount}
        voucherMessage={voucherMessage}
      />
    </div>
  );
};

export default CheckoutPage;