"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
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
          elementId: string,
        ) => void;
      };
    };
  }
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const closeMenu = () => { setIsMobileMenuOpen(false); setOpenDropdown(null); };

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
        { label: "Blogs", href: "/blogs" },
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
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
          },
          "google_translate_element",
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsMobileMenuOpen(false); document.getElementById("bdfx-menu-toggle")?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const resize = () => { if (desktop.matches) setIsMobileMenuOpen(false); };
    document.addEventListener("keydown", escape); desktop.addEventListener("change", resize);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", escape); desktop.removeEventListener("change", resize); };
  }, [isMobileMenuOpen]);

  return (
    <nav aria-label="Main navigation" className={`fixed top-0 w-full text-gray-300 font-montserrat transition-colors ${isMobileMenuOpen ? "z-[10020] bg-[#0b111d]" : "z-50"} ${isScrolled ? "bg-[#121E2C]/95 backdrop-blur shadow-lg" : "bg-[#0b111d]/90"}`}>
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-6">
        <Link href="/" onClick={closeMenu} aria-label="BDFX home" className="shrink-0">
          <Image src={logo} alt="BDFX" className="h-auto w-[128px] sm:w-[160px] xl:w-[172px]" />
        </Link>
        <div className="hidden items-center gap-4 text-sm font-medium xl:flex">
          {navItems.map((item, index) => item.dropdown ? (
            <div key={item.title} className="relative" onMouseEnter={() => setOpenDropdown(item.title)} onMouseLeave={() => setOpenDropdown(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenDropdown(null); }}>
              <button type="button" aria-expanded={openDropdown === item.title} aria-controls={`bdfx-desktop-nav-${index}`} onClick={() => setOpenDropdown(openDropdown === item.title ? null : item.title)} className="flex min-h-11 items-center gap-1 whitespace-nowrap hover:text-white">{item.title}<ChevronDown size={14} aria-hidden="true" /></button>
              {openDropdown === item.title && <div id={`bdfx-desktop-nav-${index}`} className="absolute left-0 top-full z-50 w-52 rounded-xl border border-slate-700 bg-[#0d1721] p-2 shadow-xl">
                {item.items?.map(link => <Link key={link.href} href={link.href} onClick={() => setOpenDropdown(null)} className="flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-800 hover:text-[#ffd277]">{link.label}</Link>)}
              </div>}
            </div>
          ) : <Link key={item.title} href={item.href!} className="flex min-h-11 items-center whitespace-nowrap hover:text-white">{item.title}</Link>)}
        </div>
        <div className="hidden shrink-0 items-center gap-3 text-sm font-medium xl:flex">
          <Link href="/ib-broker" className="flex min-h-11 items-center text-[#dfc78f] hover:text-white">Introducing Broker</Link>
          <Link href="/login" className="flex min-h-11 items-center px-2 text-[#dfc78f] hover:text-white">Login</Link>
          <Link href="/register" className="flex min-h-11 items-center rounded-full border border-[#927948] px-4 text-[#dfc78f] hover:bg-[#927948] hover:text-white">Register</Link>
          <div className="notranslate"><LanguageSelector /></div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 xl:hidden">
          <div className="notranslate"><LanguageSelector /></div>
          <button id="bdfx-menu-toggle" type="button" aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMobileMenuOpen} aria-controls="bdfx-mobile-menu" onClick={() => { setIsMobileMenuOpen(value => !value); setOpenDropdown(null); }} className="grid h-11 w-11 place-items-center rounded-xl text-white focus-visible:outline-2 focus-visible:outline-[#ffd277]">
            {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && <div id="bdfx-mobile-menu" className="max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain border-t border-slate-800 bg-[#0b111d] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 text-base font-medium xl:hidden">
        {navItems.map((item, index) => <div key={item.title} className="border-b border-slate-800">
          {item.dropdown ? <button type="button" aria-expanded={openDropdown === item.title} aria-controls={`bdfx-mobile-nav-${index}`} onClick={() => setOpenDropdown(openDropdown === item.title ? null : item.title)} className="flex min-h-12 w-full items-center justify-between py-3 text-left text-white">{item.title}<ChevronDown size={18} className={openDropdown === item.title ? "rotate-180" : ""} aria-hidden="true" /></button> : <Link href={item.href!} onClick={closeMenu} className="flex min-h-12 items-center py-3 text-white">{item.title}</Link>}
          {item.dropdown && openDropdown === item.title && <div id={`bdfx-mobile-nav-${index}`} className="mb-3 border-l border-[#927948] pl-4">
            {item.items?.map(link => <Link key={link.href} href={link.href} onClick={closeMenu} className="flex min-h-11 items-center py-2 text-slate-300 hover:text-[#ffd277]">{link.label}</Link>)}
          </div>}
        </div>)}
        <Link href="/ib-broker" onClick={closeMenu} className="flex min-h-12 items-center py-3 text-[#dfc78f]">Introducing Broker</Link>
        <div className="grid grid-cols-2 gap-3 pb-2 pt-2">
          <Link href="/login" onClick={closeMenu} className="flex min-h-12 items-center justify-center rounded-full border border-[#927948] text-[#dfc78f]">Login</Link>
          <Link href="/register" onClick={closeMenu} className="flex min-h-12 items-center justify-center rounded-full bg-[#d6b659] font-semibold text-[#0b111d]">Register</Link>
        </div>
      </div>}
      <div id="google_translate_element" style={{ width: 0, height: 0, overflow: "hidden", position: "absolute", opacity: 0 }} />
    </nav>
  );
};
export default Navbar;
