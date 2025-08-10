"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../admin.css";

type AdminData = {
  name: string;
  email: string;
  isGoogle: boolean;
  role: string;
  lastLogin: string;
};

export default function AdminProfilePage() {
  const [adminData, setAdminData] = useState<AdminData>({
    name: "",
    email: "",
    isGoogle: false,
    role: "Quản trị viên",
    lastLogin: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isGoogle =
      !!user.googleId ||
      user.provider === "google" ||
      user.isGoogle ||
      user.loginType === "google";

    setAdminData({
      name: user.fullName || user.name || user.username || "",
      email: user.email || "",
      isGoogle,
      role: user.role || "Quản trị viên",
      lastLogin: user.lastLogin
        ? new Date(user.lastLogin).toLocaleString("vi-VN")
        : "",
    });
  }, []);

  return (
    <main className="container py-4">
      <div className="row justify-content-center">
        {/* Thông tin cá nhân */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "#ffd700",
                  color: "#b30000",
                  fontSize: 44,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  border: "3px solid #fffbe6",
                  boxShadow: "0 2px 8px #ffd70099",
                }}
              >
                {adminData.name && adminData.name.trim() !== ""
                  ? adminData.name.trim().split(" ").filter(Boolean).pop()?.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <h4 className="mb-1">{adminData.name}</h4>
              <div className="mb-2 text-muted">{adminData.email}</div>
                <div className="mb-2">
                <span className="badge bg-primary">{adminData.role}</span>
              </div>
            </div>
          </div>
        </div>


        {/* Footer */}
        <div className="text-center mt-3" style={{ fontSize: 13 }}>
          <b>
            Copyright {new Date().getFullYear()} Phần mềm quản lý bán hàng | Dev Mimi Bear
          </b>
        </div>
      </div>
    </main>
  );
}
