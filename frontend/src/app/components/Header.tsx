"use client";

import React, { useState, useEffect, useRef } from "react";
import { Affix, Badge } from "antd";
import {
  HeartOutlined,
  ShoppingOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  SearchOutlined,
  DownOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import styles from "../styles/header.module.css";
import { Category } from "../types/categoryD";
import { getProducts } from "../services/productService";
import { useRouter } from "next/navigation";
import { Products } from "../types/productD";
import useFavoriteCount from "../hooks/useFavoriteCount";
import { useAppSelector } from "../store/store";
import { PostCategory } from '../types/postscategory';
import { getPostCategories } from '../services/postscategory';

type Props = {
  categories: Category[];
  onOpenWheel: () => void;
};

const Header: React.FC<Props> = ({ categories, onOpenWheel }) => {
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [mobileOpenIndex, setMobileOpenIndex] = useState<number | null>(null);
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Products[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const favoriteCount = useFavoriteCount();
  // Lấy danh mục bài viết
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getPostCategories();
      setPostCategories(data);
    };
    fetchData();
  }, []);

// Lấy số sản phẩm khác nhau trong giỏ hàng (không phải tổng quantity)
const cartCount = useAppSelector((state) => state.cart.items.length);
  // Debounce search input

  // Hàm xử lý tìm kiếm
  useEffect(() => {
    if (!searchValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const allProducts = await getProducts();
        const filtered = allProducts.filter(
          (product: Products) =>
            product.name.toLowerCase().includes(searchValue.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchValue]);

  // Hàm xử lý tìm kiếm khi nhấn Enter hoặc click vào biểu tượng tìm kiếm
   const handleSearchAction = () => {
    if (searchValue.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setMobileMenuActive(false);
      setShowSuggestions(false);
    }
  };

  // Đóng suggestion khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);



  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearchAction();
  };

  const handleSuggestionClick = (id: string) => {
    router.push(`/products/${id}`);
    setShowSuggestions(false);
    setSearchValue("");
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuActive ? "hidden" : "";
  }, [mobileMenuActive]);

  const openMobileMenu = () => setMobileMenuActive(true);
  const closeMobileMenu = () => {
    setMobileMenuActive(false);
    setMobileOpenIndex(null);
  };
  const handleOverlayClick = () => closeMobileMenu();
  const handleMobileSubmenuToggle = (idx: number) => {
    setMobileOpenIndex(mobileOpenIndex === idx ? null : idx);
  };

  const visibleCategories = categories.filter((c) => !c.hidden);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);


  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUsername(userObj.username || userObj.firstName || null);
      } catch {
        setUsername(null);
      }
    } else {
      setUsername(null);
    }
    // Lắng nghe sự thay đổi user
    const handleStorage = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          setUsername(userObj.username || userObj.firstName || null);
        } catch {
          setUsername(null);
        }
      } else {
        setUsername(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("userChanged", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userChanged", handleStorage);
    };
  }, []);

  useEffect(() => {
    const updateUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          setUsername(
            userObj.username ||
            userObj.firstName ||
            userObj.name ||
            userObj.displayName ||
            userObj.email ||
            null
          );
          setIsLoggedIn(true);
        } catch {
          setUsername(null);
          setIsLoggedIn(false);
        }
      } else {
        setUsername(null);
        setIsLoggedIn(false);
      }
    };

    updateUser();
    window.addEventListener("userChanged", updateUser);
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("userChanged", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, []);
//Đăng xuất xóa thông tin người dùng và token ra khỏi localStorage
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowUserMenu(false);
    window.location.reload();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles["header-row"]}>
          <div className={styles["logo-wrap"]}>
            <a href="/">
              <img src="http://localhost:3000/images/logoXP.png" alt="Mimi Bear Logo" />
            </a>
            <div className={styles.slogan}>“Hug MimiBear-Unbox Love”</div>
          </div>
          <form onSubmit={handleSearch} className={styles["search-box"]}>
            <input
              type="search"
              placeholder="Nhập sản phẩm cần tìm ?"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              ref={inputRef}
            />
            <SearchOutlined
              onClick={handleSearchAction}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#e87ebd",
                fontSize: "1.25rem",
                cursor: "pointer",
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestionBox} ref={suggestionBoxRef}>
                <ul className={styles.suggestionList}>
                  {suggestions.map((prod) => (
                    <li
                      key={prod._id}
                      className={styles.suggestionItem}
                     onMouseDown={() => handleSuggestionClick(prod._id)}
                    >
                      <img
                        src={`http://localhost:3000/images/${prod.images[0]}`}
                        alt={prod.name}
                        className={styles.suggestionImg}
                      />
                      <span>{prod.name}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.suggestionFooter} onMouseDown={handleSearchAction}>
                  <span>Xem thêm</span>
                </div>
              </div>
            )}
          </form>
          <div className={styles["header-icons"]}>

            <a
              href="/favorites"
              title="Xem danh sách yêu thích"
              className={styles.favoriteIconWrap}
            >
              <HeartOutlined style={{ fontSize: 22, color: "#ff4d4f", position: "relative" }} />
              {favoriteCount > 0 && (
                <span className={styles.favoriteBadge}>{favoriteCount}</span>
              )}
            </a>
            <a href="/cart">
              {cartCount > 0 ? (
                <Badge
                  count={cartCount}
                  color="#e87ebd"
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e87ebd",
                    boxShadow: "0 0 0 2px #fff",
                  }}
                >
                  <ShoppingOutlined
                    style={{
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      color: "#e87ebd",
                    }}
                  />
                </Badge>
              ) : (
                <ShoppingOutlined
                  style={{
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#e87ebd",
                  }}
                />
              )}
            </a>
             <div
              className={styles["user-menu-wrap"]}
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
              ref={userMenuRef}
              style={{ position: "relative", display: "inline-block", marginLeft: 8 }}
            >
              {isLoggedIn && username ? (
                <>
                {username && (
  <a href={`/userprofile/${encodeURIComponent(username)}`}>
                  <span
                    style={{
                      fontWeight: 500,
                      color: "#b94490",
                      cursor: "pointer",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      background: "#fff",
                    }}
                  >
                    Xin chào, {username}
                  </span>
                   </a>
)}
                  {showUserMenu && (
                    <div className={styles["user-menu-dropdown"]}>
                      <button
                        className={styles["user-menu-btn"]}
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <UserOutlined style={{ cursor: "pointer", fontSize: 22 }} />
                  {showUserMenu && (
                    <div className={styles["user-menu-dropdown"]}>
                      <a href="/login" className={styles["user-menu-btn"]}>
                        Đăng nhập
                      </a>
                      <a href="/register" className={styles["user-menu-btn"]}>
                        Đăng ký
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
   
          </div>
          <button className={styles["menu-btn"]} onClick={openMobileMenu}>
            <MenuOutlined />
          </button>
        </div>
      </header>

      <Affix style={{ zIndex: 100 }}>
        <nav className={styles.menu}>
          <div className={styles["menu-row"]}>
            <ul>
              <li>
                <div className={styles["menu-item"]}>
                  <a href="/">Trang chủ</a>
                </div>
              </li>
              <li>
                <div className={styles["menu-item"]}>
                  <a href="/products">Sản phẩm</a>
                </div>
              </li>

              <li className={styles["has-submenu"]}>
                <div className={styles["menu-item"]}>
                  <a href="/posts">Bài viết</a>
                  <span className={styles["icon-down"]}><DownOutlined /></span>
                </div>
                <ul className={styles["submenu"]}>
                  <li><a href="/posts">Tất cả bài viết</a></li>
                  {postCategories.map((cat) => (
                    <li key={cat._id}>
                      <a href={`/posts/categories/${cat.slug}`}>{cat.name}</a>
                    </li>
                  ))}
                </ul>
              </li>

              {visibleCategories.map((item) => {
                const visibleSub = item.subcategories?.filter((sub) => !sub.hidden) || [];
                const hasSub = visibleSub.length > 0;

                return (
                  <li key={item._id} className={hasSub ? styles["has-submenu"] : ""}>
                    <div className={styles["menu-item"]}>
                      <a href={`/products?category=${item._id}`}>{item.name}</a>
                      {hasSub && <span className={styles["icon-down"]}><DownOutlined /></span>}
                    </div>
                    {hasSub && (
                      <ul className={styles.submenu}>
                        {visibleSub.map((sub) => (
                          <li key={sub._id}>
                            <a href={`/products?subcategory=${sub._id}`}>{sub.name}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </Affix>

      <div className={`${styles.overlay}${mobileMenuActive ? " " + styles.active : ""}`} onClick={handleOverlayClick}></div>

      <div className={`${styles["mobile-menu"]}${mobileMenuActive ? " " + styles.active : ""}`}>
        <div className={styles["mobile-menu-header"]}>
          <span className={styles.title}>Danh mục</span>
          <button className={styles["mobile-close-btn"]} onClick={closeMobileMenu}>
            <CloseOutlined />
          </button>
        </div>
        {username ? (
          <div className={styles["mobile-account"]}>
            <a href={`/userprofile/${encodeURIComponent(username)}`}>
              <UserOutlined /> Xin chào, {username}
            </a>

            <a href="/favorites" className={styles.favoriteIconWrap} title="Yêu thích">
              <HeartOutlined style={{ fontSize: 20, color: "#e87ebd", cursor: "pointer" }} />
              {favoriteCount > 0 && <span className={styles.favoriteBadge}>{favoriteCount}</span>}
            </a>

            <a href="/cart" title="Giỏ hàng" style={{ position: "relative" }}>
              {cartCount > 0 ? (
                <Badge
                  count={cartCount}
                  color="#e87ebd"
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e87ebd",
                    boxShadow: "0 0 0 2px #fff",
                  }}
                >
                  <ShoppingOutlined style={{ fontSize: 20, color: "#e87ebd", cursor: "pointer" }} />
                </Badge>
              ) : (
                <ShoppingOutlined style={{ fontSize: 20, color: "#e87ebd", cursor: "pointer" }} />
              )}
            </a>
          </div>
        ) : (
          <a href="/login">
            <div className={styles["mobile-account"]}>
              <UserOutlined /> Tài khoản
            </div>
          </a>
        )}


        <div className={styles["mobile-search-box"]}>
          <form onSubmit={handleSearch} style={{ position: "relative" }}>
            <input
              type="search"
              placeholder="Nhập sản phẩm cần tìm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <SearchOutlined
              onClick={handleSearchAction}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#b94490",
                fontSize: "1.07rem",
                cursor: "pointer",
              }}
            />
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestionBox} ref={suggestionBoxRef}>
              <ul className={styles.suggestionList}>
                {suggestions.map((prod) => (
                  <li
                    key={prod._id}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(prod._id)}
                  >
                    <img
                      src={`http://localhost:3000/images/${prod.images[0]}`}
                      alt={prod.name}
                      className={styles.suggestionImg}
                    />
                    <span>{prod.name}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.suggestionFooter} onClick={handleSearchAction}>
                <span>Xem thêm</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles["mobile-menu-list"]}>
          <ul>
            {visibleCategories.map((item, idx) => {
              const visibleSub = item.subcategories?.filter((sub) => !sub.hidden) || [];
              const hasSub = visibleSub.length > 0;

              return (
                <li
                  key={item._id}
                  className={hasSub && mobileOpenIndex === idx ? styles.open : ""}
                >
                  {hasSub ? (
                    <>
                      <a
                        href={`/products?category=${item._id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMobileSubmenuToggle(idx);
                        }}
                      >
                        {item.name}
                        <button
                          className={styles["submenu-toggle"]}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMobileSubmenuToggle(idx);
                          }}
                          aria-label="Mở submenu"
                          tabIndex={-1}
                          type="button"
                        >
                          <DownOutlined />
                        </button>
                      </a>
                      <ul className={styles.submenu}>
                        {visibleSub.map((sub) => (
                          <li key={sub._id}>
                            <a href={`/products?subcategory=${sub._id}`}>{sub.name}</a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a href={`/products?category=${item._id}`}>{item.name}</a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;