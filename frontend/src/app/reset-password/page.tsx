"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShowMessage } from "../utils/useShowMessage";
import "../register/register.css";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";
  const showMessage = useShowMessage("reset-password", "user");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Kiểm tra từng trường khi thay đổi
  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "password") {
      if (!value) error = "Vui lòng nhập mật khẩu mới!";
      else if (value.length < 6) error = "Mật khẩu phải có ít nhất 6 ký tự!";
    }
    if (name === "confirm") {
      if (!value) error = "Vui lòng nhập lại mật khẩu!";
      else if (value !== password) error = "Mật khẩu xác nhận không khớp!";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Kiểm tra lại tất cả trường khi submit
    let hasError = false;
    const newErrors: typeof errors = {};
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới!";
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      hasError = true;
    }
    if (!confirm) {
      newErrors.confirm = "Vui lòng nhập lại mật khẩu!";
      hasError = true;
    } else if (confirm !== password) {
      newErrors.confirm = "Mật khẩu xác nhận không khớp!";
      hasError = true;
    }
    setErrors(newErrors);
    if (hasError) return;

    if (!email || !otp) {
      setMessage({ type: "error", text: "Thiếu email hoặc mã OTP!" });
      return;
    }

    // Debug log
    console.log("RESET PASSWORD gửi:", { email, otp, password });

    const res = await fetch("http://localhost:3000/users/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: "success", text: "Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập..." });
      showMessage.success("Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setMessage({ type: "error", text: data.message || "Đổi mật khẩu thất bại!" });
      showMessage.error(data.message || "Đổi mật khẩu thất bại!");
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
        <h2>Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit} style={{ width: "90%" }}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              validateField("password", e.target.value);
              // Nếu đã nhập xác nhận thì kiểm tra lại xác nhận luôn
              if (confirm) validateField("confirm", confirm);
            }}
            className="input"
          />
          {errors.password && <div className="input-error">{errors.password}</div>}
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirm}
            onChange={e => {
              setConfirm(e.target.value);
              validateField("confirm", e.target.value);
            }}
            className="input"
          />
          {errors.confirm && <div className="input-error">{errors.confirm}</div>}
          {message && (
            <div
              className={message.type === "error" ? "input-error" : "input-success"}
              style={{ textAlign: "center", margin: "10px 0" }}
            >
              {message.text}
            </div>
          )}
          <button type="submit">Xác nhận</button>
        </form>
      </div>
    </div>
  );
}

