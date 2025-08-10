'use client';

import { useEffect, useState } from 'react';
import styles from "../styles/instagram.module.css";

interface Post {
  _id: string;
  title: string;
  slug: string;
  img?: string;
  hidden?: boolean;
}

export default function InstagramSection() {
  const quotes = [
    `MiMiBear – Từ những chú gấu bông đầu tiên<br />đến thương hiệu được hàng ngàn khách hàng yêu mến`,
    `MiMiBear – Mỗi món quà đều là lời yêu thương<br />dành tặng người thân yêu nhất`
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');



  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/posts/by-category-slug/chuyen-nha-gau', { cache: 'no-store' });
        if (!res.ok) throw new Error('Không thể tải bài viết');

        const data = await res.json();

        // Chỉ lấy bài viết không bị ẩn
        const visiblePosts = (data.items || []).filter(
          (post: Post) => !post.hidden
        );

        setPosts(visiblePosts);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu');
      }
    };

    fetchPosts();
  }, []);

  const latestPost = posts[0];
  const otherPosts = posts.slice(1, 8);

  return (
    <section className={styles["instagram-section"]}>
      <div className={styles["instagram-container"]}>
        <div className={styles["instagram-header"]}>
          <div className={styles["instagram-title"]}>@MiMiBear</div>
          <a
            href="https://www.instagram.com/vuongphan95"
            target="_blank"
            rel="noopener"
            className={styles["instagram-btn"]}
          >
            THEO DÕI INSTAGRAM MIMIVEAR
            <svg
              style={{ marginLeft: 10 }}
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
            >
              <circle cx="8" cy="8" r="7.25" stroke="#231f20" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="3.5" stroke="#231f20" strokeWidth="1.5" />
              <circle cx="12.25" cy="3.75" r="0.75" fill="#231f20" />
            </svg>
          </a>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <div className={styles["instagram-main"]}>
          <div className={styles["instagram-left"]}>
            {latestPost && (
              <a href={`/posts/detail/${latestPost.slug}`}>
                <img
                  src={`http://localhost:3000/images/${latestPost.img || 'default.jpg'}`}
                  alt={latestPost.title}
                  className={styles["instagram-bigimg"]}
                />
              </a>
            )}
          </div>
          <div className={styles["instagram-right"]}>
            <div className={styles["instagram-grid"]}>
              {otherPosts.map((post) => (
                <a key={post._id} href={`/posts/detail/${post.slug}`}>
                  <img
                    src={`http://localhost:3000/images/${post.img || 'default.jpg'}`}
                    alt={post.title}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles["instagram-quote-block"]}>
          <div
            className={styles["instagram-quote"]}
            dangerouslySetInnerHTML={{ __html: quotes[currentIndex] }}
          />
          <div className={styles["instagram-dots"]}>
            {quotes.map((_, index) => (
              <span
                key={index}
                className={`${styles["instagram-dot"]} ${currentIndex === index ? styles["active"] : styles["inactive"]}`}
                onClick={() => setCurrentIndex(index)}
                style={{ cursor: "pointer" }}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
