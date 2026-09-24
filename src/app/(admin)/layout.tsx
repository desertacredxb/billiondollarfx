"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import Sidebar from "../../../components/AdminSidebar";
import TopbarMobile from "../../../components/TopbarMobile";
import { adminApi, clearAdminSession, SESSION_EXPIRED_EVENT } from "@/lib/api";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const expireAdminSession = (event: Event) => {
      if ((event as CustomEvent<{ scope: string }>).detail?.scope !== "admin") return;
      setAuthorized(false);
      router.replace("/login");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expireAdminSession);
    const verifySession = async () => {
      setAuthorized(false);
      setSessionError("");
      if (!localStorage.getItem("adminToken")) {
        router.replace("/login");
        return;
      }
      try {
        const response = await adminApi.get("/api/auth/admin/session");
        if (!active) return;
        if (response.data.isAdmin !== true || !response.data.user?.id) {
          clearAdminSession();
          router.replace("/login");
          return;
        }
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));
        setAuthorized(true);
      } catch (error) {
        if (!active) return;
        if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
          clearAdminSession();
          router.replace("/login");
        } else {
          setSessionError("Could not verify administrator access. Please try again.");
        }
      }
    };
    verifySession();
    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, expireAdminSession);
    };
  }, [router, sessionAttempt]);

  if (!authorized) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
      <p role={sessionError ? "alert" : "status"}>{sessionError || "Checking administrator access..."}</p>
      {sessionError && <button type="button" onClick={() => setSessionAttempt(value => value + 1)}
        className="rounded bg-gray-800 px-4 py-2">Try again</button>}
    </div>;
  }

  return (
    <div className="flex h-screen bg-[#000000] text-white">
      {/* Without this, every toast.success/toast.error call anywhere under
          the admin routes (e.g. WithdrawalApprovalModal, payout-requests)
          updates react-hot-toast's internal state but renders nothing - there
          was no <Toaster/> mounted anywhere in the admin tree or root layout
          to actually display it, so every admin-side error/success toast was
          silently swallowed with only the console.error to show for it. */}
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
