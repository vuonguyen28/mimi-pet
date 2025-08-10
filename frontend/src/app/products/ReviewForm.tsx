'use client';
import React, { useState } from 'react';
import styles from '../styles/ReviewForm.module.css';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReviewForm = ({ productId }: { productId: string }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string>('');
  const token = localStorage.getItem('token');

  const handleStarClick = (star: number) => {
    setRating(rating === star ? star - 1 : star);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.warn('Vui lòng đăng nhập để đánh giá!', { position: 'top-center' });
      return;
    }

    if (rating === 0) {
      setError('Vui lòng chọn số sao!');
      toast.warn('Vui lòng chọn số sao!', { position: 'top-center' });
      return;
    }

    if (!comment.trim()) {
      setError('Vui lòng nhập bình luận!');
      toast.warn('Vui lòng nhập bình luận!', { position: 'top-center' });
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (res.ok) {
        toast.success('Cảm ơn bạn đã gửi đánh giá >.<', { position: 'top-center' });
        setRating(0);
        setComment('');
      } else if (res.status === 401) {
        toast.error('Bạn cần đăng nhập để đánh giá!', { position: 'top-center' });
      } else if (res.status === 403) {
        const data = await res.json();
        toast.error(data.error || 'Bạn chưa đủ điều kiện để đánh giá!', { position: 'top-center' });
      } else if (res.status === 400) {
        const data = await res.json();
        toast.error(data.error || 'Bạn đã đánh giá sản phẩm này rồi.', { position: 'top-center' });
      } else {
        toast.error('Đã có lỗi xảy ra! Xin thử lại.', { position: 'top-center' });
      }

    } catch (err) {
      toast.error('Không thể gửi đánh giá. Kiểm tra kết nối mạng!', { position: 'top-center' });
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
      />

      <form onSubmit={handleSubmit} className={styles.reviewForm} noValidate>
        <h3 className={styles.formTitle}>Đánh giá sản phẩm</h3>
        <div className={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${styles.star} ${rating >= star ? styles.filled : ''}`}
              onClick={() => handleStarClick(star)}
              role="button"
              tabIndex={0}
              aria-label={`${star} sao`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStarClick(star);
              }}
            >
              ★
            </span>
          ))}
        </div>

        <label htmlFor="review-comment" className={styles.label}>
          Bình luận của bạn
        </label>
        <textarea
          id="review-comment"
          className={styles.textarea}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError('');
          }}
          placeholder="Bạn nghĩ gì về sản phẩm này?"
          rows={4}
          required
        />

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button
          className={styles.submitBtn}
          type="submit"
          disabled={!token}
        >
          Gửi đánh giá
        </button>
        {!token && (
          <p className={styles.errorMessage}>
            Vui lòng đăng nhập để gửi đánh giá!
          </p>
        )}
      </form>
    </>
  );
};

export default ReviewForm;
