"use client";
import React, { useState } from "react";
import "./login.css";
import { useRouter } from "next/navigation";
import { useShowMessage } from "../utils/useShowMessage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const router = useRouter();
  const showMessage = useShowMessage("login", "user");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Kiểm tra email hợp lệ
    if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setError("Email không hợp lệ!");
      return;
    }

    // Kiểm tra password tối thiểu 6 ký tự
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage.error(data.message || "Sai tài khoản hoặc mật khẩu!");
        return;
      }

      if (data.user && data.user.visible === false) {
        showMessage.error(
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
        );
        return;
      }

      // Lưu user và token vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("userChanged"));

      // Thông báo thành công
      showMessage.success("Đăng nhập thành công!");

      // Chuyển trang phù hợp
      if (data.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      showMessage.error("Lỗi kết nối máy chủ!");
    }
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) error = "Vui lòng nhập email!";
      else if (!value.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/))
        error = "Email không hợp lệ!";
    }
    if (name === "password") {
      if (!value) error = "Vui lòng nhập mật khẩu!";
      else if (value.length < 6) error = "Mật khẩu phải có ít nhất 6 ký tự!";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <div className="container">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>
      <div className="circle circle5"></div>

      <form className="login-box" onSubmit={handleSubmit}>
        <div className="bear-ear left-ear"></div>
        <div className="bear-ear right-ear"></div>
        <h2>Đăng Nhập</h2>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateField("email", e.target.value);
          }}
        />
        {errors.email && <div className="input-error">{errors.email}</div>}

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validateField("password", e.target.value);
          }}
        />
         {errors.password && <div className="input-error">{errors.password}</div>}
        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Nhớ tôi sau nhé
          </label>
          <a href="/forget" className="forgot">
            Quên mật khẩu?
          </a>
        </div>
        <button type="submit">Đăng nhập</button>
        <div className="social-login">
          <button
            className="google-btn"
            type="button"
            onClick={() =>
              (window.location.href = "http://localhost:3000/users/auth/google")
            }
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt=""
            />
            Google
          </button>
          
        </div>
        <a href="/register" className="register-link">
          Bạn chưa có tài khoản?
        </a>
      </form>
    </div>
  );
}