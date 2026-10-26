"use client";
import React, { useEffect, useState } from "react";

const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState<string>("en");

  // Sync state with active google translation cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const cookieVal = getCookie("googtrans");
    if (cookieVal) {
      const langCode = cookieVal.split("/").pop();
      if (langCode && langCode !== "en") {
        setCurrentLang(langCode);
      } else {
        setCurrentLang("en");
      }
    } else {
      setCurrentLang("en");
    }
  }, []);

  const clearGoogleTranslateCookies = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    // Generate all domain level variations (.billiondollarfx.com, billiondollarfx.com, localhost)
    const domains = [
      "",
      hostname,
      `.${hostname}`,
      parts.length > 1 ? `.${parts.slice(-2).join(".")}` : "",
      parts.length > 1 ? parts.slice(-2).join(".") : "",
    ];

    const paths = ["/", "/en", "/en/"];

    // Wipe googtrans across all path & domain combinations
    domains.forEach((d) => {
      paths.forEach((p) => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p};${d ? ` domain=${d};` : ""}`;
      });
    });

    // Reset hash if present
    if (window.location.hash.includes("googtrans")) {
      window.location.hash = "";
    }
  };

  const setGoogleTranslateCookie = (langCode: string) => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const baseDomain =
      parts.length > 1 ? `.${parts.slice(-2).join(".")}` : hostname;

    const cookieValue = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${hostname};`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${baseDomain};`;
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    if (!selectedLang) return;

    setCurrentLang(selectedLang);

    if (selectedLang === "en") {
      // 1. Wipe all Google translate cookies across domains
      clearGoogleTranslateCookies();

      // 2. Reset hidden Google Translate widget dropdown if present
      const combo = document.querySelector(
        ".goog-te-combo",
      ) as HTMLSelectElement | null;
      if (combo) {
        combo.value = "";
        combo.dispatchEvent(new Event("change"));
      }

      // 3. Reload window to restore original English DOM state cleanly
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // Handle switching to non-English languages
    setGoogleTranslateCookie(selectedLang);
    const combo = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement | null;
    if (combo) {
      combo.value = selectedLang;
      combo.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  return (
    <select
      aria-label="Website language"
      onChange={handleLanguageChange}
      value={currentLang}
      className="language-selector bg-slate-900/80 text-white border border-white/20 hover:border-white/40 min-h-11 w-[96px] text-base py-2 px-2 xl:w-[110px] rounded-full cursor-pointer outline-none transition"
    >
      <option value="" disabled>
        Language
      </option>
      <option value="en" className="bg-[#0d1721] text-white">
        English
      </option>
      <option value="ar" className="bg-[#0d1721] text-white">
        Arabic
      </option>
      <option value="fr" className="bg-[#0d1721] text-white">
        French
      </option>
      <option value="de" className="bg-[#0d1721] text-white">
        German
      </option>
      <option value="hi" className="bg-[#0d1721] text-white">
        Hindi
      </option>
      <option value="zh-CN" className="bg-[#0d1721] text-white">
        Chinese (Simplified)
      </option>
      <option value="zh-TW" className="bg-[#0d1721] text-white">
        Chinese (Traditional)
      </option>
      <option value="ja" className="bg-[#0d1721] text-white">
        Japanese
      </option>
      <option value="es" className="bg-[#0d1721] text-white">
        Spanish
      </option>
      <option value="it" className="bg-[#0d1721] text-white">
        Italian
      </option>
      <option value="pt" className="bg-[#0d1721] text-white">
        Portuguese
      </option>
      <option value="tl" className="bg-[#0d1721] text-white">
        Filipino
      </option>
      <option value="ru" className="bg-[#0d1721] text-white">
        Russian
      </option>
      <option value="ko" className="bg-[#0d1721] text-white">
        Korean
      </option>
      <option value="tr" className="bg-[#0d1721] text-white">
        Turkish
      </option>
      <option value="bn" className="bg-[#0d1721] text-white">
        Bengali
      </option>
      <option value="ta" className="bg-[#0d1721] text-white">
        Tamil
      </option>
      <option value="te" className="bg-[#0d1721] text-white">
        Telugu
      </option>
      <option value="mr" className="bg-[#0d1721] text-white">
        Marathi
      </option>
      <option value="gu" className="bg-[#0d1721] text-white">
        Gujarati
      </option>
      <option value="pa" className="bg-[#0d1721] text-white">
        Punjabi
      </option>
      <option value="nl" className="bg-[#0d1721] text-white">
        Dutch
      </option>
      <option value="pl" className="bg-[#0d1721] text-white">
        Polish
      </option>
      <option value="uk" className="bg-[#0d1721] text-white">
        Ukrainian
      </option>
      <option value="fa" className="bg-[#0d1721] text-white">
        Persian
      </option>
      <option value="vi" className="bg-[#0d1721] text-white">
        Vietnamese
      </option>
      <option value="th" className="bg-[#0d1721] text-white">
        Thai
      </option>
      <option value="sw" className="bg-[#0d1721] text-white">
        Swahili
      </option>
      <option value="ro" className="bg-[#0d1721] text-white">
        Romanian
      </option>
      <option value="cs" className="bg-[#0d1721] text-white">
        Czech
      </option>
      <option value="sv" className="bg-[#0d1721] text-white">
        Swedish
      </option>
      <option value="no" className="bg-[#0d1721] text-white">
        Norwegian
      </option>
      <option value="fi" className="bg-[#0d1721] text-white">
        Finnish
      </option>
      <option value="el" className="bg-[#0d1721] text-white">
        Greek
      </option>
      <option value="he" className="bg-[#0d1721] text-white">
        Hebrew
      </option>
      <option value="id" className="bg-[#0d1721] text-white">
        Indonesian
      </option>
      <option value="ms" className="bg-[#0d1721] text-white">
        Malay
      </option>
      <option value="ur" className="bg-[#0d1721] text-white">
        Urdu
      </option>
      <option value="am" className="bg-[#0d1721] text-white">
        Amharic
      </option>
      <option value="ha" className="bg-[#0d1721] text-white">
        Hausa
      </option>
      <option value="my" className="bg-[#0d1721] text-white">
        Burmese
      </option>
      <option value="ig" className="bg-[#0d1721] text-white">
        Igbo
      </option>
      <option value="om" className="bg-[#0d1721] text-white">
        Oromo
      </option>
      <option value="so" className="bg-[#0d1721] text-white">
        Somali
      </option>
      <option value="yo" className="bg-[#0d1721] text-white">
        Yoruba
      </option>
      <option value="ff" className="bg-[#0d1721] text-white">
        Fulani
      </option>
    </select>
  );
};

export default LanguageSelector;
