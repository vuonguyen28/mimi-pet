"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Modal, Popover } from "antd";
import { useShowMessage } from "../utils/useShowMessage";
import { useAppDispatch } from "../store/store";
import { addToCart } from "../store/features/cartSlice";

const WHEEL_SIZE = 400;
const CENTER_BTN_SIZE = 100;

function describeSector(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const rad = Math.PI / 180;
  const x1 = cx + r * Math.cos(rad * startAngle);
  const y1 = cy + r * Math.sin(rad * startAngle);
  const x2 = cx + r * Math.cos(rad * endAngle);
  const y2 = cy + r * Math.sin(rad * endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
    "Z",
  ].join(" ");
}

const LuckyWheel: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<{ label: string; color: string; bg: string; chance: number; images?: string; _id?: string; id?: string; code?: string }[]>([]);
  const [turns, setTurns] = useState<number>(() => {
    const saved = localStorage.getItem("turns");
    return saved ? Number(saved) : 0; // Mặc định 0 nếu chưa đăng ký
  }); // Mặc định 1 lượt quay miễn phí
  const wheelRef = useRef<SVGSVGElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingPrize, setPendingPrize] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const messageApi = useShowMessage('', '');
  const dispatch = useAppDispatch();
  const wheelContainerRef = useRef<HTMLDivElement>(null);
 const isMobile = useMediaQuery({ maxWidth: 480 });
const isTablet = useMediaQuery({ minWidth: 481, maxWidth: 1024 });
const isDesktop = useMediaQuery({ minWidth: 1025 });

const WHEEL_SIZE = isMobile ? 210 : isTablet ? 320 : 400;
const CENTER_BTN_SIZE = isMobile ? 54 : isTablet ? 80 : 100;

  interface Product {
    [x: string]: any;
    name?: string;
    // add other product properties if needed
  }
  
  interface Voucher {
    discountCode: string | undefined;
    name?: string;
    code?: string;
    images?: string;
    _id?: string;
    targetType?: string;
    productIds?: string[];
    description?: string;
    active?: boolean;
    startDate?: string;
    endDate?: string;
    // add other voucher properties if needed
  }
  
useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/products").then(res => res.json()),
      fetch("http://localhost:3000/vouchers").then(res => res.json())
    ]).then(([products, vouchers]: [Product[], Voucher[]]) => {
      const now = new Date();

      // Lọc voucher sản phẩm còn hiệu lực
      const productVouchers = vouchers.filter((v: Voucher) => {
        if (v.targetType !== "product") return false;
        if (v.active === false) return false;
        if (v.startDate && new Date(v.startDate) > now) return false;
        if (v.endDate && new Date(v.endDate) < now) return false;
        return true;
      });

      const selectedProducts = products.slice(0, 2);

      const prizes = [
        { label: "CHÚC BẠN MAY MẮN LẦN SAU", color: "#fff", bg: "#e67e22", chance: 0.35 },
        { label: "THÊM LƯỢT", color: "#fff", bg: "#f39c12", chance: 0.20 },
        ...productVouchers.map((v: Voucher) => ({
          label: v.discountCode || v.code || v.name || "Voucher sản phẩm",
          color: "#fff",
          bg: "#e74c3c",
          chance: 1 / (selectedProducts.length + productVouchers.length),
          code: v.discountCode || v.code,
          images: v.images,
          _id: v._id,
          productIds: v.productIds, 
          description: v.description || "",
        })),
        ...selectedProducts.map((p: Product) => ({
          label: p.name || "SẢN PHẨM",
          color: "#fff",
          bg: "#3498db",
          chance: 1 / (selectedProducts.length + productVouchers.length),
          _id: p._id,
          images: p.images
        }))
      ];
      setPrizes(prizes);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("turns", String(turns));
  }, [turns]);

  // useEffect(() => {
  //   // Nếu lượt quay đang là 0 thì cấp lại 1 lượt miễn phí khi reload
  //   if (turns === 0) {
  //     setTurns(1);
  //     localStorage.setItem("turns", "1");
  //   }
  // }, [turns]);

  const spin = async () => {
    // Kiểm tra đăng nhập
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.email) {
      messageApi.error("Bạn cần đăng nhập để quay vòng quay may mắn!");
      return;
    }
    if (turns <= 0 || spinning) {
      messageApi.error("Bạn đã hết lượt quay!");
      return;
    }
    setSpinning(true);
    setResult(null);

    // Random theo tỉ lệ
    const chances = prizes.map(p => p.chance);
    const sum = chances.reduce((a, b) => a + b, 0);
    const rand = Math.random() * sum;
    let acc = 0;
    let prizeIndex = 0;
    for (let i = 0; i < chances.length; i++) {
      acc += chances[i];
      if (rand <= acc) {
        prizeIndex = i;
        break;
      }
    }

    const anglePerPrize = 360 / prizes.length;
    const finalRotate =
      360 * 5 +
      anglePerPrize * prizeIndex +
      (350 - anglePerPrize / 2);



    if (!wheelRef.current) {
      setSpinning(false);
      return;
    }
    wheelRef.current.style.transition = "transform 0.7s cubic-bezier(.7,.1,.9,.3)";
    wheelRef.current.style.transform = `rotate(-${360 * 2}deg)`;

    setTimeout(() => {
      if (!wheelRef.current) return;
      wheelRef.current.style.transition = "transform 3.3s cubic-bezier(.17,.67,.83,.67)";
      wheelRef.current.style.transform = `rotate(-${finalRotate}deg)`;
    }, 700);

    setTimeout(async () => {
      setSpinning(false);
      setResult(prizes[prizeIndex].label);

      // Trừ lượt quay
      let newTurns = turns - 1;
      if (prizes[prizeIndex].label === "THÊM LƯỢT") {
        newTurns += 1;
      }
      setTurns(newTurns);
      localStorage.setItem("turns", String(newTurns));

      // Nếu trúng sản phẩm thì hiện modal xác nhận
      if (prizes[prizeIndex].bg === "#3498db" && prizes[prizeIndex]._id) {
        setPendingPrize(prizes[prizeIndex]);
        setShowModal(true);
        messageApi.success(`Bạn đã trúng sản phẩm "${prizes[prizeIndex].label}"!`);
      } else {
        // Hiện modal kết quả cho các trường hợp khác
        setShowResultModal(true);
      }

      // Gửi mail khi trúng voucher
      if (prizes[prizeIndex].bg === "#e74c3c" && prizes[prizeIndex].code) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.email) {
          await sendVoucherMail(user.email, prizes[prizeIndex]);
          messageApi.success(`Mã giảm giá "${prizes[prizeIndex].label}" đã được gửi về email của bạn!`);
        }
      }
    }, 4000);
  };

  // Gửi mail khi trúng voucher
  const sendVoucherMail = async (email: string, voucher: any) => {
    await fetch("http://localhost:3000/users/send-voucher-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        voucherCode: voucher.code || voucher.discountCode,
        voucherName: voucher.label,
        description: voucher.description || "",
        productIds: voucher.productIds, // truyền thêm productIds
      }),
    });
  };

  // ...existing code...
return (
  <Modal
  open={visible}
  onCancel={onClose}
  footer={null}
  centered
  width={isMobile ? 320 : isTablet ? 440 : 540}
  bodyStyle={{
    background: "radial-gradient(circle at top, #fffbe6 0%, #ffd6e0 80%, #fff6fa 100%)",
    borderRadius: 32,
    padding: isMobile ? "24px 0" : "32px 0",
    minHeight: isMobile ? 400 : 520,
    fontFamily: "Montserrat, Arial, sans-serif",
    boxShadow: "0 8px 32px #ffd6e0",
    border: "4px solid #ffd700",
    maxWidth: 540,
    margin: "0 auto",
    position: "relative",
  }}
  closable={false}
>
    <div style={{
      textAlign: "center",
      background: "none",
      padding: "0 32px",
      fontFamily: "Montserrat, Arial, sans-serif",
      position: "relative",
    }}>
      <h2 style={{
        fontSize: isMobile ? 26 : 38,
        fontWeight: 900,
        color: "#ffd700",
        textShadow: "2px 2px #d63384, 0 0 10px #fff",
        marginBottom: 12,
        letterSpacing: 2,
      }}>
        LUCKY MIMI BEAR
      </h2>

      {/* Dấu chấm hỏi ở góc phải trên cùng */}
      <div style={{ position: "absolute", top: -50, right: 24, zIndex: 100 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            className="hover-info-btn"
            style={{
              background: "#fffbe6",
              border: "2px solid #ffd700",
              color: "#d63384",
              fontWeight: 900,
              fontSize: 20,
              borderRadius: "50%",
              width: 38,
              height: 38,
              cursor: "pointer",
              boxShadow: "0 2px 8px #ffd6e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Thể lệ"
          >
            ?
          </button>
          <div
            className="hover-info-content"
            style={{
              display: "none",
              position: "absolute",
              top: 45,
              right: 0,
              minWidth: 280,
              background: "#fffbe6",
              color: "#d63384",
              border: "2px solid #ffd700",
              borderRadius: 12,
              boxShadow: "0 2px 8px #ffd6e0",
              padding: "14px 18px",
              fontSize: 16,
              textAlign: "left",
              zIndex: 101,
              fontWeight: 500,
            }}
          >
            <strong>Thể lệ:</strong>
            <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
              <li>Đăng kí tài khoản mới sẽ nhận được 1 lượt quay</li>
              <li>Mua thành công 1 đơn hàng sẽ nhận thêm 1 lượt quay</li>
            </ul>
          </div>
        </div>
      </div>


       {/* Thêm CSS trực tiếp */}
      <style>
        {`
          .hover-info-btn:hover + .hover-info-content,
          .hover-info-btn:focus + .hover-info-content {
            display: block !important;
          }
        `}
      </style>

      {/* Số lượt quay */}
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#fff",
        marginBottom: 10,
        background: "#d63384",
        display: "inline-block",
        padding: "6px 18px",
        borderRadius: 18,
        boxShadow: "0 2px 8px #ffd6e0"
      }}>
        Số lượt quay: <span style={{ color: "#ffd700" }}>{turns}</span>
      </div>

      <div
  className={isMobile ? "lucky-wheel-mobile-center" : ""}
  style={{
    position: "relative",
    width: isMobile ? WHEEL_SIZE + 10 : WHEEL_SIZE + 40,
    height: isMobile ? WHEEL_SIZE + 90 : WHEEL_SIZE + 100,
    margin: isMobile ? "-10px auto 0 auto" : "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  }}
>
    
        
        {/* Viền bóng đèn */}
        <svg
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          style={{
            position: "absolute",
            top: 58,
            left: "45%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 99,
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (360 / 20) * i; // Bỏ -90 để không lệch góc
            const rad = (angle * Math.PI) / 180;

            const radius = (WHEEL_SIZE / 2) - 10; // gần sát viền trong
            const cx = (WHEEL_SIZE / 2) + radius * Math.cos(rad);
            const cy = (WHEEL_SIZE / 2) + radius * Math.sin(rad);

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={6}
                fill="#fffde7"
                stroke="#ffd700"
                strokeWidth={2}
                filter="drop-shadow(0 0 4px #ffd700)"
              />
            );
          })}
        </svg>


        {/* Vòng quay SVG */}
        <div style={{
          position: "absolute",
          top: 50,
          left: "45%",
          transform: "translateX(-50%)",
          width: WHEEL_SIZE,
          height: WHEEL_SIZE,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, #fffbe6 0%, #ffd700 90%, #b8860b 100%)",
          border: "8px solid #ffd700",
          boxShadow: "0 4px 24px #aa0000",
          zIndex: 3,
        }}>
          <svg
            ref={wheelRef}
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            style={{
              borderRadius: "50%",
            
              position: "absolute",
              left: 0,
              top: 0,
              transition: "transform 4s cubic-bezier(.17,.67,.83,.67)",
            }}
          >
            {prizes.map((prize, i) => {
              const angle = 360 / prizes.length;
              const startAngle = i * angle;
              const endAngle = (i + 1) * angle;
              const cx = WHEEL_SIZE / 2;
              const cy = WHEEL_SIZE / 2;
              const r = WHEEL_SIZE / 2 - 18;
              const pathD = describeSector(cx, cy, r, startAngle, endAngle);
              const midAngle = (startAngle + endAngle) / 2;

              // Vị trí chữ nằm giữa sector, gần mép ngoài
              const textRadius = r * 0.78;
              const rad = Math.PI / 180;
              const textX = cx + textRadius * Math.cos(rad * midAngle);
              const textY = cy + textRadius * Math.sin(rad * midAngle);

              // Chia label thành nhiều dòng nếu quá dài
              const lines = prize.label.split(" ");
              const fontSize = 10 + (isMobile ? -3 : isTablet ? 3 : 4);
              const lineHeight = fontSize + 2;

              return (
                <g key={i}>
                  <path
                    d={pathD}
                    fill={prize.bg}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill={prize.color}
                    fontSize={fontSize}
                    fontWeight="bold"
                    fontFamily="Montserrat, Arial, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90},${textX},${textY})`}
                    style={{
                      textShadow: "1px 1px 2px #0008",
                      userSelect: "none",
                      textTransform: "uppercase",
                      pointerEvents: "none",
                    }}
                  >
                    {lines.map((line, idx) => (
                      <tspan
                        key={idx}
                        x={textX}
                        dy={idx === 0 ? 0 : lineHeight}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* Nút quay INS */}
          <button
            onClick={spin}
            disabled={spinning || turns <= 0}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: CENTER_BTN_SIZE,
              height: CENTER_BTN_SIZE,
              borderRadius: "50%",
              background: "radial-gradient(circle at center, #fffbe6 0%, #ffd700 80%, #b8860b 100%)",
              border: "4px solid #fff",
              boxShadow: "0 2px 12px #b3000033, 0 0 0 4px #ffd700",
              color: "#b30000",
              fontWeight: 900,
              fontSize: isMobile ? 14 : 22,
              cursor: spinning || turns <= 0 ? "not-allowed" : "pointer",
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              letterSpacing: 1,
            }}
          >
            <span style={{ fontSize: isMobile ? 10 : 18 }}>INS</span>
            <span style={{ fontSize: isMobile ? 12 : 24, marginTop: 2 }}>{spinning ? "..." : "QUAY"}</span>
          </button>
        </div>

        {/* Mũi tên trúng thưởng ở dưới đế quay */}
        <div style={{
          position: "absolute",
          top: WHEEL_SIZE + 40,
          left: "45%",
          transform: "translateX(-50%)",
          zIndex: 100,
        }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <polygon
              points="30,0 50,40 10,40"
              fill="#ffd700"
              stroke="#b8860b"
              strokeWidth="4"
              filter="drop-shadow(0 2px 8px #b8860b)"
            />
            <circle cx="30" cy="44" r="8" fill="#fff" stroke="#ffd700" strokeWidth="3" />
          </svg>
        </div>

        {/* Chân đế */}
        <div style={{
          position: "absolute",
          top: WHEEL_SIZE + 75,
          left: "45%",
          transform: "translateX(-50%)",
          width: WHEEL_SIZE * 0.6,
          height: 30,
          background: "linear-gradient(to bottom, #333, #111)",
          borderRadius: "0 0 40px 40px",
          boxShadow: "0 8px 16px #000a",
        }} />
      </div>
      {/* ...modals giữ nguyên... */}
      <Modal
          title="Xác nhận nhận quà"
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
          bodyStyle={{ textAlign: "center", fontSize: isMobile ? 14 : 18 }}
          closable={false}
        >
          <p style={{ marginBottom: 24 }}>
            Bạn đã trúng sản phẩm{" "}
            <strong style={{ color: "#f39c12" }}>
              {pendingPrize?.label}
            </strong>
            !
          </p>
          <p style={{ marginBottom: 24 }}>
            Bạn có muốn nhận phần quà này không?
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <button
              onClick={() => {
                setShowModal(false);
                window.location.href = `/checkout?productId=${pendingPrize?._id}&price=0&freeShip=true`;
              }}
              style={{
                padding: "10px 24px",
                borderRadius: 24,
                background: "linear-gradient(to right, #4caf50, #81c784)",
                border: "none",
                color: "#fff",
                fontSize: isMobile ? 12 : 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.3s",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              Nhận quà
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                const safeProduct = {
                  _id: pendingPrize?._id,
                  id: pendingPrize?._id || "",
                  name: pendingPrize?.label || "",
                  price: 0,
                  images: Array.isArray(pendingPrize?.images)
                    ? pendingPrize.images
                    : typeof pendingPrize?.images === "string"
                      ? [pendingPrize.images]
                      : ["default.jpg"],
                  variants: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isNew: false,
                  description: "Phần quà từ vòng quay may mắn",
                  categoryId: { _id: "default", name: "Quà tặng", hidden: false },
                  sold: 0,
                  quantity: 1, 
                };
                dispatch(addToCart({ product: safeProduct, selectedVariant: undefined }));
                messageApi.success(`Sản phẩm "${pendingPrize?.label}" đã được thêm vào giỏ hàng với giá 0đ!`);
              }}
              style={{
                padding: "10px 24px",
                borderRadius: 24,
                background: "linear-gradient(to right, #f44336, #e57373)",
                border: "none",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.3s",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              Không, cảm ơn
            </button>
          </div>
        </Modal>
      {/* Modal kết quả quay cho các trường hợp khác giữ nguyên */}
      <Modal
          title="Kết quả vòng quay"
          visible={showResultModal}
          onCancel={() => setShowResultModal(false)}
          footer={null}
          bodyStyle={{
            textAlign: "center",
            padding: "32px 16px 24px 16px",
            background: "radial-gradient(circle at top, #fffbe6 0%, #ffd6e0 80%, #fff6fa 100%)",
            borderRadius: 24,
            boxShadow: "0 2px 16px #ffd6e0",
          }}
          closable={false}
        >
          <div style={{
            fontSize: 18, // nhỏ lại
            fontWeight: 700,
            color: "#ffd700",
            textShadow: "1px 1px #d63384, 0 0 6px #fff",
            marginBottom: 14,
            letterSpacing: 1,
            lineHeight: 1.3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 24, marginBottom: 4 }}>🎉</span>
            <span>
               <span style={{ color: "#d63384" }}>{result}</span>
            </span>
            <span style={{ fontSize: 24, marginTop: 4 }}>🎉</span>
          </div>
          <button
            onClick={() => setShowResultModal(false)}
            style={{
              marginTop: 10,
              padding: "8px 24px",
              borderRadius: 16,
              background: "linear-gradient(90deg, #ffd6e0 0%, #ffb6b9 100%)",
              color: "#d63384",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px #f8bbd0",
              transition: "background 0.2s",
            }}
          >
            Đóng
          </button>
        </Modal> 
    </div>
  </Modal>
)};
export default LuckyWheel;


