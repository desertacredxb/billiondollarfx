"use client";

import React from "react";
import Image from "next/image";

export default function WhatsAppButton() {
  const phoneNumber = "447593611999";
  const message = encodeURIComponent("Hello! I visited your website and would like to get in touch.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed z-[9999] bottom-5 right-5 md:bottom-8 md:right-8 flex items-center justify-center bg-white w-12 h-12 md:w-16 md:h-16 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-1 hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:transform-none"
    >
      <div className="relative w-15 h-15 md:w-20 md:h-20">
        <Image
          src="/whatsapp-logo.png"
          alt="WhatsApp Logo"
          fill
          priority
          sizes="(max-width: 768px) 28px, 36px"
          className="object-contain"
        />
      </div>
    </a>
  );
}