const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/orderModel");
const OrderDetail = require("../models/orderDetailModel");
const { v4: uuidv4 } = require("uuid");

// --- CẤU HÌNH MOMO ---
const partnerCode = "MOMOYS4Y20250609";
const accessKey = "RHUgLUY2qTrOvKBz";
const secretKey = "4Vf1eeXWH0DqBN7IzDvKePIGMPb4fk2m";
const redirectUrl = "http://localhost:3007/checkout/momo/return";
const ipnUrl = "http://localhost:3000/payment/payment-ipn";

// --- CẤU HÌNH VNPAY (sandbox test) ---
const vnp_TmnCode = "2QXUI4J4";
const vnp_HashSecret = "SECRETKEYTEST123456789";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:3007/checkout/vnpay/return"; // FE nhận kết quả

const authenticateToken = require("../middleware/auth");

// --- ENDPOINT THANH TOÁN MOMO (giữ nguyên) ---
router.post("/momo", authenticateToken, async (req, res) => {
  const { amount, orderId, orderInfo, items, shippingInfo, coupon, shippingFee } = req.body;
  const userId = req.user?.id || req.user?._id;

  console.log("orderId FE gửi lên:", orderId);

  if (!amount || !orderId || !orderInfo || !items || !shippingInfo) {
    return res.status(400).json({ message: "Thiếu thông tin đơn hàng!" });
  }

  let newOrder;
  try {
    newOrder = await Order.create({
      orderId,
      shippingInfo: {
        ...shippingInfo,
        userId: userId || null,
      },
      shippingFee: shippingFee || 0,
      totalPrice: amount,
      paymentMethod: "momo",
      coupon: coupon || "",
      paymentStatus: "pending",
      orderStatus: "waiting",
    });
  } catch (err) {
    console.error("lỗi tạo đơn hàng momo:", err);
    return res.status(500).json({ message: "Lưu đơn hàng thất bại", detail: err.message });
  }

  try {
    await Promise.all(
      items.map((item) =>
        OrderDetail.create({
          orderId: newOrder.orderId || newOrder._id.toString(),
          productId: item.productId,
          productName: item.productName, // Tên sản phẩm có thể lấy từ item
          variant: item.variant,
          quantity: item.quantity,
          image: item.image,
          price: item.price * item.quantity,
          coupon: coupon || "",
        })
      )
    );
  } catch (err) {
    return res.status(500).json({ message: "Lưu chi tiết đơn hàng thất bại", detail: err.message });
  }

  const requestId = uuidv4();

  const rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=captureWallet";

  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount: `${amount}`,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData: "",
    requestType: "captureWallet",
    signature,
  };

  console.log("Body gửi lên Momo:", requestBody);

  try {
    const momoRes = await axios.post("https://payment.momo.vn/v2/gateway/api/create", requestBody);
    console.log("Response từ Momo:", momoRes.data);
    if (momoRes.data && momoRes.data.resultCode === 0) {
      res.json({ paymentUrl: momoRes.data.payUrl });
    } else {
      res.status(400).json({ message: momoRes.data.message || "Lỗi từ Momo", momoRes: momoRes.data });
    }
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ message: "Tạo link thanh toán thất bại!", detail: err?.response?.data || err.message });
  }
});



// ---VNPAY: ENDPOINT TẠO THANH TOÁN VNPAY TEST QR ---
router.post("/vnpay", authenticateToken, async (req, res) => {
  const { amount, orderId, orderInfo, items, shippingInfo, coupon, shippingFee } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!amount || !orderId || !orderInfo || !items || !shippingInfo) {
    return res.status(400).json({ message: "Thiếu thông tin đơn hàng!" });
  }

  // 1. Lưu đơn hàng
  let newOrder;
  try {
    newOrder = await Order.create({
      orderId,
      shippingInfo: {
        ...shippingInfo,
        userId: userId || null,
      },
      shippingFee: shippingFee || 0,
      totalPrice: amount,
      paymentMethod: "vnpay",
      coupon: coupon || "",
      paymentStatus: "pending",
      orderStatus: "waiting",
    });
  } catch (err) {
    return res.status(500).json({ message: "Lưu đơn hàng thất bại", detail: err.message });
  }

  // 2. Lưu từng item vào OrderDetail
  try {
    await Promise.all(
      items.map((item) =>
        OrderDetail.create({
          orderId: newOrder.orderId || newOrder._id.toString(),
          productId: item.productId,
          productName: item.productName,
          variant: item.variant,
          quantity: item.quantity,
          image: item.image,
          price: item.price * item.quantity,
          coupon: coupon || "",
        })
      )
    );
  } catch (err) {
    return res.status(500).json({ message: "Lưu chi tiết đơn hàng thất bại", detail: err.message });
  }

  // 3. Tạo tham số gửi sang VNPAY
  let ipAddr = req.headers["x-forwarded-for"] || req.ip || req.socket?.remoteAddress || "127.0.0.1";
  // Sửa lỗi IPv6 localhost thành IPv4 cho VNPAY
  if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") ipAddr = "127.0.0.1";
  const createDate = new Date();
  const vnp_CreateDate = createDate.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // PHẢI nhân 100, không có dấu chấm, phẩy
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: vnp_CreateDate,
  };

  // Sắp xếp keys theo alphabet
  let sortedParams = {};
  Object.keys(vnp_Params)
    .sort()
    .forEach(function (key) {
      sortedParams[key] = vnp_Params[key];
    });

  // Tạo chuỗi signData KHÔNG encodeURIComponent
  const signData = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  // Tạo secureHash SHA512
  const secureHash = crypto.createHmac("sha512", vnp_HashSecret).update(signData).digest("hex");
  // Thêm secureHash vào params
  sortedParams["vnp_SecureHash"] = secureHash;
  sortedParams["vnp_SecureHashType"] = "SHA512"; //thêm dòng này

  // Tạo URL thanh toán, PHẢI encodeURIComponent từng value
  const paymentUrl =
    vnp_Url +
    "?" +
    Object.entries(sortedParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

  //show lỗi
  console.log("vnp_Params:", sortedParams);
  console.log("signData:", signData);
  console.log("secureHash:", secureHash);
  console.log("paymentUrl:", paymentUrl);

  res.json({ paymentUrl });
});

//--- ENDPOINT NHẬN KẾT QUẢ TỪ VNPAY (redirect về FE) ---
// router.get("/vnpay_return", async (req, res) => {
//   const vnp_ResponseCode = req.query.vnp_ResponseCode;
//   const vnp_TxnRef = req.query.vnp_TxnRef; // orderId

//   if (vnp_ResponseCode === "00") {
//     // Thanh toán thành công
//     await Order.findOneAndUpdate({ orderId: vnp_TxnRef }, { paymentStatus: "paid" });
//     return res.redirect(`http://localhost:3007/checkout/vnpay/return?orderId=${vnp_TxnRef}&resultCode=0`);
//   } else {
//     // Thanh toán thất bại
//     await Order.findOneAndUpdate({ orderId: vnp_TxnRef }, { paymentStatus: "unpaid" });
//     return res.redirect(`http://localhost:3007/checkout/vnpay/return?orderId=${vnp_TxnRef}&resultCode=99`);
//   }
// });

module.exports = router;