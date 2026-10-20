"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Sidebar from "../../../components/AdminSidebar";
import TopbarMobile from "../../../components/TopbarMobile";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("adminToken");
    if (!token || token === "admin-token") {
      router.replace("/admin-login");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/admin/session`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error("Administrator sign in required");
        if (active) setAuthorized(true);
      }).catch(() => {
        if (!active) return;
        localStorage.removeItem("adminToken");
        router.replace("/admin-login");
      });
    return () => { active = false; };
  }, [router]);
  if (!authorized) return <main className="min-h-screen bg-black text-white grid place-items-center" role="status">Checking administrator session…</main>;

  return (
    <div className="flex h-screen bg-[#000000] text-white">
      <Toaster position="top-right" />
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30">
        <TopbarMobile onToggleSidebar={() => setSidebarOpen(true)} />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 bg-[#0b121a] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:z-50`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <main className="p-6 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
