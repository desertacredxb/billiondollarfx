"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  X,
  MessageSquare,
  UserSquare2,
  CreditCard,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import logo from "../assets/bdfx.gif";

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [payoutCount, setPayoutCount] = useState<number>(0);
  const [bankApprovalCount, setBankApprovalCount] = useState<number>(0);
  const [ibCount, setIbCount] = useState<number>(0);
  const [kycCount, setKycCount] = useState<number>(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // ✅ Fetch Payout Requests
        const payoutRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/payment/withdrawals`
        );
        setPayoutCount(payoutRes.data?.data?.length || 0);

        // ✅ Fetch Bank Approvals (only pending ones)
        const bankRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/users`
        );
        const pendingBankUpdates = bankRes.data.filter(
          (u: any) =>
            u.pendingBankDetails && Object.keys(u.pendingBankDetails).length > 0
        );
        setBankApprovalCount(pendingBankUpdates.length || 0);

        // ✅ Fetch IB Requests (only pending status)
        const ibRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/ib`
        );
        const pendingIbRequests = ibRes.data.filter(
          (u: any) => u.status === "pending"
        );
        setIbCount(pendingIbRequests.length || 0);

        // --- KYC Pending

        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/users`
        );
        const pendingKyc = userRes.data.filter(
          (u: any) => u.isKycVerified === false
        );
        setKycCount(pendingKyc.length || 0);
      } catch (err) {
        console.error("Failed to fetch counts:", err);
      }
    };

    fetchCounts();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    router.push("/login");
  };

  return (
    <aside className="h-full w-64 bg-[#0b121a] text-white flex flex-col border-r border-gray-700">
      {/* Header (Logo + Mobile Close Button) */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 md:hidden">
        <Image src={logo} alt="Admin Logo" width={140} className="h-auto" />
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={22} />
          </button>
        )}
      </div>

      {/* Desktop-only Logo */}
      <div className="hidden md:flex justify-center items-center px-4 py-4 border-b border-gray-800">
        <Image src={logo} alt="Admin Logo" width={160} className="h-auto" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Section title="Navigation">
          <NavLink
            href="/adminDashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            pathname={pathname}
          />
          <NavLink
            href="/users"
            label="Users"
            icon={Users}
            pathname={pathname}
            count={kycCount}
          />
          <NavLink
            href="/brokers"
            label="Brokers"
            icon={Briefcase}
            pathname={pathname}
          />
          <NavLink
            href="/tickets"
            label="Support Ticket"
            icon={MessageSquare}
            pathname={pathname}
          />
          <NavLink
            href="/IB"
            label="IB"
            icon={UserSquare2}
            pathname={pathname}
            count={ibCount}
          />
          <NavLink
            href="/all-transactions"
            label="Transactions"
            icon={CreditCard}
            pathname={pathname}
          />
          <NavLink
            href="/bankapproval"
            label="Bank Approval"
            icon={CheckCircle}
            pathname={pathname}
            count={bankApprovalCount}
          />
          <NavLink
            href="/payout-requests"
            label="Payout Requests"
            icon={CheckCircle}
            pathname={pathname}
            count={payoutCount} // ✅ Pass badge count
          />
        </Section>

        <Section title="Account">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-white/80 w-full cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </Section>
      </div>
    </aside>
  );
}

// --- Reusable Section ---
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase text-gray-400 mb-2 tracking-wide">
        {title}
      </p>
      {children}
    </div>
  );
}

// --- Reusable NavLink ---
function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  count,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  pathname: string;
  count?: number;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium transition-all",
        isActive
          ? "bg-[#1e293b] text-[var(--primary)]"
          : "hover:bg-[#1e293b] text-white/80"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </div>

      {typeof count === "number" && count > 0 && (
        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}
