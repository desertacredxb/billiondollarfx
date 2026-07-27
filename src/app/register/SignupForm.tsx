"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Logo from "../../../assets/bdfx.gif";
import Button from "../../../components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { countriesData } from "@/data/IsoCode";
import { Eye, EyeOff } from "lucide-react";

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Macau",
  "Madagascar",
  "Malaysia",
  "Maldives",
  "Malta",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "UAE",
  "Uganda",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];


export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agree: false,
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const refCode = searchParams?.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agree)
      return alert("Please accept the terms and conditions.");
    if (formData.password !== formData.confirmPassword)
      return alert("Passwords do not match.");

    // Validate MetaTrader password rules: length 8-16 with character type complexity [cite: 38, 40]
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_\-\+\=\,\.\?])/;
    if (formData.password.length < 8 || formData.password.length > 16) {
      return alert("Password must be between 8 and 16 characters long.");
    }
    if (!passwordRegex.test(formData.password)) {
      return alert(
        "Password must include lowercase, uppercase letters, numbers, and special characters.",
      );
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Something went wrong.");

      alert("OTP sent to email.");
      setStep("otp");
    } catch (error) {
      console.error(error);
      alert("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Calls your updated backend endpoint passing email and otp string tokens
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, otp }),
        },
      );

      const data = await res.json();
      if (!res.ok) return alert(data.message || "OTP verification failed.");

      alert(
        `Registration complete! Your MT5 Account Login ID is: ${data.mt5Login}`,
      );
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handelredirect = () => router.push("/login");

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <Head>
        <title>Sign Up | Billion Dollar FX</title>
      </Head>

      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute w-auto min-w-full min-h-full max-w-none z-0 object-cover"
      >
        <source src="/signup.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 bg-black/30 opacity-85 max-w-3xl w-full mx-4 md:mx-auto rounded-xl p-8 md:p-12 text-white">
        <div className="flex flex-col items-center mb-6">
          <Link href="/">
            <Image
              src={Logo}
              alt="Billion Dollar FX Logo"
              width={400}
              className="mb-4"
            />
          </Link>
          <h1 className="text-2xl font-semibold">Sign Up</h1>
          <p className="text-sm mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00CFFF] cursor-pointer">
              Sign In
            </Link>
          </p>
        </div>

        {step === "form" ? (
          <form
            onSubmit={handleClick}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              name="fullName"
              type="text"
              placeholder="Full Name*"
              className="input"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email*"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number*"
              className="input"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={10}
              minLength={10}
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
            <select
              name="nationality"
              className="input"
              value={formData.nationality}
              onChange={handleChange}
              required
            >
              <option value="">Select Country*</option>
              {countriesData.map((data:any) => (
                <option key={data.country} value={data.country}>
                  {data.country}
                </option>
              ))}
            </select>
            <input
              name="state"
              type="text"
              placeholder="State*"
              className="input"
              value={formData.state}
              onChange={handleChange}
              required
            />
            <input
              name="city"
              type="text"
              placeholder="City*"
              className="input"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <div className="relative">
              <input
                name="password"
                type={passwordFocused || showPassword ? "text" : "password"}
                placeholder="Password*"
                className="input w-full pr-10"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {passwordFocused || showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <input
                name="confirmPassword"
                type={confirmPasswordFocused || showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password*"
                className="input w-full pr-10"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {confirmPasswordFocused || showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              name="referralCode"
              type="text"
              placeholder="Referral Code (if any)"
              className="input md:col-span-2"
              value={formData.referralCode}
              onChange={handleChange}
              readOnly={!!formData.referralCode}
            />
            <div className="md:col-span-2 flex items-start text-sm text-gray-300">
              <input
                name="agree"
                type="checkbox"
                className="mr-2 mt-1"
                checked={formData.agree}
                onChange={handleChange}
              />
              <label>
                I agree to the Billion Dollar FX{" "}
                <Link href="/Privacy-Policy">
                  <span className="text-[var(--primary)] underline cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
                , and{" "}
                <Link href="/Terms&Conditions">
                  <span className="text-[var(--primary)] underline cursor-pointer">
                    Terms and Conditions
                  </span>
                </Link>
                .
              </label>
            </div>
            <button
              type="submit"
              className="md:col-span-2 bg-[var(--primary)] hover:bg-[#f3d089] text-white font-semibold py-2 rounded-full cursor-pointer"
            >
              {loading ? "Processing..." : "SIGN UP"}
            </button>
            <Button
              text="BACK TO LOGIN"
              onClick={handelredirect}
              className="md:col-span-2 border border-white text-white py-2 rounded-full hover:bg-white hover:text-black transition"
            />
          </form>
        ) : (
          <form
            onSubmit={handleOtpSubmit}
            className="grid grid-cols-1 gap-4 max-w-lg mx-auto"
          >
            <p className="text-white text-sm mb-2">
              Enter the OTP sent to your email/phone
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input mb-5"
              required
            />
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-[var(--primary)] hover:bg-[#f3d089] text-white font-semibold py-2 px-4 rounded-full w-fit cursor-pointer"
              >
                {loading ? "Verifying..." : "VERIFY OTP"}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .input {
          background-color: #0f172a;
          border-radius: 0.5rem;
          padding: 0.75rem;
          color: white;
          border: 1px solid #1e293b;
        }
        .input:focus {
          outline: none;
          border-color: #00cfff;
        }
      `}</style>
    </div>
  );
}