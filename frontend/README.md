Đây là dự án [Next.js](https://nextjs.org) được khởi động bằng [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Bắt đầu

Đầu tiên, hãy chạy máy chủ phát triển:

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
# hoặc
bun dev
```

Mở [http://localhost:3007](http://localhost:3007) bằng trình duyệt của bạn để xem kết quả.

Bạn có thể bắt đầu chỉnh sửa trang bằng cách sửa đổi `app/page.tsx`. Trang sẽ tự động cập nhật khi bạn chỉnh sửa tệp.

Dự án này sử dụng [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) để tự động tối ưu hóa và tải [Geist](https://vercel.com/font), một họ phông chữ mới cho Vercel.

## Tìm hiểu thêm

Để tìm hiểu thêm về Next.js, hãy xem các tài nguyên sau:

- [Tài liệu Next.js](https://nextjs.org/docs) - tìm hiểu về các tính năng và API của Next.js.
- [Tìm hiểu Next.js](https://nextjs.org/learn) - hướng dẫn tương tác về Next.js.

Bạn có thể xem [kho lưu trữ GitHub Next.js](https://github.com/vercel/next.js) - chúng tôi hoan nghênh phản hồi và đóng góp của bạn!

## Triển khai trên Vercel

Cách dễ nhất để triển khai ứng dụng Next.js của bạn là sử dụng [Nền tảng Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) từ những người tạo ra Next.js.

Hãy xem [tài liệu triển khai Next.js](https://nextjs.org/docs/app/building-your-application/deploying) của chúng tôi để biết thêm chi tiết.


## Cách tổ chức thư mục
src/
│
├─ app/                                # Next.js App Router: định tuyến trang
│  ├─ layout.tsx                       # Layout chính (client) — dùng cho mọi page trừ admin
│  ├─ page.tsx                         # Trang chủ (/)
│
│  ├─ about/                           # Trang giới thiệu
│  │  └─ page.tsx                      # Route: /about
│
│  ├─ products/                        # Trang danh sách và chi tiết sản phẩm
│  │  ├─ page.tsx                      # Route: /products
│  │  └─ [id]/
│  │     └─ page.tsx                   # Route: /products/[id]
│
│  ├─ cart/                            # Trang giỏ hàng
│  │  └─ page.tsx                      # Route: /cart
│
│  ├─ admin/                           # Khu vực quản trị riêng biệt
│  │  ├─ layout.tsx                    # Layout riêng cho admin (sidebar, navbar,…)
│  │  ├─ page.tsx                      # Dashboard chính (/admin)
│  │
│  │  ├─ products/                     # Quản lý sản phẩm
│  │  │  ├─ page.tsx                   # Route: /admin/products
│  │  │  └─ [id]/                      # Trang chỉnh sửa sản phẩm
│  │  │     └─ page.tsx                # Route: /admin/products/[id]
│  │
│  │  ├─ users/                        # Quản lý user
│  │  │  └─ page.tsx                   # Route: /admin/users
│  │
│  │  └─ orders/                       # Quản lý đơn hàng
│  │     └─ page.tsx                   # Route: /admin/orders
│
├─ components/                         # Component tái sử dụng (UI)
│  ├─ Button.tsx                       # Nút dùng lại được
│  ├─ ProductCard.tsx                  # Thẻ hiển thị 1 sản phẩm
│  ├─ ProductList.tsx                  # Danh sách sản phẩm (render từ props)
│
│  └─ Admin/                           # Component UI riêng cho admin
│     ├─ Sidebar.tsx                   # Thanh sidebar điều hướng admin
│     ├─ ProductTable.tsx              # Bảng sản phẩm trong admin
│     └─ UserTable.tsx                 # Bảng người dùng trong admin
│
├─ sections/                           # Các section lớn dùng cho từng page
│  ├─ Home/                            # Các phần trong trang chủ
│  │  ├─ HeroSection.tsx               # Phần banner đầu trang
│  │  └─ ProductListSection.tsx        # Gọi ProductList để render sản phẩm
│
│  ├─ Products/                        # Các phần cho trang sản phẩm
│  │  ├─ FilterSection.tsx             # Bộ lọc sản phẩm
│  │  └─ ProductListSection.tsx        # Gọi ProductList sau filter
│
│  └─ Admin/                           # Section cho khu vực admin
│     ├─ DashboardSection.tsx          # Giao diện dashboard tổng quan
│     ├─ ProductSection.tsx            # Giao diện quản lý sản phẩm
│     └─ UserSection.tsx               # Giao diện quản lý người dùng
│
├─ hooks/                              # Custom hooks để tái sử dụng logic
│  ├─ useProduct.ts                    # Hook xử lý dữ liệu sản phẩm
│  ├─ useCart.ts                       # Hook thao tác giỏ hàng
│  └─ useAdminProducts.ts              # Hook cho admin: fetch, xóa, sửa sản phẩm
│
├─ context/                            # Context API (state toàn cục)
│  └─ CartContext.tsx                  # Lưu thông tin giỏ hàng toàn ứng dụng
│
├─ models/                             # Định nghĩa dữ liệu dạng class
│  ├─ product.ts
│  └─ user.ts
│
├─ services/                           # Xử lý giao tiếp với API backend
│  ├─ productService.ts                # Gọi API sản phẩm
│  ├─ cartService.ts                   # Gọi API giỏ hàng
│  └─ adminService.ts                  # Gọi API riêng cho admin (sản phẩm, user,...)
│
├─ styles/                             # CSS toàn cục hoặc riêng component
│  ├─ globals.css                      # CSS chung cho toàn bộ trang
│  └─ product.module.css               # CSS module riêng cho sản phẩm
│
├─ utils/                              # Các hàm tiện ích dùng chung
│  └─ formatPrice.ts                   # Hàm format giá tiền
│
└─ types/                              # Định nghĩa TypeScript types toàn cục
   ├─ product.d.ts                     # Kiểu dữ liệu sản phẩm
   └─ user.d.ts                        # Kiểu dữ liệu người dùng





## tổ chức cho css src
  components/
    ProductCard.tsx
    Button.tsx

  css/
    components/
      ProductCard.module.css
      Button.module.css

    sections/
      HeroSection.module.css
      FilterSection.module.css

  styles/
    globals.css

