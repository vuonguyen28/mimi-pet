"use client";
  import React, { useEffect, useState } from "react";
  import "bootstrap/dist/css/bootstrap.min.css";
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import "boxicons/css/boxicons.min.css";
  import "../admin.css";

  type User = {
    _id: string;
    name: string;
    email: string;
    username: string;
    dob: string;
    role: string;
    status: "Hoạt động" | "Khóa";
    visible: boolean;
  };

  // const initialUsers: User[] = [
  //   {
  //     stt: 1,
  //     name: "Nguyễn Văn A",
  //     email: "nguyenvana@gmail.com",
  //     username: "nguyenvana",
  //     dob: "10/09/1998",
  //     role: "Admin",
  //     status: "Hoạt động",
  //     checked: false,
  //     visible: true,
  //   },
  //   {
  //     id: 2,
  //     name: "Trần Thị B",
  //     email: "tranthib@gmail.com",
  //     username: "tranthib",
  //     dob: "02/12/1999",
  //     role: "User",
  //     status: "Khóa",
  //     checked: false,
  //     visible: false,
  //   },
  // ];

  export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [clock, setClock] = useState("");

    // Đồng hồ realtime
    useEffect(() => {
      function updateClock() {
        const today = new Date();
        const weekday = [
          "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
        ];
        const day = weekday[today.getDay()];
        let dd: string | number = today.getDate();
        let mm: string | number = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        let h: string | number = today.getHours();
        let m: string | number = today.getMinutes();
        let s: string | number = today.getSeconds();
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        dd = dd < 10 ? "0" + dd : dd;
        mm = mm < 10 ? "0" + mm : mm;
        const nowTime = `${h} giờ ${m} phút ${s} giây`;
        const dateStr = `${day}, ${dd}/${mm}/${yyyy}`;
        setClock(`${dateStr} - ${nowTime}`);
      }
      updateClock();
      const timer = setInterval(updateClock, 1000);
      return () => clearInterval(timer);
    }, []);



    // Lấy danh sách user từ backend
    useEffect(() => {
      fetch("http://localhost:3000/users") // Sửa đúng port backend
        .then(res => res.json())
        .then(data => {
          // Nếu user từ backend không có các trường checked/status/dob/username thì cần xử lý thêm
          const mapped:User[] = data.map((u: any) => ({
            ...u,
            checked: false,
            status: u.visible ? "Hoạt động" : "Khóa",
            dob: u.dob || "",
            username: u.username || ""
          }));
          // Sắp xếp theo ObjectId: mới nhất nằm trên cùng
          const sorted = mapped.sort((a, b) => {
            const timeA = parseInt(a._id.substring(0, 8), 16);
            const timeB = parseInt(b._id.substring(0, 8), 16);
            return timeB - timeA; // Mới hơn trước
          });
          setUsers(sorted);
        });
    }, []);
  // Giả sử users[] lấy từ backend, mỗi user có _id là ObjectId của MongoDB
  //Tonggle ẩn/hiện user
  const handleToggleVisibility = async (idx: number) => {
    const user = users[idx];
    try {
      const res = await fetch(`http://localhost:3000/users/${user._id}/toggle-visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      const data = await res.json();
      setUsers(users =>
        users.map((u, i) =>
          i === idx
            ? { ...u, visible: data.visible, status: data.status }
            : u
        )
      );
    } catch (err) {
      alert('Không thể cập nhật trạng thái!');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: currentRole === "admin" ? "user" : "admin"
        })
      });
      if (!res.ok) throw new Error("Cập nhật quyền thất bại");
      const data = await res.json();
      setUsers(users =>
        users.map(u =>
          u._id === userId ? { ...u, role: data.role } : u
        )
      );
    } catch (err) {
      alert("Không thể cập nhật quyền!");
    }
  };

    return (
      <main className="app-content">
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb side">
            <li className="breadcrumb-item active"><a href="#"><b>Quản lý user</b></a></li>
          </ul>
          <div id="clock">{clock}</div>
        </div>
        <div className="row element-button">
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="tile">
              <div className="tile-body">
                <table className="table table-hover table-bordered" id="sampleTable">
                  <thead>
                    <tr>
                      {/* <th style={{ width: "10px" }}>
                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                      </th> */}
                      <th>STT</th>
                      <th>Email</th>
                      <th>Username</th>
                      {/* <th>Ngày sinh</th> */}
                      <th>Quyền</th>
                      <th>Trạng thái</th>
                      <th>Chức năng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u._id}>
                        {/* <td width="10">
                          <input
                            type="checkbox"
                            checked={u.checked}
                            onChange={() => handleCheck(idx)}
                          />
                        </td> */}
                        <td>{users.length - idx}</td>
                        <td>{u.email}</td>
                        <td>{u.username}</td>
                        {/* <td>{u.dob}</td> */}
                        <td>{u.role}</td>
                        <td>
                          <span className={`badge ${
                            u.status === "Hoạt động"
                              ? "bg-success"
                              : u.status === "Khóa"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-admin-role"
                            type="button"
                            title={u.role === "admin" ? "Bỏ quyền Admin" : "Cấp quyền Admin"}
                            onClick={() => handleToggleRole(u._id, u.role)}
                          >
                            <i className="fas fa-crown"></i>
                            {u.role === "admin" ? "Bỏ Admin" : "Cấp Admin"}
                          </button>
                          <button
                            className={`btn btn-light btn-sm toggle-visibility ${u.visible ? "visible" : "hidden"}`}
                            type="button"
                            title="Ẩn/Hiện"
                            onClick={() => handleToggleVisibility(idx)}
                          >
                            <i className={`fas ${u.visible ? "fa-eye" : "fa-eye-slash"}`}></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center">Không có user nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* sửa user nếu cần */}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
