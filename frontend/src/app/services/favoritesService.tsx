import { Products } from "../types/productD";

// Lấy danh sách sản phẩm yêu thích của user (từ API)
export async function getFavoritesByUser(userId: string, token: string): Promise<Products[]> {
  const res = await fetch(`http://localhost:3000/favorites?userId=${userId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Lỗi lấy danh sách yêu thích trên server");
  return await res.json();
}

// Thêm sản phẩm vào yêu thích (API)
export async function addFavorite(productId: string, userId: string, token: string) {
  const res = await fetch("http://localhost:3000/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ productId, userId })
  });
  if (!res.ok) throw new Error("Lỗi thêm yêu thích server");
  return await res.json();
}

// Xóa sản phẩm khỏi yêu thích (API)
export async function removeFavorite(productId: string, userId: string, token: string) {
  const res = await fetch(`http://localhost:3000/favorites/${productId}?userId=${userId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Lỗi xóa yêu thích server");
  return await res.json();
}