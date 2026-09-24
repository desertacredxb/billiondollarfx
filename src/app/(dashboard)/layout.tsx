"use client";

import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SESSION_EXPIRED_EVENT } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      if ((event as CustomEvent<{ scope?: string }>).detail?.scope === "user") {
        router.replace("/login");
      }
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    const token = localStorage.getItem("token"); // 👈 check token from localStorage
    if (!token) {
      router.replace("/login"); // 👈 redirect to landing page if no token
    }

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar
        showSidebar={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="h-16 fixed top-0 left-0 lg:left-64 right-0 z-40 bg-[#121e2c] text-white">
          <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        </header>

        <main className="mt-16 h-[calc(100vh-4rem)] overflow-y-auto p-6 bg-[#000000]">
          {children}
        </main>
      </div>
    </div>
  );
}
