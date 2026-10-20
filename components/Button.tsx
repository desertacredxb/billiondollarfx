"use client";

import { ReactNode } from "react";

interface ButtonProps {
  text: string | ReactNode; // ⬅️ change from string to string | ReactNode
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({ text, onClick, className = "", disabled = false, type = "submit" }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`bg-gradient-to-r from-[#665323] to-[#43340c] hover:from-[#43340c] hover:to-[#665323] text-white text-sm font-semibold cursor-pointer px-4 py-2 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd700] ${className} border border-[#927948]`}
    >
      {text}
    </button>
  );
}
