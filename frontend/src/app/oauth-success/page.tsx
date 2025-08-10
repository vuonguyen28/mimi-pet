
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OauthSuccess() {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");
    const token = params.get("token");
    if (user && token) {
      localStorage.setItem("user", user);
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("userChanged"));
      router.replace("/");
    }
  }, [router]);
  return null;
}