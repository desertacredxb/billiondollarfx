"use client";

import {
  Bell,
  Globe,
  HelpCircle,
  ChevronDown,
  Maximize,
  Minimize,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Topbar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserName(parsedUser.fullName || "U");
        } catch (e) {
          setUserName("U");
        }
      }
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  const handleSignOut = () => {
    // Remove localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <header className="h-16 w-full bg-[#121e2c] text-white flex items-center justify-between px-4 md:px-6 shadow z-40">
      {/* Hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden text-white">
          <Menu size={24} />
        </button>
        <span className="font-semibold text-lg hidden sm:inline">
          Welcome Back!
        </span>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 relative">
        <button title="Fullscreen" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        {/* <button title="Notifications">
          <Bell size={20} />
        </button>
        <button title="Language">
          <Globe size={20} />
        </button> */}

        {/* User dropdown */}
        <div className="relative">
          <button
            className="flex items-center justify-center bg-[var(--primary)] text-black w-8 h-8 rounded-full text-sm font-bold"
            onClick={() => setOpenUserMenu((prev) => !prev)}
          >
            {userName.charAt(0).toUpperCase()}
          </button>

          {openUserMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-[#121E2C] text-white  rounded shadow z-50">
              <a
                href="/settings"
                className="block px-4 py-2 hover:bg-gray-100 hover:text-black"
              >
                Profile
              </a>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
