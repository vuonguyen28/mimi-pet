'use client'
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Category } from "./types/categoryD";
import { Providers } from "./providers";
import "./globals.css";
import AIChatBox from "@/components/AIChatBox";
import LuckyWheel from "./components/LuckyWheel";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showWheel, setShowWheel] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:3000/categories");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }

    fetchCategories();
  }, []);

  return (
    <html lang="vi">
      <head>
        <title>MimiBear Shop</title>
        <link rel="icon" href="http://localhost:3000/images/logoXP.png" />
      </head>
      <body>
        <Providers>
          {!isAdmin && <Header categories={categories} onOpenWheel={() => setShowWheel(true)} />}
          <main>{children}</main>
          {!isAdmin && <Footer />}
          <LuckyWheel visible={showWheel} onClose={() => setShowWheel(false)} />
        </Providers>
        <AIChatBox />
        {!isAdmin && (
          <button
            onClick={() => setShowWheel(true)}
            style={{
              position: "fixed",
              bottom: 32,      // Đặt giống AIChatBox
              left: 20,        // Góc trái
              zIndex: 9999,
              padding: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              borderRadius: "50%",
              boxShadow: "0 2px 8px #ffd6e0",
              transition: "transform 0.2s",
              // Nếu muốn sát mép hơn, có thể giảm left hoặc bottom
            }}
            title="Vòng quay may mắn"
          >
            <img
              src="http://localhost:3000/images/vqmm.png"
              alt="Vòng quay may mắn"
              style={{ width: 56, height: 56 }}
            />
          </button>
        )}
      </body>
    </html>
  );
}