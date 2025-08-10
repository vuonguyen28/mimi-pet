"use client";
import React, { useState } from "react";
import "./register.css";
import { useShowMessage } from "../utils/useShowMessage";
import { useRouter } from "next/navigation";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const showMessage = useShowMessage("register", "user");
  const router = useRouter();

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!value.trim()) error = "Vui lòng nhập tên!";
        else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value))
          error = "Tên chỉ được chứa chữ cái!";
        break;
      case "lastName":
        if (!value.trim()) error = "Vui lòng nhập họ!";
        else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value))
          error = "Họ chỉ được chứa chữ cái!";
        break;
      case "username":
        if (!value.trim()) error = "Vui lòng nhập tên đăng nhập!";
        else if (!/^[a-zA-Z0-9_]{4,}$/.test(value))
          error = "Tên đăng nhập phải từ 4 ký tự, không ký tự đặc biệt!";
        break;
      case "email":
        if (!value.trim()) error = "Vui lòng nhập email!";
        else if (!value.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/))
          error = "Email không hợp lệ!";
        break;
      case "password":
        if (!value) error = "Vui lòng nhập mật khẩu!";
        else if (value.length < 6) error = "Mật khẩu phải ít nhất 6 ký tự!";
        break;
      case "confirm":
        if (!value) error = "Vui lòng nhập lại mật khẩu!";
        else if (value !== password) error = "Mật khẩu nhập lại không khớp!";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = "Vui lòng nhập tên!";
    if (!lastName.trim()) newErrors.lastName = "Vui lòng nhập họ!";
    if (!username.trim()) newErrors.username = "Vui lòng nhập tên đăng nhập!";
    else if (!/^[a-zA-Z0-9_]{4,}$/.test(username))
      newErrors.username = "Tên đăng nhập phải từ 4 ký tự, không ký tự đặc biệt!";
    if (!email.trim()) newErrors.email = "Vui lòng nhập email!";
    else if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/))
      newErrors.email = "Email không hợp lệ!";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu!";
    else if (password.length < 6)
      newErrors.password = "Mật khẩu phải ít nhất 6 ký tự!";
    if (!confirm) newErrors.confirm = "Vui lòng nhập lại mật khẩu!";
    else if (password !== confirm)
      newErrors.confirm = "Mật khẩu nhập lại không khớp!";
    if (!agree) newErrors.agree = "Bạn phải đồng ý với Điều khoản!";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);

    try {
      // Thay đổi URL backend đúng với server của bạn
      const res = await fetch("http://localhost:3000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          username,
        }),
      });

      const data = await res.json();

      // Nếu lỗi từ backend (ví dụ trùng email):
      if (!res.ok) {
        if (data?.message === "Email đã tồn tại") {
          setErrors({ email: "Email này đã được đăng ký. Vui lòng dùng email khác!" });
        } else {
          showMessage.error(
            `Đăng ký thất bại: ${data?.message || JSON.stringify(data) || "Lỗi server"}`
          );
        }
      } else {
        showMessage.success(
          `Đăng ký thành công cho ${email}. Vui lòng kiểm tra email để lấy mã xác thực!`
        );
        // Tặng 1 lượt quay cho tài khoản mới
        localStorage.setItem("turns", "1");
        // Chuyển hướng sang trang xác thực email OTP
        router.push(`/verifyemail?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      showMessage.error("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>
      <div className="circle circle5"></div>

      <div className="register-box">
        <div className="bear-ear left-ear"></div>
        <div className="bear-ear right-ear"></div>
        <h2>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Tên *"
                required
                value={firstName}
                onChange={e => {
                  setFirstName(e.target.value);
                  validateField("firstName", e.target.value);
                }}
              />
              {errors.firstName && (
                <div className="input-error">{errors.firstName}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Họ *"
                required
                value={lastName}
                onChange={e => {
                  setLastName(e.target.value);
                  validateField("lastName", e.target.value);
                }}
              />
              {errors.lastName && (
                <div className="input-error">{errors.lastName}</div>
              )}
            </div>
          </div>
          <input
            type="text"
            placeholder="Tên đăng nhập *"
            required
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              validateField("username", e.target.value);
            }}
          />
          {errors.username && <div className="input-error">{errors.username}</div>}

          <input
            type="email"
            placeholder="Địa chỉ Email"
            required
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              validateField("email", e.target.value);
            }}
            autoComplete="new-email"
          />
          {errors.email && <div className="input-error">{errors.email}</div>}

          <input
            type="password"
            placeholder="Mật khẩu"
            required
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              validateField("password", e.target.value);
            }}
            autoComplete="new-password"
          />
          {errors.password && <div className="input-error">{errors.password}</div>}

          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            required
            value={confirm}
            onChange={e => {
              setConfirm(e.target.value);
              validateField("confirm", e.target.value);
            }}
            autoComplete="new-password"
          />
          {errors.confirm && <div className="input-error">{errors.confirm}</div>}

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              Tôi đồng ý với{" "}
              <a
                href="#"
                style={{ color: "#d16ba5", textDecoration: "underline" }}
              >
                Điều khoản
              </a>
            </label>
            {errors.agree && <div className="input-error">{errors.agree}</div>}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
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
                alt="Google"
              />
              Google
            </button>
           
          </div>
          <a href="/login" className="register-link">
            Đã có tài khoản? Đăng nhập
          </a>
        </form>
      </div>
    </div>
  );
}
