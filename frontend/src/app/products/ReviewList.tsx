"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/productsDetail.module.css";

interface Review {
  productId: string;
  name: string;
  username?: string;
  rating: number;
  comment: string;
  createdAt?: string;
  status?: string;
}

interface ReviewListProps {
  productId: string;
}

const reviewsPerPage = 5;

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString().padStart(2, "0")}/${date.getFullYear()}`;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchReviews = () => {
      if (isFirstLoad.current) setLoading(true);

      fetch('http://localhost:3000/reviews?productId=' + productId, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then((res) => res.json())
        .then((data) => {
          // Đảm bảo data.reviews luôn là mảng, tránh lỗi .length của undefined
          let fetched: Review[] = Array.isArray(data.reviews) ? data.reviews : [];
          // Sắp xếp bình luận mới nhất lên đầu
          fetched = fetched.sort((a, b) => 
            (new Date(b.createdAt ?? 0).getTime()) - (new Date(a.createdAt ?? 0).getTime())
          );
          console.log("Fetched reviews:", fetched);
          setReviews(fetched);
          setLoading(false);
          isFirstLoad.current = false;
        })
        .catch(() => {
          setReviews([]); // Đảm bảo luôn là mảng
          setLoading(false);
        });
    };

    setPage(1); // Khi đổi productId thì về trang 1
    fetchReviews();
    interval = setInterval(fetchReviews, 5000);

    return () => clearInterval(interval);
  }, [productId]);

  const totalReviews = reviews.length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage) || 1;
  const reviewsToShow = reviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );

  const avgRating = totalReviews === 0
    ? 0
    : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const avgRatingRounded = Math.round(avgRating * 10) / 10;

  return (
    <div className={styles.review_section}>
      <div className={styles.avg_rating}>
        <p>Điểm đánh giá trung bình</p>
        <span className={styles.avg_rating_number}>{avgRatingRounded}</span>
        <span className={styles.star_icons}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx}>
              {avgRatingRounded >= idx + 1
                ? "★"
                : avgRatingRounded >= idx + 0.5
                  ? "☆"
                  : "☆"}
            </span>
          ))}
        </span>
      </div>
      <h2>Đánh giá của khách hàng</h2>

      {loading ? (
        <div>Đang tải đánh giá...</div>
      ) : (
        <>
          <div id="review-list">
            {reviewsToShow.length === 0 &&
              <div style={{ margin: "auto", textAlign: "center" }}>
                <img src="http://localhost:3000/images/binhluan.jpg" alt="" width={400} />
                <p>Chưa có đánh giá nào.</p>
              </div>}
            {reviewsToShow.map((r, i) => (
              <div className={styles.review_item} key={r.createdAt || i}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>
                    {r.username ? r.username : r.name}
                  </span>
                  <span className={styles.reviewRating}>
                    {"⭐".repeat(r.rating)}
                  </span>
                </div>
                <div className={styles.reviewComment}>{r.comment}</div>
                {r.createdAt && (
                  <span className={styles.reviewDate}>
                    {formatDate(r.createdAt)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div id="pagination">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`${styles.paginationBtn} ${page === idx + 1 ? styles.paginationBtn_active : ""
                  }`}
                onClick={() => setPage(idx + 1)}
                type="button"
                disabled={page === idx + 1}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewList;