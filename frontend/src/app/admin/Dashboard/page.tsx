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
// Nếu muốn dùng biểu đồ, cài thêm react-chartjs-2 và chart.js

const barData = {
  labels: [],
  datasets: [
    {
      label: "Doanh thu (triệu)",
      data: [],
      backgroundColor: "#28a745",
    },
  ],
};

export default function ReportManagement() {
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<any[]>([]);
  // Dummy data for new employees, replace with real data fetching if needed
  const [newEmployees, setNewEmployees] = useState<any[]>([]);
  const [newCustomers, setNewCustomers] = useState<any[]>([]);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);

  const [monthLabels, setMonthLabels] = useState<string[]>([]);
  const [ordersCountByMonth, setOrdersCountByMonth] = useState<number[]>([]);

useEffect(() => {
  fetch("http://localhost:3000/orders")
    .then(res => res.json())
    .then(data => {
      setOrders(data);

      // Tính số đơn hàng đã giao từng tháng
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const months = Array.from({ length: currentMonth }, (_, i) => i + 1);
      const counts = months.map(month => {
        return data.filter((order: { createdAt: string | number | Date; }) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() + 1 === month;
        }).length;
      });

      setOrdersCountByMonth(counts);
      setMonthLabels(months.map(m => `Tháng ${m}`));
    });
}, []);

const lineData = {
  labels: monthLabels,
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

const lineOptions = {
  scales: {
    y: {
      ticks: {
        stepSize: 1, // Hiển thị số nguyên
        callback: function (value: number | string) {
          return Number(value); // Loại bỏ phần thập phân
        }
      },
      beginAtZero: true
    }
  }
};


  useEffect(() => {
    fetch("http://localhost:3000/api/statistics/revenue")
      .then(res => res.json())
      .then(data => {
        // Lấy tháng hiện tại
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const months = Array.from({ length: currentMonth }, (_, i) => i + 1);
        // Map doanh thu từng tháng, nếu không có thì là 0
        const revenueArr = months.map(month => {
          const found = data.find((item: any) => item.month === month);
          return found ? found.total / 1000000 : 0; // đổi sang triệu
        });
        setRevenueData(revenueArr);
        setLabels(months.map(m => `Tháng ${m}`));
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setOutOfStockProducts(data.filter((p: any) => p.quantity === 0));
      });
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(setUsers);
    fetch("http://localhost:3000/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);

        // Tính sản phẩm bán chạy từ orders
        const productMap = new Map();
        data.forEach((order: any) => {
          if (order.orderStatus !== "delivered") return;
          if (!Array.isArray(order.orderItems)) return;
          order.orderItems.forEach((item: any) => {
            const key = item.product._id || item.product;
            if (!productMap.has(key)) {
              productMap.set(key, {
                id: key,
                name: item.product.name || item.name,
                price: item.product.price || item.price,
                category: item.product.category || item.category,
                totalSold: 0,
              });
            }
            productMap.get(key).totalSold += item.quantity; // <--- CỘNG DỒN SỐ LƯỢNG BÁN
          });
        });
        const bestSellersArr = Array.from(productMap.values())
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 5);
        setBestSellers(bestSellersArr);
      });
  }, []);

  useEffect(() => {
    // Lọc khách hàng mới trong 7 ngày gần nhất
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setNewCustomers(users.filter(u => new Date(u.createdAt) >= weekAgo));
  }, [users]);

  useEffect(() => {
    fetch("http://localhost:3000/orderdetails")
      .then(res => res.json())
      .then(data => {
        console.log("orderdetails api data:", data);
        setOrderDetails(Array.isArray(data) ? data : []);
      });
  }, []);

  const updatedBarData = {
    labels: labels,
    datasets: [
      {
        label: "Doanh thu (triệu)",
        data: revenueData,
        backgroundColor: "#28a745",
      },
    ],
  };

  // Sau khi đã setOrders(data) trong useEffect fetch orders
  const totalRevenue = orders
    .filter(order => order.orderStatus === "delivered")
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalDeliveredOrders = orders.filter(order => order.orderStatus === "Đã giao").length;

  function getQuantity(orderId: string, productId: string) {
    const detail = orderDetails.find(
      (od) =>
        String(od.orderId) === String(orderId) &&
        String(od.productId) === String(productId)
    );
    return detail ? detail.quantity : 0;
  }

  function getOrderDetailList(orderId: string) {
    return orderDetails
      .filter(od => String(od.orderId) === String(orderId))
      .map(od => ({
        name: od.productName,
        quantity: od.quantity
      }));
  }

  return (
    <main className="app-content">
      <div className="row">
        <div className="col-md-12">
          <div className="app-title">
            <ul className="app-breadcrumb breadcrumb">
              <li className="breadcrumb-item"><b>Báo cáo doanh thu</b></li>
            </ul>
            <div id="clock"></div>
          </div>
        </div>
      </div>
      {/* Widgets */}
      <div className="row">
        <div className="col-md-3 col-6 mb-3">
          <div className="widget-small primary coloured-icon">
            <i className="icon bx bxs-user fa-3x"></i>
            <div className="info">
              <h4>TỔNG KHÁCH HÀNG</h4>
              <p><b>{users.length} khách hàng</b></p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="widget-small info coloured-icon">
            <i className="icon bx bxs-purchase-tag-alt fa-3x"></i>
            <div className="info">
              <h4>TỔNG SẢN PHẨM</h4>
              <p><b>{products.length} sản phẩm</b></p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="widget-small warning coloured-icon">
            <i className="icon bx bxs-shopping-bag-alt fa-3x"></i>
            <div className="info">
              <h4>TỔNG ĐƠN HÀNG</h4>
              <p><b>{orders.length} đơn hàng</b></p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="widget-small danger coloured-icon">
            <i className="icon bx bxs-tag-x fa-3x"></i>
            <div className="info">
              <h4>HẾT HÀNG</h4>
              <p><b>{outOfStockProducts.length} sản phẩm</b></p>
            </div>
          </div>
        </div>
      </div>
      {/* More widgets */}
      <div className="row">
        <div className="col-md-6 col-lg-3">
          <div className="widget-small primary coloured-icon">
            <i className="icon fa-3x bx bxs-chart"></i>
            <div className="info">
              <h4>Tổng thu nhập</h4>
              <p><b>{totalRevenue.toLocaleString()} đ</b></p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="widget-small info coloured-icon">
            <i className="icon fa-3x bx bxs-user-badge"></i>
            <div className="info">
              <h4>KHÁCH HÀNG MỚI</h4>
              <p><b>{newCustomers.length} khách hàng</b></p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="widget-small danger coloured-icon">
            <i className="icon fa-3x bx bxs-receipt"></i>
            <div className="info">
              <h4>Đơn hàng hủy</h4>
              <p>
                <b>
                  {orders.filter(order => order.orderStatus === "cancelled").length} đơn hàng
                </b>
              </p>
            </div>
          </div>
        </div>
      </div>
     
      {/* Orders */}
      <div className="row">
        <div className="col-md-12">
          <div className="tile">
            <h3 className="tile-title">TỔNG ĐƠN HÀNG</h3>
            <div className="tile-body">
              <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>ID đơn hàng</th>
                    <th>Khách hàng</th>
                    <th>Tên sản phẩm</th>
                    <th>Số sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter(order => order.orderStatus === "delivered")
                    .map(order => (
                      <tr key={order._id || order.id}>
                        <td>{order._id || order.id}</td>
                        <td>{order.shippingInfo?.name || order.customerName || order.customer || order.user?.username || order.user?.email}</td>
                        <td>
                          {(Array.isArray(orderDetails) ? orderDetails : [])
                            .filter(od => String(od.orderId) === String(order._id || order.id))
                            .map(od => od.productName)
                            .join(", ")}
                        </td>
                        <td>
                          {(Array.isArray(orderDetails) ? orderDetails : [])
                            .filter(od => String(od.orderId) === String(order._id || order.id))
                            .map(od => od.quantity)
                            .join(", ")}
                        </td>
                        <td>{order.totalPrice?.toLocaleString() || order.total?.toLocaleString()} đ</td>
                        <td>
                          <span className="badge bg-success">Đã giao</span>
                        </td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</td>
                      </tr>
                    ))}
                  <tr>
                    <th colSpan={4}>Tổng cộng:</th>
                    <td colSpan={3}>
                      {orders
                        .filter(order => order.orderStatus === "delivered")
                        .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
                        .toLocaleString()} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  
      {/* New customers */}
      <div className="row">
        <div className="col-md-12">
          <div className="tile">
            <h3 className="tile-title">KHÁCH HÀNG MỚI</h3>
            <div className="tile-body">
              <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Tên khách hàng</th>
                    <th>Email</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {newCustomers.map((c, idx) => (
                    <tr key={idx}>
                      <td>{c.name || c.username || c.email}</td>
                      <td>{c.email}</td>
                      <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Charts */}
      <div className="row">
        <div className="col-md-6">
          <div className="tile">
                <h3 className="tile-title" style={{ textAlign: "center", marginTop: 12 }}>DỮ LIỆU HÀNG THÁNG</h3>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="tile">
             <h3 className="tile-title" style={{ textAlign: "center", marginTop: 12 }}>THỐNG KÊ DOANH THU THEO THÁNG</h3>
            <Bar data={updatedBarData} />
           
          </div>
        </div>
      </div>
      <div className="text-right" style={{ fontSize: 12 }}>
        <p><b>Hệ thống quản lý V2.0 | Code by Trường</b></p>
      </div>
    </main>
  );
}