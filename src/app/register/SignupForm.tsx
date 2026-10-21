"use client";
import { trackConversion } from "../../../lib/analytics";
import MarketingVideo from "../../../components/MarketingVideo";

import { authenticatedFetch } from "../../../lib/apiClient";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Logo from "../../../assets/bdfx.gif";
import Button from "../../../components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { countriesData } from "@/data/IsoCode";
import { Eye, EyeOff } from "lucide-react";

// Production onboarding collects the details required by the backend's Veriff policy.
// The backend remains authoritative for enrollment and every approval decision.
const automaticKyc = process.env.NEXT_PUBLIC_VERIFF_ENABLED !== "false";
const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "https://billion-doller-backend.onrender.com").replace(/\/+$/, "");
type RegistrationOptions = { mobileOtpRequired: boolean; registrationAvailable: boolean };

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "", // Store active country calling code (e.g., "+93")
    phone: "",
    nationality: "",
    residenceCountry: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agree: false,
    whatsappOtpConsent: false,
    marketingConsent: false,
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "email" | "mobile">("form");
  const [registrationOptions, setRegistrationOptions] = useState<RegistrationOptions | null>(null);
  const [optionsError, setOptionsError] = useState(false);
  const [registrationToken, setRegistrationToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadOptions = useCallback(async (signal?: AbortSignal) => {
    setOptionsError(false);
    try {
      const response = await fetch(`${apiBase}/api/auth/registration-options`, { cache: "no-store", signal });
      // Allows the frontend to be released before the matching backend.
      if (response.status === 404) { setRegistrationOptions({ mobileOtpRequired: false, registrationAvailable: true }); return; }
      if (!response.ok) throw new Error("Unavailable");
      const data = await response.json();
      setRegistrationOptions({ mobileOtpRequired: data.mobileOtpRequired === true, registrationAvailable: data.registrationAvailable === true });
    } catch { if (!signal?.aborted) setOptionsError(true); }
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    void loadOptions(abort.signal);
    return () => abort.abort();
  }, [loadOptions]);
  const cooldownActive = resendCooldown > 0;
  useEffect(() => {
    if (!cooldownActive) return;
    const interval = setInterval(() => setResendCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(interval);
  }, [cooldownActive]);

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
    if (submitLock.current) return;
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "nationality") {
      // Find matching country code from countriesData when user selects country
      const selectedCountry = countriesData.find(
        (c: any) => c.country === value,
      );
      const code = selectedCountry ? `+${selectedCountry.code}` : "";

      setFormData((prev) => ({
        ...prev,
        nationality: value,
        countryCode: code,
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
    if (submitLock.current) return;
    setFeedback(null);

    if (!registrationOptions?.registrationAvailable) return setFeedback({ success: false, text: "Registration is temporarily unavailable. Please try again shortly." });
    if (registrationOptions.mobileOtpRequired && !formData.whatsappOtpConsent) return setFeedback({ success: false, text: "Please agree to receive your verification code on WhatsApp." });

    if (!formData.agree)
      return setFeedback({ success: false, text: "Please accept the terms and conditions." });
    if (formData.password !== formData.confirmPassword)
      return setFeedback({ success: false, text: "Passwords do not match." });
    if (automaticKyc && !formData.residenceCountry) return setFeedback({ success: false, text: "Please select your country of residence." });
    if (automaticKyc && [formData.nationality, formData.residenceCountry].some(value =>
      ["AE", "ARE", "UAE", "UNITEDARABEMIRATES"].includes(value.toUpperCase().replace(/[^A-Z]/g, "")))) {
      return setFeedback({ success: false, text: "We don't accept UAE clients." });
    }

    // Validate MetaTrader password rules: length 8-16 with character type complexity
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_\-\+\=\,\.\?])/;
    if (formData.password.length < 8 || formData.password.length > 16) {
      return setFeedback({ success: false, text: "Password must be between 8 and 16 characters long." });
    }
    if (!passwordRegex.test(formData.password)) {
      return setFeedback({ success: false, text: "Password must include lowercase, uppercase letters, numbers, and special characters." });
    }

    // Combine countryCode with raw phone number before submitting
    const fullPhoneNumber = `${formData.countryCode} ${formData.phone}`.trim();

    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      phone: fullPhoneNumber, // Send full phone number including country code
    };

    try {
      submitLock.current = true;
      setLoading(true);
      const res = await authenticatedFetch(
        `${apiBase}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) return setFeedback({ success: false, text: data.message || "Unable to register. Please try again." });

      setRegistrationToken(typeof data.registrationToken === "string" ? data.registrationToken : "");
      setMaskedPhone(data.maskedPhone || "");
      setFormData(current => ({ ...current, email: payload.email, password: "", confirmPassword: "" }));
      setResendCooldown(60);
      setFeedback({ success: data.emailSent !== false, text: data.emailSent === false ? data.message : "A verification code has been sent to your email. Check Inbox and Spam, and use the newest code." });
      setStep("email");
    } catch (error) {
      console.error(error);
      setFeedback({ success: false, text: "Unable to register. Please check your connection and try again. Your details have been kept." });
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLock.current) return;
    setFeedback(null);

    try {
      submitLock.current = true;
      setLoading(true);
      const res = await authenticatedFetch(
        `${apiBase}/api/auth/${step === "mobile" ? "registration/verify-mobile" : "verify-otp"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, otp, ...(registrationToken ? { registrationToken } : {}) }),
        },
      );

      const data = await res.json();
      if (!res.ok) return setFeedback({ success: false, text: data.message || "The code could not be verified. Check the newest code and try again." });

      if (data.mobileRequired === true && !data.token) {
        setStep("mobile");
        setOtp("");
        setMaskedPhone(data.maskedPhone || maskedPhone);
        setResendCooldown(data.retryAfterSeconds || 60);
        setFeedback({ success: data.phoneSent === true, text: data.message || "Email verified. Enter your WhatsApp verification code." });
        return;
      }
      if (typeof data.token !== "string" || !data.token) return setFeedback({ success: false, text: "Verification is not complete. Please try again." });

      trackConversion("sign_up");
      setRegistrationToken("");
      setOtp("");

      if (data.kycRequired) {
        localStorage.setItem("bdfx_onboarding_intent", searchParams?.get("intent") === "ib" ? "ib" : "client");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ ...data.user, kycProvider: "veriff" }));
        document.cookie = `token=${data.token}; Path=/; SameSite=Lax;${location.protocol === "https:" ? " Secure;" : ""}`;
        router.push("/verify-identity");
      } else {
        setFeedback({ success: true, text: "Registration complete. Opening sign in…" });
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      setFeedback({ success: false, text: "Unable to verify the code. Check your connection and try again." });
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (submitLock.current || resendCooldown || !registrationToken) return;
    submitLock.current = true;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${apiBase}/api/auth/registration/${step === "mobile" ? "send-mobile" : "resend-email"}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationToken }),
      });
      const data = await response.json();
      setResendCooldown(data.retryAfterSeconds || 60);
      setFeedback({ success: response.ok, text: data.message || "Please use the newest verification code." });
    } catch {
      setResendCooldown(60);
      setFeedback({ success: false, text: "Unable to resend the code. Please check your connection and try again." });
    } finally { submitLock.current = false; setLoading(false); }
  };

  const handelredirect = () => router.push("/login");

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <Head>
        <title>Sign Up | Billion Dollar FX</title>
      </Head>

      <MarketingVideo src="/media/signup.mp4" poster="/media/signup-poster.jpg" className="absolute inset-0 h-full w-full object-cover z-0" />

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

        {feedback && <p role={feedback.success ? "status" : "alert"} className={`mb-5 rounded-lg border p-4 text-sm ${feedback.success ? "border-emerald-500 text-emerald-100" : "border-red-400 text-red-100"}`}>{feedback.text}</p>}
        {step === "form" && optionsError && <p role="alert" className="mb-4 text-sm">Registration could not be loaded. <button type="button" onClick={() => void loadOptions()} className="underline">Try again</button></p>}
        {step === "form" && registrationOptions?.registrationAvailable === false && <p role="alert" className="mb-4 text-sm">New registration is temporarily unavailable. Please try again shortly.</p>}
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

            <select
              name="nationality"
              className="input"
              value={formData.nationality}
              onChange={handleChange}
              required
            >
              <option value="">{automaticKyc ? "Select Nationality*" : "Select Country*"}</option>
              {countriesData.map((data: any) => (
                <option key={data.country} value={data.country}>
                  {data.country} (+{data.code})
                </option>
              ))}
            </select>

            {automaticKyc && <select name="residenceCountry" aria-label="Country of residence" className="input"
              value={formData.residenceCountry} onChange={handleChange} required>
              <option value="">Country of Residence*</option>
              {countriesData.map(data => <option key={data.country} value={data.country}>{data.country}</option>)}
            </select>}

            {/* In-place Country Code prefix container */}
            {/* <div className="relative flex items-center">
              {formData.countryCode && (
                <span className="absolute left-3 text-gray-400 text-sm font-medium select-none pointer-events-none">
                  {formData.countryCode}
                </span>
              )}
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number*"
                className={`input pl-32 w-full ${formData.countryCode ? "pl-16" : ""}`}
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={10}
                minLength={10}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </div> */}

            <div className="flex items-center rounded-lg bg-[#0f172a] border border-[#1e293b] focus-within:border-[#00cfff] overflow-hidden">
              {automaticKyc ? <select name="countryCode" aria-label="Mobile country calling code" value={formData.countryCode}
                onChange={handleChange} required className="max-w-40 bg-[#1e293b] px-2 py-3 text-sm text-gray-300">
                <option value="">Calling code</option>
                {countriesData.map(data => <option key={data.country} value={`+${data.code}`}>{data.country} (+{data.code})</option>)}
              </select> : formData.countryCode && (
                <span className="px-3 py-3 bg-[#1e293b] text-gray-300 font-medium text-sm select-none border-r border-[#334155]">
                  {formData.countryCode}
                </span>
              )}
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number*"
                className="w-full bg-transparent p-3 text-white focus:outline-none"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={automaticKyc ? 14 : 10}
                minLength={automaticKyc ? 4 : 10}
                pattern={automaticKyc ? "[0-9]{4,14}" : "[0-9]{10}"}
                title={automaticKyc ? "Enter your mobile number without the country code" : "Please enter a valid 10-digit phone number"}
              />
            </div>

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
                {passwordFocused || showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                name="confirmPassword"
                type={
                  confirmPasswordFocused || showConfirmPassword
                    ? "text"
                    : "password"
                }
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
                {confirmPasswordFocused || showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
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
            <label className="flex items-start gap-3 text-sm text-gray-300">
              <input type="checkbox" name="marketingConsent" checked={formData.marketingConsent} onChange={handleChange} className="mt-1" />
              <span>Email me BDFX educational updates and offers. Optional; unsubscribe anytime in Settings or an email.</span>
            </label>
            {registrationOptions?.mobileOtpRequired && <label className="md:col-span-2 flex items-start gap-2 text-sm text-gray-300">
              <input type="checkbox" name="whatsappOtpConsent" checked={formData.whatsappOtpConsent} onChange={handleChange} required className="mt-1" />
              <span>Send my mobile verification code on WhatsApp. This verifies my number and does not subscribe me to marketing.</span>
            </label>}
            <button
              type="submit"
              disabled={loading || !registrationOptions?.registrationAvailable || optionsError}
              className="md:col-span-2 bg-[var(--primary)] hover:bg-[#f3d089] text-white font-semibold py-2 rounded-full cursor-pointer"
            >
              {loading ? "Processing..." : !registrationOptions && !optionsError ? "Loading..." : "SIGN UP"}
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
              {step === "mobile" ? `Email verified. Enter the newest WhatsApp code sent to ${maskedPhone || "your registered mobile number"}.` : "Enter the newest verification code sent to your email."}
            </p>
            <input
              type="text"
              aria-label={step === "mobile" ? "WhatsApp verification code" : "Email verification code"}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder={step === "mobile" ? "WhatsApp OTP" : "Email OTP"}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="input mb-5"
              required
            />
            <div className="flex justify-center">
              <button
                type="submit"
              disabled={loading}
                className="bg-[var(--primary)] hover:bg-[#f3d089] text-white font-semibold py-2 px-4 rounded-full w-fit cursor-pointer"
              >
                {loading ? "Verifying..." : step === "mobile" ? "VERIFY MOBILE" : "VERIFY EMAIL"}
              </button>
            </div>
            {registrationToken && <button type="button" onClick={resendCode} disabled={loading || resendCooldown > 0} className="text-sm text-[#e3c569] underline disabled:opacity-50">
              {resendCooldown ? `Resend code in ${resendCooldown}s` : `Resend ${step === "mobile" ? "WhatsApp" : "email"} code`}
            </button>}
            <p className="text-xs text-gray-300">Each code expires in 5 minutes. Complete registration within 15 minutes and never share your codes.</p>
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
