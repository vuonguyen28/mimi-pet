"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from './Sidebar/page';
import Navbar from './Navbar/page';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || user.role !== "admin") {
      router.replace("/");
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) return null; // hoặc trả về loading

  return (
    <div className="app sidebar-mini rtl">
      <Sidebar currentSection={pathname} />
      <Navbar />
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}
