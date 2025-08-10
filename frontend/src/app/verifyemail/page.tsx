"use client";
import React, { useRef, useState, useEffect } from "react";
import "./verifyemail.css";
import { useRouter } from "next/navigation";
import { useShowMessage } from "../utils/useShowMessage";

export default function Verify() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const showMessage = useShowMessage("verify-otp", "user");
  const inputs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    if (resendSeconds > 0) {
      const timer = setTimeout(() => setResendSeconds(resendSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendSeconds]);

  // Xử lý gửi lại mã OTP (có email)
  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (resendSeconds > 0 || resendLoading) return;
    setResendLoading(true);
    setError("");
    const email = new URLSearchParams(window.location.search).get("email");
    if (!email) {
      setError("Không tìm thấy email!");
      setResendLoading(false);
      return;
    }
    // Gửi lại OTP cho đăng ký
    await fetch("http://localhost:3000/users/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "register" }),
    });
    showMessage.success("Đã gửi lại mã xác thực!");
    setResendSeconds(60);
    setResendLoading(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const value = e.target.value;
    if (value && !/^\d$/.test(value)) {
      setError("Mã OTP chỉ được nhập số!");
    } else {
      setError("");
      if (value.length === 1 && idx < inputs.length - 1) {
        inputs[idx + 1].current?.focus();
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && idx > 0) {
      inputs[idx - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpArr = inputs.map(ref => ref.current?.value || "");
    const otp = otpArr.join("");

    if (otp.length !== 6) {
      setError("Mã OTP phải đủ 6 số!");
      return;
    }
    if (!otpArr.every(char => /^\d$/.test(char))) {
      setError("Mã OTP chỉ được nhập số!");
      return;
    }

  const email = new URLSearchParams(window.location.search).get("email");
  if (!email) {
    setError("Không tìm thấy email!");
    return;
  }
  // Gửi OTP lên backend để xác thực email đăng ký
  const res = await fetch("http://localhost:3000/users/verify-otp-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (res.ok) {
    showMessage.success("Xác thực email thành công! Bạn có thể đăng nhập.");
    setTimeout(() => {
      router.push("/login");
    }, 1200);
  } else {
    setError(data.message || "Mã OTP không đúng hoặc đã hết hạn!");
  }
};

  return (
    <div className="container">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>
      <div className="circle circle5"></div>

      <div className="verify-container">
        <div className="bear-ear left-ear"></div>
        <div className="bear-ear right-ear"></div>
        <h2>Nhập mã xác thực</h2>
        <p>Vui lòng nhập mã xác thực gồm 6 số đã gửi cho bạn.</p>
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="code-inputs">
            {inputs.map((ref, idx) => (
              <input
                key={idx}
                ref={ref}
                type="text"
                maxLength={1}
                pattern="[0-9]*"
                inputMode="numeric"
                required
                onInput={e => handleInput(e as React.ChangeEvent<HTMLInputElement>, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
              />
            ))}
          </div>
          {error && (
            <div className="input-error" style={{ textAlign: "center", margin: "8px 0" }}>
              {error}
            </div>
          )}
          <button type="submit">Xác nhận</button>
          <a
            href="#"
            className="register-link"
            style={{
              pointerEvents: resendSeconds > 0 || resendLoading ? "none" : "auto",
              color: resendSeconds > 0 || resendLoading ? "#aaa" : "#d16ba5",
              marginLeft: 16,
              userSelect: "none",
            }}
            onClick={handleResend}
          >
            {resendSeconds > 0
              ? `Gửi lại mã (${resendSeconds}s)`
              : resendLoading
              ? "Đang gửi..."
              : "Gửi lại mã"}
          </a>
        </form>
      </div>
    </div>
  );
}