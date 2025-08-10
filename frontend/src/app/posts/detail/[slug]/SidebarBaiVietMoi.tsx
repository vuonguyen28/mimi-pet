// components/SidebarBaiVietMoi.tsx
import React from 'react';

interface Post {
  _id: string;
  title: string;
  slug: string;
}

export default function SidebarBaiVietMoi({ recentPosts }: { recentPosts: Post[] }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">BÀI VIẾT MỚI</div>
      </div>
      <ul className="sidebar-menu">
        {recentPosts.map((item) => (
          <li key={item._id} className="menu-item">
            <a href={`/posts/detail/${item.slug}`}>{item.title}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
