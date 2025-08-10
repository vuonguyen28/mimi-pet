import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../../css/main.css";

type Review = {
  id: string;
  user: string;
  product: string;
  stars: number;
  comment: string;
  date: string;
  visible: boolean;
};

const initialReviews: Review[] = [
  {
    id: "RV001",
    user: "Nguyễn Văn A",
    product: "Sản phẩm A",
    stars: 4,
    comment: "Chất lượng tốt, giao hàng nhanh.",
    date: "25/05/2025",
    visible: true,
  },
  {
    id: "RV002",
    user: "Trần Thị B",
    product: "Sản phẩm B",
    stars: 3,
    comment: "Hàng ổn, sẽ ủng hộ tiếp.",
    date: "24/05/2025",
    visible: false,
  },
  // Thêm các đánh giá khác nếu cần
];

function renderStars(stars: number) {
  const full = Math.floor(stars);
  const empty = 5 - full;
  return (
    <span style={{ color: "#FFD700" }}>
      {[...Array(full)].map((_, i) => (
        <i key={"full" + i} className="fas fa-star"></i>
      ))}
      {[...Array(empty)].map((_, i) => (
        <i key={"empty" + i} className="far fa-star"></i>
      ))}
      {" "}({stars})
    </span>
  );
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [clock, setClock] = useState("");

  // Đồng hồ realtime
  useEffect(() => {
    function updateClock() {
      const today = new Date();
      const weekday = [
        "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
      ];
      const day = weekday[today.getDay()];
      let dd: string | number = today.getDate();
      let mm: string | number = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      let h: string | number = today.getHours();
      let m: string | number = today.getMinutes();
      let s: string | number = today.getSeconds();
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s;
      dd = dd < 10 ? "0" + dd : dd;
      mm = mm < 10 ? "0" + mm : mm;
      const nowTime = `${h} giờ ${m} phút ${s} giây`;
      const dateStr = `${day}, ${dd}/${mm}/${yyyy}`;
      setClock(
        <span className="date">{dateStr} - {nowTime}</span>
      );
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle ẩn/hiện đánh giá
  const handleToggleVisibility = (id: string) => {
    setReviews(reviews =>
      reviews.map(r =>
        r.id === id ? { ...r, visible: !r.visible } : r
      )
    );
  };

  return (
    <main className="app-content">
      <div className="app-title">
        <ul className="app-breadcrumb breadcrumb side">
          <li className="breadcrumb-item active"><a href="#"><b>Quản lý đánh giá</b></a></li>
        </ul>
        <div id="clock">{clock}</div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="tile">
            <div className="tile-body">
              <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>ID đánh giá</th>
                    <th>Tên người dùng</th>
                    <th>Tên sản phẩm</th>
                    <th>Số sao</th>
                    <th>Bình luận</th>
                    <th>Ngày đăng</th>
                    <th>Trạng thái</th>
                    <th>Hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review.id}>
                      <td>{review.id}</td>
                      <td>{review.user}</td>
                      <td>{review.product}</td>
                      <td>{renderStars(review.stars)}</td>
                      <td>{review.comment}</td>
                      <td>{review.date}</td>
                      <td>
                        <span className={`badge ${review.visible ? "bg-success" : "bg-secondary"}`}>
                          {review.visible ? "Hiển thị" : "Đã ẩn"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-light btn-sm toggle-visibility"
                          type="button"
                          title="Ẩn/Hiện"
                          onClick={() => handleToggleVisibility(review.id)}
                        >
                          <i className={`fas ${review.visible ? "fa-eye" : "fa-eye-slash"}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center">Không có đánh giá nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}