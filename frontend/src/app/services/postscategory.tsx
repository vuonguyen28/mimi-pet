import { PostCategory } from '../types/postscategory';

interface RawPostCategory {
  _id: string;
  title: string;
  slug: string;
  hidden?: boolean;
}

export const getPostCategories = async (): Promise<PostCategory[]> => {
  try {
    const res = await fetch('http://localhost:3000/api/postscategories');
    if (!res.ok) {
      throw new Error('Lỗi khi fetch danh mục bài viết');
    }

    const data: RawPostCategory[] = await res.json();

    const formatted: PostCategory[] = data
      .filter((item) => !item.hidden)
      .map((item) => ({
        _id: item._id,
        name: item.title, // ánh xạ từ title → name
        slug: item.slug,
        hidden: item.hidden || false, // đảm bảo có trường hidden
      }));

    return formatted;
  } catch (error) {
    console.error('Lỗi khi tải danh mục bài viết:', error);
    return [];
  }
};
