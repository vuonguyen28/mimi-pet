"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "boxicons/css/boxicons.min.css";
import "../admin.css";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // State cho đồng hồ
  const [clock, setClock] = useState("");
  // State cho thống kê tổng hợp
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    lowStock: 0,
  });
  // State cho doanh thu
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    function updateClock() {
      const today = new Date();
      const weekday = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
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

  // Lấy dữ liệu thống kê tổng hợp
  useEffect(() => {
    fetch("http://localhost:3000/api/statistics/summary")
      .then(res => res.json())
      .then(data => {
        console.log("summary data:", data); // Thêm dòng này để kiểm tra
        setSummary(data);
      });
  }, []);

  // Lấy dữ liệu doanh thu từng tháng
  useEffect(() => {
    fetch("http://localhost:3000/api/statistics/revenue")
      .then(res => res.json())
      .then(data => {
        // Tạo mảng doanh thu 6 tháng, mặc định 0
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11
        const months = Array.from({ length: currentMonth }, (_, i) => i + 1);
        const revenueArr = months.map(month => {
          const found = data.find((item: any) => item.month === month);
          return found ? found.total : 0; // Không chia cho 1_000_000
        });
        setRevenueData(revenueArr);
        setLabels(months.map(m => `Tháng ${m}`));
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  // Tạo mảng các tháng thực tế
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const months = Array.from({ length: currentMonth }, (_, i) => i + 1);

  // Tạo mảng số đơn hàng từng tháng thực tế từ dữ liệu orders
  const ordersCountByMonth = months.map(month => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() + 1 === month;
    }).length;
  });

  // Biểu đồ đơn hàng theo tháng thực tế
  const lineData = {
    labels: months.map(m => `Tháng ${m}`),
    datasets: [
      {
        label: "Đơn hàng",
        data: ordersCountByMonth,
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.2)",
        tension: 0.4,
      },
    ],
  };

  // Dữ liệu doanh thu cho bar chart
  const barData = {
    labels: labels.length ? labels : ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Doanh thu (triệu)",
        data: revenueData.length ? revenueData : [0, 0, 0, 0, 0, 0],
        backgroundColor: "#28a745",
      },
    ],
  };

  // Tổng doanh thu 6 tháng
  const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);

  // Dữ liệu mẫu cho bảng đơn hàng và khách hàng (có thể fetch từ backend nếu muốn)
  const sampleOrders = [
    { id: "AL3947", name: "Phạm Thị Ngọc", total: "19.770.000 đ", status: "Chờ xử lý", badge: "bg-info" },
    { id: "ER3835", name: "Nguyễn Thị Mỹ Yến", total: "16.770.000 đ", status: "Đang vận chuyển", badge: "bg-warning" },
    { id: "MD0837", name: "Triệu Thanh Phú", total: "9.400.000 đ", status: "Đã hoàn thành", badge: "bg-success" },
    { id: "MT9835", name: "Đặng Hoàng Phúc", total: "40.650.000 đ", status: "Đã hủy", badge: "bg-danger" },
  ];

  const sampleCustomers = [
    { id: "#183", name: "Hột vịt muối", dob: "21/7/1992", phone: "0921387221", tag: "tag-success", createdAt: new Date().toISOString() },
    { id: "#219", name: "Bánh tráng trộn", dob: "30/4/1975", phone: "0912376352", tag: "tag-warning", createdAt: new Date().toISOString() },
    { id: "#627", name: "Cút rang bơ", dob: "12/3/1999", phone: "01287326654", tag: "tag-primary", createdAt: new Date().toISOString() },
    { id: "#175", name: "Hủ tiếu nam vang", dob: "4/12/20000", phone: "0912376763", tag: "tag-danger", createdAt: new Date().toISOString() },
  ];

  // State cho khách hàng mới
  type Customer = {
    _id?: string;
    id?: string;
    name: string;
    username?: string;
    dob: string;
    tag: string;
    createdAt: string;
    email?: string;
  };
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);

  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(data => setCustomers(data));
  }, []);

  // Tính số đơn hàng từng tháng
  const ordersByMonth = months.map(month => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() + 1 === month;
    });
  });

  const lineOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Hiển thị từng đơn vị
          callback: function(tickValue: string | number, index: number, ticks: any[]) {
            return typeof tickValue === "number" && Number.isInteger(tickValue) ? tickValue : null;
          }
        }
      }
    }
  };

  return (
    <main className="app-content">
      <div className="row">
        <div className="col-md-12">
          <div className="app-title">
            <ul className="app-breadcrumb breadcrumb">
              <li className="breadcrumb-item"><a href="#"><b>Bảng điều khiển</b></a></li>
            </ul>
            <div id="clock">{clock}</div>
          </div>
        </div>
      </div>
      <div className="row">
        {/* Left */}
        <div className="col-md-12 col-lg-6">
          <div className="row">
            <div className="col-md-6">
              <div className="widget-small primary coloured-icon">
                <i className="icon bx bxs-user-account fa-3x"></i>
                <div className="info">
                  <h4>Tổng khách hàng</h4>
                  <p><b>{summary.totalCustomers} khách hàng</b></p>
                  <p className="info-tong">Tổng số khách hàng được quản lý.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="widget-small info coloured-icon">
                <i className="icon bx bxs-data fa-3x"></i>
                <div className="info">
                  <h4>Tổng sản phẩm</h4>
                  <p><b>{summary.totalProducts} sản phẩm</b></p>
                  <p className="info-tong">Tổng số sản phẩm được quản lý.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="widget-small warning coloured-icon">
                <i className="icon bx bxs-shopping-bags fa-3x"></i>
                <div className="info">
                  <h4>Tổng đơn hàng</h4>
                  <p><b>{summary.totalOrders} đơn hàng</b></p>
                  <p className="info-tong">Tổng số hóa đơn bán hàng trong tháng.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="widget-small danger coloured-icon">
                <i className="icon bx bxs-error-alt fa-3x"></i>
                <div className="info">
                  <h4>Sắp hết hàng</h4>
                  <p><b>{summary.lowStock} sản phẩm</b></p>
                  <p className="info-tong">Số sản phẩm cảnh báo hết cần nhập thêm.</p>
                </div>
              </div>
            </div>
            {/* Order Table */}
            <div className="col-md-12">
              <div className="tile">
                <h3 className="tile-title">Tình trạng đơn hàng</h3>
                <div>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>ID đơn hàng</th>
                        <th>Tên khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map(order => (
                          <tr key={order._id}>
                            <td>{order.orderId || order._id}</td>
                            <td>{order.shippingInfo?.name}</td>
                            <td>{order.totalPrice?.toLocaleString()} đ</td>
                            <td>
                              <span className={`badge ${
                                order.orderStatus === "delivered" ? "bg-success" :
                                order.orderStatus === "shipping" ? "bg-primary" :
                                order.orderStatus === "processing" ? "bg-warning" :
                                order.orderStatus === "waiting" ? "bg-info" :
                                order.orderStatus === "cancelled" ? "bg-danger" : "bg-secondary"
                              }`}>
                                {order.orderStatus === "delivered" ? "Đã giao" :
                                 order.orderStatus === "shipping" ? "Đang giao" :
                                 order.orderStatus === "processing" ? "Đang chuẩn bị hàng" :
                                 order.orderStatus === "waiting" ? "Chờ xác nhận" :
                                 order.orderStatus === "cancelled" ? "Đã hủy" : order.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center">Không có đơn hàng nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Customer Table */}
            <div className="col-md-12">
              <div className="tile">
                <h3 className="tile-title">Khách hàng mới</h3>
                <div>
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tên khách hàng</th>
                        <th>Ngày tạo</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length > 0 ? (
                        customers.map(c => (
                          <tr key={c._id || c.id}>
                            <td>{c.name || c.username || c.email}</td>
                            <td>
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleDateString()
                                : "Không có"}
                            </td>
                            <td>{c.email}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center">Không có khách hàng mới trong tuần.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right */}
<div className="col-md-12 col-lg-6">
  <div className="row">
    <div className="col-md-12">
      <div className="tile">
        <h3 className="tile-title" style={{ textAlign: "center", marginTop: 12 }}>Dữ liệu 6 tháng đầu vào</h3>
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
    <div className="col-md-12">
      <div className="tile">
        <h3 className="tile-title" style={{ textAlign: "center", marginTop: 12 }}>Thống kê 6 tháng doanh thu</h3>
        <Bar data={barData} />
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <b>
            Tổng doanh thu 6 tháng: {totalRevenue.toLocaleString()} đ
          </b>
        </div>
      </div>
    </div>
    {/* Bảng đơn hàng theo tháng */}
    <div className="col-md-12">
      <div className="tile">
        <h3 className="tile-title">Tình trạng đơn hàng theo tháng</h3>
        <div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Số đơn hàng</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month, idx) => {
                const monthOrders = ordersByMonth[idx];
                const totalMonth = monthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
                return (
                  <tr key={month}>
                    <td>Tháng {month}</td>
                    <td>{monthOrders.length}</td>
                    <td>{totalMonth.toLocaleString()} đ</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
      <div className="text-center" style={{ fontSize: 13 }}>
        <p>
          <b>
            Copyright {new Date().getFullYear()} Phần mềm quản lý bán hàng | Dev By Trường
          </b>
        </p>
      </div>
    </main>
  );
}