"use client";
import React from "react";

const LanguageSelector = () => {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    if (!selectedLang) return;

    if (selectedLang === "en") {
      // 🔹 Clear cookie to reset back to original English
      document.cookie =
        "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      window.location.hash = "";
      window.location.reload();
      return;
    }

    // 1️⃣ Set the cookie that Google Translate reads:
    document.cookie = `googtrans=/en/${selectedLang};path=/`;

    // 2️⃣ Optionally set URL hash
    window.location.hash = `#googtrans=en/${selectedLang}`;

    // 3️⃣ Click the matching language anchor in the iframe
    const intervalId = setInterval(() => {
      const iframe = document.querySelector(
        "iframe.goog-te-menu-frame"
      ) as HTMLIFrameElement;
      if (!iframe) return;

      const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!innerDoc) return;

      const anchors = Array.from(
        innerDoc.querySelectorAll("a.goog-te-menu2-item")
      );
      const match = anchors.find((a) =>
        a.getAttribute("href")?.includes(`#${selectedLang}`)
      );
      if (match) {
        (match as HTMLElement).click();
        clearInterval(intervalId);
      }
    }, 300);

    setTimeout(() => clearInterval(intervalId), 5000);

    // 4️⃣ Force reload so translation applies everywhere
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <select
      onChange={handleLanguageChange}
      className="language-selector bg-transparent  text-black  border border-white w-fit  p-2  rounded-full"
      defaultValue=""
    >
      <option value="" disabled>
        Language
      </option>
      <option value="en">English</option>
      <option value="ar">Arabic</option>
      <option value="fr">French</option>
      <option value="de">German</option>
      <option value="hi">Hindi</option>
      <option value="zh-CN">Chinese (Simplified)</option>
      <option value="zh-TW">Chinese (Traditional)</option>
      <option value="ja">Japanese</option>
      <option value="es">Spanish</option>
      <option value="it">Italian</option>
      <option value="pt">Portuguese</option>
      <option value="tl">Filipino (Philippines)</option>
      <option value="ru">Russian</option>
      <option value="ko">Korean</option>
      <option value="tr">Turkish</option>
      <option value="bn">Bengali</option>
      <option value="ta">Tamil</option>
      <option value="te">Telugu</option>
      <option value="mr">Marathi</option>
      <option value="gu">Gujarati</option>
      <option value="pa">Punjabi</option>
      <option value="nl">Dutch</option>
      <option value="pl">Polish</option>
      <option value="uk">Ukrainian</option>
      <option value="fa">Persian (Farsi)</option>
      <option value="vi">Vietnamese</option>
      <option value="th">Thai</option>
      <option value="sw">Swahili</option>
      <option value="ro">Romanian</option>
      <option value="cs">Czech</option>
      <option value="sv">Swedish</option>
      <option value="no">Norwegian</option>
      <option value="fi">Finnish</option>
      <option value="el">Greek</option>
      <option value="he">Hebrew</option>
      <option value="id">Indonesian</option>
      <option value="ms">Malay</option>
      <option value="ur">Urdu</option>
      <option value="am">Amharic</option>
      <option value="ha">Hausa</option>
      <option value="my">Burmese</option>
      <option value="ig">Igbo</option>
      <option value="om">Oromo</option>
      <option value="so">Somali</option>
      <option value="yo">Yoruba</option>
      <option value="ff">Fulani</option>
    </select>
  );
};

export default LanguageSelector;
