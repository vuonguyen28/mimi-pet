import { useState, useEffect } from "react";
import { getFavoritesByUser } from "../services/favoritesService";

export default function useFavoriteCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Lấy user từ localStorage
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    let userId: string | null = null;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userId = userObj._id || userObj.id;
      } catch {}
    }

    const updateCount = async () => {
      if (userId && token) {
        try {
          const favorites = await getFavoritesByUser(userId, token);
          setCount(favorites.length);
        } catch {
          setCount(0);
        }
      } else {
        const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
        setCount(stored.length);
      }
    };

    updateCount();

    window.addEventListener("storage", updateCount);
    window.addEventListener("favoriteChanged", updateCount);
    window.addEventListener("userChanged", updateCount);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("favoriteChanged", updateCount);
      window.removeEventListener("userChanged", updateCount);
    };
  }, []);

  return count;
}