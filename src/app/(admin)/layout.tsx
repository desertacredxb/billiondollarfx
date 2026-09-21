"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "../../../components/AdminSidebar";
import TopbarMobile from "../../../components/TopbarMobile";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
