import React, { useState, useEffect } from "react";
import { Card, Button, Avatar, Input, Spin, Modal, Select, message as antMessage, Dropdown, Menu } from "antd";
import { CloseOutlined, LoadingOutlined, AudioOutlined, MenuOutlined } from "@ant-design/icons";

const SUPPORT_TEXTS = [
  "Xin chào Anh/Chị! Em là trợ lý AI của MiMiBear, rất vui được hỗ trợ Anh/Chị trong việc tìm kiếm sản phẩm phù hợp nhất. ",
  "Em rất sẵn lòng hỗ trợ Anh/Chị 😊"
];

const OCCASIONS = [
  { value: "sinh nhật", label: "Sinh nhật" },
  { value: "tình yêu", label: "Tình yêu" },
  // Có thể thêm dịp khác nếu backend hỗ trợ
];

const PINK = "#ffe6f3";
const PINK_DARK = "#ffb6d5";
const WHITE = "#fff";

const EMOJIS = [
  { key: "heart", icon: "❤️" },
  { key: "like", icon: "👍" },
  { key: "haha", icon: "😂" },
  { key: "wow", icon: "😮" },
  { key: "cry", icon: "😭" },
  { key: "dislike", icon: "👎" }
];

// Extend the Window interface to include SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

function DotLoading() {
  const [dot, setDot] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", height: 20 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#bbb",
            opacity: dot >= i + 1 ? 1 : 0.3,
            transition: "opacity 0.2s"
          }}
        />
      ))}
    </span>
  );
}

export default function AIChatBox() {
  const [textIdx, setTextIdx] = useState(0);
  const [anim, setAnim] = useState(false);
  const [showSupport, setShowSupport] = useState(true);
  const [hover, setHover] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [input, setInput] = useState("");
  const [showGift, setShowGift] = useState(false);
  const [giftName, setGiftName] = useState("");
  const [giftOccasion, setGiftOccasion] = useState("");
  const [giftResult, setGiftResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [giftLoading, setGiftLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [reactions, setReactions] = useState<{ [key: number]: string | null }>({});
  const [showEmoji, setShowEmoji] = useState<number | null>(null);
  const [hoverMsg, setHoverMsg] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: number }>({});
  const [selectedProductSizes, setSelectedProductSizes] = useState<{ [msgIdx: number]: { [prodIdx: number]: number } }>({});
  const [sending, setSending] = useState(false);
  
  type Message = {
    role: string;
    content: string;
    image?: string;
    isHtml?: boolean;
    products?: any[];
    discount?: string;
    name?: string;
    price?: string;
    old_price?: string;
    sizes?: string[];
    prices?: string[];
    isLoading?: boolean;
    _id?: string;
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: SUPPORT_TEXTS[0] },
    { role: "bot", content: SUPPORT_TEXTS[1] }
  ]);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSupport) return;
    const timer = setInterval(() => {
      setAnim(true);
      setTimeout(() => {
        setTextIdx(idx => (idx + 1) % SUPPORT_TEXTS.length);
        setAnim(false);
      }, 350);
    }, 2200);
    return () => clearInterval(timer);
  }, [showSupport]);

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat]);

  // Lấy danh mục từ backend
  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then(res => res.json())
      .then(data => {
        // data là mảng object, lọc danh mục không ẩn
        const cats = (Array.isArray(data) ? data : []).filter(c => !c.hidden);
        setCategories(cats); // Lưu cả object, không chỉ name
      });
  }, []);

  const sendMessage = async (msg?: string) => {
    if (sending) return;
    setSending(true);
    const userMsg = (msg || input).trim();
    if (!userMsg) return;
    setMessages(msgs => [
      ...msgs,
      { role: "user", content: userMsg },
      { role: "bot", content: "", isLoading: true }
    ]);
    setInput("");
    setLoading(true);

    // Nhận diện yêu cầu tạo lời chúc
    try {
      const res = await fetch("http://localhost:3001/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(msgs => {
        const newMsgs = [...msgs];
        const idx = newMsgs.findIndex(m => m.isLoading);
        if (idx !== -1) newMsgs.splice(idx, 1);

        // Kiểm tra nội dung trả về của AI
        const botContent = data.message || data.content || "";
        const isDefaultReply =
          botContent === "Em chưa hiểu ý Anh/Chị, vui lòng hỏi lại nhé!"
          || botContent.startsWith("Xin lỗi, mình chưa hiểu ý bạn.")
          || botContent.startsWith("Xin lỗi, hệ thống AI đang bận hoặc hết lượt miễn phí.");

       if (isDefaultReply) {
  // AI không hiểu, chỉ trả về text
  return [
    ...newMsgs,
    {
      role: "bot",
      content: botContent
    }
  ];
}

// AI hiểu, trả về sản phẩm như cũ
return [
  ...newMsgs,
  {
    role: "bot",
    content: botContent,
    products: data.products,
    image: data.image,
    name: data.name,
    sizes: data.sizes,
    price: data.price,
    old_price: data.old_price,
    _id: data._id
  }
];
      });
    } catch {
      setMessages(msgs => [
        ...msgs,
        { role: "bot", content: "Có lỗi khi gửi tin nhắn, vui lòng thử lại!" }
      ]);
    }
    setLoading(false);
    setSending(false);
}

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN"; // hoặc "en-US"
    recognition.continuous = false; // chỉ nghe 1 câu, dừng sẽ tự tắt
    recognition.interimResults = false; // chỉ lấy kết quả cuối cùng
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onend = () => setListening(false); // khi dừng nói sẽ tắt mic
    recognition.onerror = () => setListening(false);
    recognition.start();
  };

  return (
    <>
      {/* Giao diện chatbox lớn hoặc mini */}
      {showChat ? (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 1000,
            width:
              window.innerWidth < 600
                ? "100vw"
                : window.innerWidth < 900
                ? 380
                : 440,
            height:
              window.innerHeight < 600
                ? "100vh"
                : window.innerWidth < 900
                ? 480
                : 600,
            background: WHITE,
            borderRadius:
              window.innerWidth < 600
                ? "0"
                : "18px 0 0 0",
            boxShadow: "0 4px 24px #eeb6d2",
            display: "flex",
            flexDirection: "column",
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: PINK_DARK,
              borderRadius:
                window.innerWidth < 600
                  ? "0"
                  : "18px 0 0 0",
              padding:
                window.innerWidth < 600
                  ? "12px 10px"
                  : "16px 20px 12px 20px",
              display: "flex",
              alignItems: "center",
              color: "#fff",
              position: "relative",
            }}
          >
            <Avatar
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
              size={window.innerWidth < 600 ? 28 : 36}
              style={{ marginRight: 12, background: "#fff" }}
            />
            <span style={{ fontWeight: 600, fontSize: window.innerWidth < 600 ? 16 : 20 }}>
              MiMiBear
            </span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              style={{
                position: "absolute",
                right: 12,
                top: 10,
                color: "#fff",
                fontSize: 22,
              }}
              onClick={() => setShowChat(false)}
            />
          </div>
          {/* Nội dung chat */}
          <div
            style={{
              flex: 1,
              padding: window.innerWidth < 600 ? "12px 0 0 0" : "24px 0 0 0",
              overflowY: "auto",
              background: WHITE,
            }}
          >
            <div
              style={{
                margin: window.innerWidth < 600 ? "0 8px 12px 8px" : "0 24px 16px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoverMsg(i)}
                  onMouseLeave={() => setHoverMsg(null)}
                  style={{
                    background: msg.role === "bot" ? "#f7f7fa" : "#fff",
                    borderRadius: 16,
                    padding: "7px 14px",
                    marginBottom: 8,
                    fontSize: 15,
                    color: msg.role === "bot" ? "#222" : "#fff",
                    position: "relative",
                    maxWidth: msg.role === "bot" ? "100%" : "70%", // <-- SỬA DÒNG NÀY
                    alignSelf: msg.role === "bot" ? "flex-start" : "flex-end",
                    border: msg.role === "user" ? "none" : "none",
                    boxShadow: msg.role === "bot" ? "0 1px 4px #ececec" : "0 1px 4px #fce4ec",
                    fontWeight: 400,
                    textAlign: "left",
                    wordBreak: "break-word",
                    lineHeight: 1.5,
                    marginLeft: msg.role === "bot" ? 0 : "auto",
                    marginRight: msg.role === "user" ? 0 : "auto",
                    backgroundColor: msg.role === "user" ? "#d63384" : "#f7f7fa",
                  }}
                >
                  {msg.isLoading ? (
                    <DotLoading />
                  ) : msg.products && Array.isArray(msg.products) && msg.products.length > 0 ? (
                    <div>
                      <div style={{ marginBottom: 8, fontWeight: 600 }}>Đây là một số sản phẩm gợi ý:</div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 10,
                          justifyContent: "flex-start" // SỬA ở đây
                        }}
                      >
                        {msg.products.map((prod, idx) => {
                          console.log("AI product:", prod); // Thêm dòng này để kiểm tra
                          const selectedIdx = selectedProductSizes[i]?.[idx] ?? 0;
                          return (
                            <div
                              key={idx}
                              style={{
                                width: "42%",
                                background: "#ffe6f3",
                                borderRadius: 12,
                                padding: 8,
                                marginBottom: 10,
                                textAlign: "center",
                                boxShadow: "0 2px 8px #f8bbd0",
                                minWidth: 0
                              }}
                            >
                       <a
  href={`/products/${prod._id}`}
  style={{ display: "block", textDecoration: "none", color: "inherit" }}
>
  <div>
    <img
      src={prod.image}
      alt={prod.name}
      style={{
        width: "100%",
        borderRadius: 10,
        background: "#fff",
        marginBottom: 6,
        aspectRatio: "1/1",
        objectFit: "cover"
      }}
    />
    <div
      style={{
        marginBottom: 4,
        fontWeight: 600,
        fontSize: 14,
        minHeight: 36,
        color: "#333",
        textAlign: "center",
        lineHeight: 1.2
      }}
    >
      {prod.name}
    </div>
  </div>
</a>
                              <div style={{ color: "#d63384", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                                {prod.price && prod.price.length > 0
    ? `${Number(prod.price[selectedIdx]).toLocaleString("vi-VN")} đ`
    : ""}
                              </div>
                              <div style={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
                                {(prod.sizes || []).map((sz: string, sidx: number) => (
                                  <span
                                    key={sidx}
                                    style={{
                                      border: selectedIdx === sidx ? "none" : "2px solid #b39ddb",
                                      background: selectedIdx === sidx ? "#d63384" : "#fff",
                                      color: selectedIdx === sidx ? "#fff" : "#7c4dff",
                                      borderRadius: 12,
                                      padding: "2px 10px",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      marginRight: 2,
                                      marginBottom: 2,
                                      cursor: "pointer",
                                      transition: "all 0.2s"
                                    }}
                                    onClick={() =>
                                      setSelectedProductSizes(prev => ({
                                        ...prev,
                                        [i]: { ...(prev[i] || {}), [idx]: sidx }
                                      }))
                                    }
                                  >
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : msg.image ? (
                    msg._id ? (
                      <>
                         {msg.content && (
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          {msg.content}
        </div>
      )}
                      <a
                        href={`/products/${msg._id}`}
                        style={{ display: "block", textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ width: 210, margin: "0 auto 12px auto", background: "#ffe6f3", borderRadius: 18, padding: 14, boxShadow: "0 2px 8px #f8bbd0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              marginBottom: 8,
                              background: "#fff",
                              borderRadius: 12,
                              padding: 4
                            }}
                          >
                            <img
                              src={msg.image}
                              alt={msg.name || "product"}
                              style={{
                                width: "100%",
                                borderRadius: 12,
                                background: "#fff"
                              }}
                            />
                          </div>
                          <div
                            style={{
                              margin: "6px 0 10px 0",
                              fontSize: 17,
                              fontWeight: 700,
                              color: "#444",
                              textAlign: "center",
                              lineHeight: 1.2
                            }}
                          >
                            {msg.name || msg.content.split("\n")[0].replace("Sản phẩm: ", "")}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 12,
                              margin: "8px 0 6px 0"
                            }}
                          >
                            <span
                              style={{
                                fontSize: 22,
                                color: "#d63384",
                                fontWeight: 700,
                                textAlign: "center",
                                display: "block",
                                marginBottom: 6
                              }}
                            >
                              {(() => {
                                if (
                                  msg.sizes &&
                                  msg.price &&
                                  Array.isArray(msg.price) &&
                                  msg.sizes.length > 0 &&
                                  msg.price.length > 0
                                ) {
                                  const idx = selectedSizes[i] ?? 0;
                                  return `${Number(msg.price[idx]).toLocaleString("vi-VN")} đ`;
                                }
                                return "";
                              })()}
                            </span>
                            {msg.old_price && (
                              <span
                                style={{
                                  fontSize: 16,
                                  color: "#999",
                                  textDecoration: "line-through",
                                  fontWeight: 500
                                }}
                              >
                                {msg.old_price}
                              </span>
                            )}
                          </div>
    <div
      style={{
        justifyContent: "center",
        gap: 6,
        marginTop: 2,
        display: "flex",
        flexWrap: "wrap"
      }}
    >
      {(msg.sizes || []).map((sz: string, idx: number) => (
        <span
          key={idx}
          style={{
            cursor: "pointer",
            background: (selectedSizes[i] ?? 0) === idx ? "#d63384" : "#fff",
            color: (selectedSizes[i] ?? 0) === idx ? "#fff" : "#7c4dff",
            border:
              (selectedSizes[i] ?? 0) === idx
                ? "none"
                : "2px solid #b39ddb",
            fontWeight: 600,
            fontSize: 14,
            minWidth: 44,
            textAlign: "center",
            borderRadius: 14,
            padding: "2px 12px",
            marginRight: 0,
            marginBottom: 4,
            transition: "all 0.2s"
          }}
          onClick={e => {
            e.preventDefault(); // Để không chuyển trang khi chọn size
            setSelectedSizes((sizes) => ({ ...sizes, [i]: idx }));
          }}
        >
          {sz}
        </span>
      ))}
    </div>
  </div>
</a>
</>
                    ) : (
                      // Không có _id thì chỉ hiển thị bình thường, KHÔNG bọc <a>
                      <div style={{ width: 210, margin: "0 auto 12px auto", background: "#ffe6f3", borderRadius: 18, padding: 14, boxShadow: "0 2px 8px #f8bbd0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 8,
                            background: "#fff",
                            borderRadius: 12,
                            padding: 4
                          }}
                        >
                          <img
                            src={msg.image}
                            alt={msg.name || "product"}
                            style={{
                              width: "100%",
                              borderRadius: 12,
                              background: "#fff"
                            }}
                          />
                        </div>
                        <div
                          style={{
                            margin: "6px 0 10px 0",
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#444",
                            textAlign: "center",
                            lineHeight: 1.2
                          }}
                        >
                          {msg.name || msg.content.split("\n")[0].replace("Sản phẩm: ", "")}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            margin: "8px 0 6px 0"
                          }}
                        >
                          <span
                            style={{
                              fontSize: 22,
                              color: "#d63384",
                              fontWeight: 700,
                              textAlign: "center",
                              display: "block",
                              marginBottom: 6
                            }}
                          >
                            {(() => {
                              if (
                                msg.sizes &&
                                msg.price &&
                                Array.isArray(msg.price) &&
                                msg.sizes.length > 0 &&
                                msg.price.length > 0
                              ) {
                                const idx = selectedSizes[i] ?? 0;
                                return `${Number(msg.price[idx]).toLocaleString("vi-VN")} đ`;
                              }
                              return "";
                            })()}
                          </span>
                          {msg.old_price && (
                            <span
                              style={{
                                fontSize: 16,
                                color: "#999",
                                textDecoration: "line-through",
                                fontWeight: 500
                              }}
                            >
                              {msg.old_price}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <span style={{ whiteSpace: "pre-line" }}>{msg.content}</span>
                  )}
                  {reactions[i] && (
                    <span
                      style={{
                        position: "absolute",
                        right: -18,
                        bottom: -18,
                        zIndex: 1,
                        background: "#fff",
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px #eee",
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        color: "#ff4d6d"
                      }}
                    >
                      {EMOJIS.find(e => e.key === reactions[i])?.icon}
                    </span>
                  )}
                  {(hoverMsg === i || reactions[i]) && (
                    <div
                      style={{
                        position: "absolute",
                        right: -18,
                        bottom: -18,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center"
                      }}
                      onMouseEnter={() => setShowEmoji(i)}
                      onMouseLeave={() => setShowEmoji(null)}
                    >
                      <Button
                        type="text"
                        icon={
                          <span style={{ fontSize: 20, color: reactions[i] ? "#ff4d6d" : "#bbb" }}>
                            {reactions[i] ? EMOJIS.find(e => e.key === reactions[i])?.icon : "♡"}
                          </span>
                        }
                        style={{
                          background: "#fff",
                          border: "none",
                          boxShadow: "0 2px 8px #eee",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                          borderRadius: "50%",
                          width: 30,
                          height: 30,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      />
                      {showEmoji === i && (
                        <div
                          style={{
                            display: "flex",
                            position: "absolute",
                            bottom: 30,
                            right: -4,
                            background: "#fff",
                            borderRadius: 20,
                            boxShadow: "0 2px 8px #eee",
                            padding: "4px 6px",
                            zIndex: 10,
                            gap: 6
                          }}
                        >
                          {EMOJIS.map(e => (
                            <span
                              key={e.key}
                              style={{
                                fontSize: 18,
                                cursor: "pointer",
                                transition: "transform 0.1s",
                                transform: reactions[i] === e.key ? "scale(1.2)" : "scale(1)"
                              }}
                              onClick={() => {
                                setReactions(r => ({
                                  ...r,
                                  [i]: r[i] === e.key ? null : e.key
                                }));
                                setShowEmoji(null);
                              }}
                            >
                              {e.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
          {/* Input chat */}
          <div
            style={{
              padding: window.innerWidth < 600 ? "10px 8px 6px 8px" : "16px 16px 8px 16px",
              borderTop: `1px solid ${PINK}`,
              background: WHITE,
            }}
          >
            <div>
              <Input
                placeholder="Nhập tin nhắn..."
                size="large"
                value={input}
                onChange={e => setInput(e.target.value)}
                onPressEnter={() => sendMessage()}
                style={{ borderRadius: 10, border: `1.5px solid ${PINK_DARK}` }}
                prefix={
                  <Dropdown
                    trigger={["click"]}
                    overlay={
                      <Menu>
                       
                        {/* Hiển thị tất cả danh mục con luôn */}
                        {categories
                          .filter(cat => Array.isArray(cat.subcategories) && cat.subcategories.length > 0)
                          .flatMap((cat, idx) =>
                            cat.subcategories.map((sub: any, subIdx: number) => (
                              <Menu.Item
                                key={`cat-${idx}-sub-${subIdx}`}
                                onClick={() => {
                                  setShowChat(true);
                                  sendMessage(sub.name);
                                }}
                              >
                                {sub.name}
                              </Menu.Item>
                            ))
                          )
                        }
                      </Menu>
                    }
                    placement="bottomLeft"
                  >
                    <Button
                      type="text"
                      icon={<MenuOutlined style={{ fontSize: 22, color: "#888" }} />}
                      style={{
                        background: "none",
                        border: "none",
                        boxShadow: "none",
                        padding: 0,
                        margin: 0,
                        marginRight: 4,
                        marginLeft: -8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    />
                  </Dropdown>
                }
                suffix={
                  <>
                    <Button
                      type="text"
                      icon={
                        sending ? (
                          <span
                            style={{
                              display: "inline-block",
                              width: 28,
                              height: 28,
                              background: "#888",
                              borderRadius: 8,
                              border: "6px solid #fff",
                              boxSizing: "border-box"
                            }}
                          />
                        ) : (
                          <svg width="28" height="28" fill="#d63384" viewBox="0 0 24 24">
                            <path d="M2.01 21l20.99-9-20.99-9-.01 7 15 2-15 2z"></path>
                          </svg>
                        )
                      }
                      onClick={() => !sending && sendMessage()}
                      disabled={sending}
                      style={{
                        background: "none",
                        border: "none",
                        boxShadow: "none",
                        padding: 0,
                        margin: 0
                      }}
                    />
                    <Button
                      icon={<AudioOutlined />}
                      onClick={startVoice}
                      loading={listening}
                      style={{ marginLeft: 8 }}
                    />
                  </>
                }
                disabled={sending}
              />
            </div>
            {listening && (
              <div style={{ fontSize: 12, color: "#d63384", marginTop: 4, textAlign: "center" }}>
                Đang lắng nghe, vui lòng nói...
              </div>
            )}
          </div>
        </div>
      ) : (
        // Giao diện mini + icon AI
        <div
          style={{
            position: "fixed",
            bottom: 18,
            right: 18,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
          }}
        >
          {showSupport && (
            <>
              <Card
                variant="outlined"
                style={{
                  minWidth: 220,
                  maxWidth: 250,
                  borderRadius: 14,
                  boxShadow: "0 2px 10px #f8bbd0",
                  marginBottom: 6,
                  padding: 0,
                  overflow: "hidden",
                  position: "relative",
                  background: WHITE
                }}
                styles={{
                  body: { padding: "10px 14px 8px 14px", background: WHITE }
                }}
                onMouseEnter={() => setHover(true)}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                  <Avatar
                    src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                    size={26}
                    style={{ marginRight: 8, background: PINK_DARK }}
                  />
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#d63384" }}>
                    MiMiBear
                  </span>
                  {hover && (
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      size="small"
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        color: "#d63384"
                      }}
                      onClick={() => setShowSupport(false)}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#d63384",
                    lineHeight: 1.5,
                    minHeight: 40,
                    transition: "opacity 0.35s, transform 0.35s",
                    opacity: anim ? 0 : 1,
                    transform: anim ? "translateY(16px)" : "translateY(0)",
                    willChange: "opacity, transform"
                  }}
                  key={textIdx}
                >
                  {SUPPORT_TEXTS[textIdx]}
                </div>
              </Card>
            </>
          )}
          {/* Icon tròn nổi ở góc */}
          <Button
            type="primary"
            shape="circle"
            size="large"
            style={{
              width: 52,
              height: 52,
              marginTop: 12,
              background: PINK_DARK,
              border: "none",
              boxShadow: "0 2px 8px #f8bbd0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}
            onClick={() => setShowChat(true)}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
              alt="AI"
              width={34}
              height={34}
              style={{ borderRadius: "50%" }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 4,
                right: 6,
                background: WHITE,
                color: "#d63384",
                borderRadius: 8,
                fontSize: 10,
                padding: "0px 5px",
                fontWeight: 600,
                border: `1px solid ${PINK_DARK}`
              }}
            >
            </span>
          </Button>

          {/* Modal tạo lời chúc */}
          <Modal
            open={showGift}
            title="Tạo lời chúc tặng quà"
            onCancel={() => setShowGift(false)}
            footer={null}
            centered
          >
            <div style={{ marginBottom: 12 }}>
              <Input
                placeholder="Tên người nhận"
                value={giftName}
                onChange={e => setGiftName(e.target.value)}
                style={{ marginBottom: 10 }}
              />
              <Select
                placeholder="Chọn dịp tặng quà"
                options={OCCASIONS}
                value={giftOccasion || undefined}
                onChange={setGiftOccasion}
                style={{ width: "100%" }}
              />
            </div>
            {giftResult && (
              <div
                style={{
                  marginTop: 18,
                  background: PINK,
                  color: "#d63384",
                  borderRadius: 10,
                  padding: 12,
                  fontWeight: 500,
                  textAlign: "center"
                }}
              >
                {giftResult}
              </div>
            )}
          </Modal>
        </div>
      )}
    </>
  );
}