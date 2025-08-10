"use client";
import React, { useState } from "react";
import "./forget.css";
import { useRouter } from "next/navigation";
import { useShowMessage } from "../utils/useShowMessage";

export default function Forget() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [error, setError] = useState("");
  const router = useRouter();
  const showMessage = useShowMessage("forget", "user");

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) error = "Vui lòng nhập email!";
      else if (!value.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/))
        error = "Email không hợp lệ!";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    validateField("email", email);
    if (errors.email) return;

    const res = await fetch("http://localhost:3000/users/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      showMessage.success("Đã gửi mã xác thực về email!");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } else {
      showMessage.error(data.message || "Gửi OTP thất bại!");
    }
  };

  return (
    <div className="container">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>
      <div className="circle circle5"></div>

      <div className="forget-container">
        <div className="bear-ear left-ear"></div>
        <div className="bear-ear right-ear"></div>
        <h2>Quên mật khẩu</h2>
        <p>Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            required
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              validateField("email", e.target.value);
            }}
          />
          {errors.email && <div className="input-error">{errors.email}</div>}
          <button type="submit">Gửi mã xác thực</button>
          <a href="/login" className="register-link">Quay lại đăng nhập</a>
        </form>
      </div>
    </div>
  );
}