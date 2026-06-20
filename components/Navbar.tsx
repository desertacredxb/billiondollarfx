"use client";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import logo from "../assets/bdfx.gif";
import Image from "next/image";
import LanguageSelector from "./LanguageSelector";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay?: boolean },
          elementId: string
        ) => void;
      };
    };
  }
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems = [
    {
      title: "Markets",
      dropdown: true,
      items: [
        { label: "Forex", href: "/forex" },
        { label: "Indices", href: "/indices" },
        { label: "Crypto", href: "/crypto" },
        { label: "Metals", href: "/metals" },
        { label: "Commodities", href: "/commodities" },
        { label: "Oil", href: "/oil" },
      ],
    },
    {
      title: "Trading",
      dropdown: true,
      items: [
        { label: "Platforms", href: "/platform" },
        { label: "Accounts", href: "/accounts" },
      ],
    },
    {
      title: "About Us",
      dropdown: false,
      href: "/about",
    },
    {
      title: "Education",
      dropdown: false,
      href: "/education",
    },
    {
      title: "Insights",
      dropdown: true,
      items: [
        { label: "News", href: "/news" },
        { label: "Blogs", href: "/blog" },
      ],
    },
    {
      title: "Tools",
      dropdown: true,
      items: [
        { label: "Analytical Tools", href: "/analytical-tools" },
        { label: "Economic Calendar", href: "/economic-calendar" },
        { label: "Currency Calculator", href: "/currency-calculator" },
        { label: "Currency Converter", href: "/currency-converter" },
      ],
    },
    {
      title: "Promotions",
      dropdown: true,
      items: [
        { label: "2.5% Cashback", href: "/cashback" },
        { label: "Trade to Win", href: "/trade-to-win" },
      ],
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const loadGoogleTranslateScript = () => {
      if (!window.googleTranslateElementInit) {
        const script = document.createElement("script");
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
        window.googleTranslateElementInit = googleTranslateElementInit;
      }
    };

    loadGoogleTranslateScript();
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#121E2C]/80 backdrop-blur shadow-lg"
          : "bg-transparent"
      } text-gray-400 font-montserrat`}
    >
      <div className="w-11/12 mx-auto flex items-center justify-between py-4 md:py-3">
        {/* Logo */}
        <div className="flex items-center w-auto">
          <Link href="/">
            <Image src={logo} alt="logo" className="w-auto max-w-[200px]" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium ml-4">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.title}
                className="relative group cursor-pointer py-6 "
              >
                <span className="flex items-center gap-1 hover:text-white transition ">
                  {item.title}
                  <ChevronDown className="w-4 h-4" />
                </span>
                <div className="absolute top-full left-0 hidden group-hover:block bg-[#0d1721] text-gray-500 shadow-lg py-2 px-4 rounded w-52 z-50 space-y-2">
                  {item.items?.map((link) => (
                    <Link
                      href={link.href}
                      key={link.href}
                      className="flex justify-between items-center px-2 py-1 hover:text-[var(--primary)] text-sm"
                    >
                      <span>{link.label}</span>
                      <span className="font-bold">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.title}
                href={item.href!}
                className="hover:text-white transition py-6"
              >
                {item.title}
              </Link>
            )
          )}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4 text-sm font-medium ml-auto">
          <Link
            href="/ib-broker"
            className="hover:text-[#ffd277] transition text-[var(--primary)]"
          >
            Introducing Broker
          </Link>
          <Link
            href="/login"
            className="hover:bg-[var(--primary)] hover:text-white px-4 py-2 rounded-full border border-[var(--primary)] transition text-[var(--primary)]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="group relative inline-block px-4 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-full overflow-hidden"
          >
            <span className="absolute inset-0 bg-[var(--primary)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              Register
            </span>
          </Link>
          <div className="notranslate">
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="lg:hidden flex items-center gap-2 ml-auto">
          <div className="notranslate">
            <LanguageSelector />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="ml-2"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden h-[100vh] bg-[#0b111d] text-sm font-medium px-6 pt-10 space-y-6">
          {navItems.map((item) => (
            <div key={item.title}>
              <div
                className="flex items-center justify-between text-white cursor-pointer"
                onClick={() =>
                  item.dropdown
                    ? setOpenDropdown(
                        openDropdown === item.title ? null : item.title
                      )
                    : null
                }
              >
                {item.dropdown ? (
                  <>
                    <span>{item.title}</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                ) : (
                  <Link href={item.href!} className="hover:text-white">
                    {item.title}
                  </Link>
                )}
              </div>

              {/* Dropdown Items */}
              {item.dropdown && openDropdown === item.title && (
                <div className="ml-4 mt-2 pl-2 border-l border-gray-700 text-gray-300 space-y-1">
                  {item.items?.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block py-1 text-sm hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/ib-broker"
            className="hover:text-white text-[var(--primary)] block"
          >
            Introducing Broker
          </Link>
          <div className="flex gap-5">
            <button
              className="text-[var(--primary)] border border-[var(--primary)] px-3 py-1 rounded-full text-sm hover:bg-[var(--primary)] hover:text-black transition"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
            <button
              className="text-[var(--primary)] border border-[var(--primary)] px-3 py-1 rounded-full text-sm hover:bg-[var(--primary)] hover:text-black transition"
              onClick={() => (window.location.href = "/register")}
            >
              Register
            </button>
          </div>
        </div>
      )}
      <div id="google_translate_element" className="hidden" />
    </nav>
  );
};

export default Navbar;
