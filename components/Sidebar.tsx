"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import {
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  FileText,
  FileCheck,
  User,
  Wallet,
  LineChart,
  Book,
  Database,
  ArrowRightLeft,
  BarChart3,
  Globe,
  Users,
  Settings,
  LogOut,
  Briefcase,
  BarChart2,
  MessageCircle,
  Shield,
  Key,
  X,
} from "lucide-react";

import clsx from "clsx";
import logo from "../assets/bdfx.gif";
import Image from "next/image";

export default function Sidebar({
  showSidebar = false,
  onClose,
}: {
  showSidebar?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState({
    mt5: false,
    market: false,
    settings: false,
  });
  const router = useRouter();

  const toggle = (section: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleSignOut = () => {
    // Remove localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 z-50 h-full w-64 bg-[#0b121a] text-white flex flex-col transition-transform duration-300 lg:translate-x-0",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo and Close (Mobile Only) */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        <Image src={logo} alt="Billion Dollar FX" width={150} />
        <button
          onClick={onClose}
          className="lg:hidden text-white hover:text-gray-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-16">
        {/* QUICK ACCESS */}
        <Section title="Quick Access">
          <NavLink
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            pathname={pathname}
            onClose={onClose}
          />

          <Dropdown
            label="MT5 Accounts"
            icon={User}
            isOpen={open.mt5}
            onToggle={() => toggle("mt5")}
            items={[
              { label: "Live Accounts", href: "live-accounts", icon: FileText },
              // {
              //   label: "Demo Accounts",
              //   href: "demo-accounts",
              //   icon: FileCheck,
              // },
            ]}
            pathname={pathname}
            onClose={onClose}
          />

          <NavLink
            href="/web-trader"
            label="MT5 Web Trader"
            icon={Globe}
            pathname={pathname}
            onClose={onClose}
          />
          <NavLink
            href="/Ourplatform"
            label="Platform"
            icon={BarChart3}
            pathname={pathname}
            onClose={onClose}
          />
          {/* <NavLink
            href="/technical-analysis"
            label="Technical Analysis"
            icon={LineChart}
            pathname={pathname}
          /> */}
        </Section>

        {/* FUNDS */}
        <Section title="Funds">
          <NavLink
            href="/deposits"
            label="Deposits"
            icon={Wallet}
            pathname={pathname}
            onClose={onClose}
          />
          <Link
            href="/withdrawals"
            onClick={async (e) => {
              e.preventDefault(); // Stop instant navigation

              try {
                // console.log("🟢 Withdraw NavLink clicked!");

                const token = localStorage.getItem("token");
                const userString = localStorage.getItem("user");

                if (!token || !userString) {
                  await Swal.fire({
                    icon: "warning",
                    title: "Login Required",
                    text: "Please log in to continue.",
                    confirmButtonColor: "#d33",
                  });
                  router.push("/login");
                  return;
                }

                const user = JSON.parse(userString);
                const email = user.email;

                // 🌀 Show loader while fetching
                Swal.fire({
                  title: "Checking your account...",
                  text: "Please wait a moment while we verify your trading balance.",
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  },
                });

                // ✅ Fetch user data
                const res = await axios.get(
                  `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`
                );

                const userData = res.data;
                if (!userData?.accounts?.length) {
                  Swal.close();
                  await Swal.fire({
                    icon: "error",
                    title: "No Account Found",
                    text: "No trading account is linked to your profile.",
                    confirmButtonColor: "#d33",
                  });
                  return;
                }

                const accountNo = userData.accounts[0].accountNo;
                // console.log("User AccountNo:", accountNo);

                // ✅ Check MoneyPlant balance
                const balanceRes = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_BASE}/api/moneyplant/checkBalance`,
                  { accountno: accountNo.toString() },
                  { headers: { "Content-Type": "application/json" } }
                );

                const result = balanceRes.data;
                const response =
                  result.data?.response || result.data?.data?.response;
                const margin = parseFloat(
                  result?.data?.Margin || result?.data?.data?.Margin || "0"
                );

                Swal.close(); // ✅ Close loader after response

                // ⚠️ Margin check
                if (response === "success" && margin > 0) {
                  await Swal.fire({
                    icon: "warning",
                    title: "Open Trades Detected",
                    text: `You currently have open trades. Please close them before withdrawing.`,
                    confirmButtonColor: "#d33",
                  });
                  return;
                }

                // ✅ Success
                await Swal.fire({
                  icon: "success",
                  title: "All Clear",
                  text: "No open trades found. Redirecting to Withdrawals...",
                  showConfirmButton: false,
                  timer: 1500,
                });

                router.push("/withdrawals");
                if (onClose) onClose();
              } catch (error) {
                console.error("Error checking withdrawal access:", error);
                Swal.close();
                await Swal.fire({
                  icon: "error",
                  title: "Something went wrong",
                  text: "Please try again later.",
                  confirmButtonColor: "#d33",
                });
              }
            }}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded hover:text-[var(--primary)] transition-all text-sm w-full text-left cursor-pointer",
              pathname === "/withdrawals" &&
                "text-[var(--primary)] font-semibold"
            )}
          >
            <ArrowRightLeft size={16} />
            Withdrawals
          </Link>

          {/* <NavLink
            href="/transfers"
            label="Transfers"
            icon={Database}
            pathname={pathname}
          /> */}
          <NavLink
            href="/transactions"
            label="Transactions"
            icon={BarChart2}
            pathname={pathname}
            onClose={onClose}
          />
        </Section>

        {/* RESOURCES */}
        <Section title="Resources & Insights">
          <NavLink
            href="/forex-glossary"
            label="Forex Glossary"
            icon={Book}
            pathname={pathname}
            onClose={onClose}
          />
          <Dropdown
            label="Market Data"
            icon={LineChart}
            isOpen={open.market}
            onToggle={() => toggle("market")}
            items={[
              {
                label: "Live Market Rates",
                href: "/live-markets-rates",
                icon: BarChart3,
              },
              {
                label: "News Feed",
                href: "/top-news",
                icon: MessageCircle,
              },
              {
                label: "Forex Indicators",
                href: "/indicators",
                icon: BarChart2,
              },
            ]}
            pathname={pathname}
            onClose={onClose}
          />
        </Section>

        {/* TOOLS */}
        <Section title="Tools & Add-Ons">
          {/* <NavLink
            href="/social-trading"
            label="Social Trading"
            icon={Users}
            pathname={pathname}
          /> */}
          {/* <NavLink
            href="/pamm"
            label="PAMM"
            icon={Briefcase}
            pathname={pathname}
          /> */}
          <NavLink
            href="/introducing-broker"
            label="Introducing Broker"
            icon={User}
            pathname={pathname}
            onClose={onClose}
          />
          <NavLink
            href="/support"
            label="Support Tickets"
            icon={MessageCircle}
            pathname={pathname}
            onClose={onClose}
          />
        </Section>

        {/* PROFILE */}
        <Section title="Profile">
          <NavLink
            href="/settings"
            label="Settings"
            icon={Settings}
            pathname={pathname}
            onClose={onClose}
          />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] text-white/80 w-full cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </Section>
      </div>
    </div>
  );
}

// Reusable Components
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <p className="text-sm uppercase text-gray-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onClose, // 👈 added
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  pathname: string;
  onClose?: () => void;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={() => {
        if (onClose) onClose(); // 👈 close sidebar on mobile
      }}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded hover:text-[var(--primary)] transition-all text-sm",
        isActive && "text-[var(--primary)] font-semibold"
      )}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

function Dropdown({
  label,
  icon: Icon,
  isOpen,
  onToggle,
  items,
  pathname,
  onClose,
}: {
  label: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  items: { label: string; href: string; icon: React.ElementType }[];
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-2 rounded hover:text-[var(--primary)] transition-all text-sm"
      >
        <span className="flex items-center gap-2">
          <Icon size={16} />
          {label}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="ml-6 mt-1 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              pathname={pathname}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}
