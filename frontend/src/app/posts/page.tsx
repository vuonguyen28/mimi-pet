'use client';
import { useEffect, useState } from 'react';
import './categories/[slug]/categorypage.css';
import InstagramSection from '../components/InstagramSection';

interface Post {
  _id: string;
  title: string;
  slug: string;
  shortDesc: string;
  img?: string;
  hidden?: boolean; // ẩn bài viết
  category?: {
    _id: string;
    title: string;
    slug: string;
    hidden?: boolean; // ẩn danh mục
  };
}

export default function AllPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/posts', {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to fetch posts');

        const data = await res.json();

        // ✅ Lọc các bài viết không bị ẩn và danh mục không bị ẩn
        const visiblePosts = data.items.filter(
          (post: Post) => !post.hidden && !post.category?.hidden
        );

        setPosts(visiblePosts);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      }
    };

    fetchAllPosts();
  }, []);

  return (
    <>
      <div className="services-container">
        <h2 className="services-title">Tất cả bài viết</h2>

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <div className="services-grid">
          {posts.map((post) => (
            <div key={post._id} className="service-card">
              <img
                className="service-img"
                src={`http://localhost:3000/images/${post.img || 'default.jpg'}`}
                alt={post.title}
              />
              <a href={`/posts/detail/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="service-desc">{post.shortDesc}</div>
              </a>
              <div className="service-link-wrap">
                <hr />
                <a className="service-link" href={`/posts/detail/${post.slug}`}>
                  Xem thêm
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PHẦN INSTAGRAM */}
      <InstagramSection />
    </>
  );
}
