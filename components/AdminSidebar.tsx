"use client";

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

  const handleSignOut = () => {
    // Remove localStorage items
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <aside className="h-full w-64 bg-[#0b121a] text-white flex flex-col border-r border-gray-700">
      {/* Header (Logo + Mobile Close Button) */}
      {/* Header (Logo & Close button — only visible on mobile) */}
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

      {/* Desktop-only Logo (hidden on mobile) */}
      <div className="hidden md:flex justify-center items-center px-4 py-4 border-b border-gray-800">
        <Image src={logo} alt="Admin Logo" width={160} className="h-auto" />
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Section title="Navigation">
          <NavLink
            href="/adminDashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            pathname={pathname}
          />
          <NavLink
            href="/brokers"
            label="Brokers"
            icon={Briefcase} // ✅ Brokers = Briefcase
            pathname={pathname}
          />
          <NavLink
            href="/tickets"
            label="Support Ticket"
            icon={MessageSquare} // ✅ Support Ticket = Message
            pathname={pathname}
          />
          <NavLink
            href="/IB"
            label="IB"
            icon={UserSquare2} // ✅ IB = UserSquare2
            pathname={pathname}
          />
          <NavLink
            href="/all-transactions"
            label="Transactions"
            icon={CreditCard} // ✅ Transactions = CreditCard
            pathname={pathname}
          />
          <NavLink
            href="/bankapproval"
            label="Bank Approval"
            icon={CheckCircle}
            pathname={pathname}
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
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all",
        isActive
          ? "bg-[#1e293b] text-[var(--primary)]"
          : "hover:bg-[#1e293b] text-white/80"
      )}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
