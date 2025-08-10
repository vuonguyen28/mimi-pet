'use client';
import React from "react";

export default function Sidebar({ currentSection }: { currentSection: string }) {
  const menu = [
    { key: "profile", label: "Hồ sơ", icon: "bx bx-user-circle" },
    { key: "dashboard", label: "Bảng điều khiển", icon: "bx bx-home-circle" },
    { key: "products", label: "Quản lý sản phẩm", icon: "bx bx-cube" },
    { key: "users", label: "Quản lý khách hàng", icon: "bx bx-user" },
    { key: "categories", label: "Quản lý danh mục", icon: "bx bx-category" },
    { key: "order", label: "Quản lý đơn hàng", icon: "bx bx-receipt" },
    { key: "article", label: "Quản lý bài viết", icon: "bx bx-news" },
    { key: "postscategories", label: "Danh mục bài viết", icon: "bx bx-news" },
    { key: "evaluate", label: "Quản lý đánh giá", icon: "bx bx-star" },
    { key: "discount", label: "Quản lý mã giảm giá", icon: "bx bx-gift" },
    // { key: "report", label: "Báo cáo doanh thu", icon: "bx bx-bar-chart-alt-2" },
    // { key: "settings", label: "Cài đặt hệ thống", icon: "bx bx-cog" }
  ];

  // Lấy user từ localStorage (chỉ chạy client)
  let username = "Admin";
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        username = user.username || user.name || "Admin";
      } catch {}
    }
  }

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__user">
        <div>
          <p className="app-sidebar__user-name"><b>{username}</b></p>
          <p className="app-sidebar__user-designation">Chào mừng bạn trở lại</p>
        </div>
      </div>
      <hr />
      <ul className="app-menu">
        {menu.map(item => (
          <li key={item.key}>
            <a
              className={`app-menu__item ${currentSection === item.key ? 'active' : ''}`}
              href={`/admin/${item.key}`}
            >
              <i className={`app-menu__icon ${item.icon}`}></i>
              <span className="app-menu__label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
