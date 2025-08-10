'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '@/app/styles/bearstories.module.css';

interface Post {
  _id: string;
  title: string;
  slug: string;
  img?: string;
}

export default function BearStories() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/posts/by-category-slug/chuyen-nha-gau', {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Không thể tải bài viết');

        const data = await res.json();
        setPosts(data.items || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu');
      }
    };

    fetchPosts();
  }, []);

  const settings = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className={styles.bgsContainer}>
      <h2 className={styles.bgsHeader}>Chuyện Nhà Gấu</h2>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <Slider {...settings} className={styles.bgsCarousel}>
        {posts.map((post) => (
          <div key={post._id} className={styles.bgsSlide}>
            <a href={`/posts/detail/${post.slug}`}>
              <img
                src={`http://localhost:3000/images/${post.img || 'default.jpg'}`}
                alt={post.title}
              />
            </a>
            <div className={styles.bgsCaption}>
              <a href={`/posts/detail/${post.slug}`}>
                <p>{post.title}</p>
              </a>
              <a href={`/posts/detail/${post.slug}`}>Xem thêm</a>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}
