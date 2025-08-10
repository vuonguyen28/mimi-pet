// components/CommentForm.tsx
import React from 'react';

export default function CommentForm() {
  return (
    <div className="comment-section">
      <h3>Để lại một bình luận</h3>
      <p className="note">
        Email của bạn sẽ không được hiển thị công khai. Các trường bắt buộc được đánh dấu
        <span className="required">*</span>
      </p>

      <form className="comment-form">
        <label htmlFor="comment">Bình luận <span className="required">*</span></label>
        <textarea id="comment" rows={6}></textarea>

        <label htmlFor="name">Tên <span className="required">*</span></label>
        <input type="text" id="name" />

        <label htmlFor="email">Email <span className="required">*</span></label>
        <input type="email" id="email" />

        <label htmlFor="website">Trang web</label>
        <input type="url" id="website" />

        <div className="checkbox">
          <input type="checkbox" id="save-info" />
          <label htmlFor="save-info">
            Lưu tên của tôi, email, và trang web trong trình duyệt này cho lần bình luận kế tiếp của tôi.
          </label>
        </div>

        <button type="submit" className="submit-btn">Gửi bình luận</button>
      </form>
    </div>
  );
}
