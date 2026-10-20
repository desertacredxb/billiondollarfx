"use client";

import { adminHome } from "../../../lib/adminAccess";
import { authenticatedFetch } from "../../../lib/apiClient";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [setup, setSetup] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const verifying = !!challengeId;
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/admin/${verifying ? "verify-code" : "request-code"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifying ? { challengeId, code, newPassword } : { email, password, resetPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to sign in. Please try again.");
      if (!verifying) {
        setChallengeId(data.challengeId);
        setSetup(data.requiresPasswordSetup);
        setMessage(data.message);
      } else {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        document.cookie = `adminToken=${data.token}; Path=/; Max-Age=7200; SameSite=Strict;${location.protocol === "https:" ? " Secure;" : ""}`;
        router.replace(adminHome(data.user));
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#060b14] text-white flex items-center justify-center px-5 py-12">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/15 bg-[#101827] p-7 space-y-5">
      <Link href="/" className="text-[#ffd700] font-semibold">Billion Dollar FX</Link>
      <h1 className="text-2xl font-semibold">Administrator sign in</h1>
      <p className="text-sm text-slate-300">{challengeId ? "Enter the six-digit code sent to your authorized email address. It expires in five minutes." : "Use your authorized administrator email. First-time setup and password recovery are confirmed by email."}</p>
      {!challengeId ? <>
        <label className="block">Email<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-[#060b14] p-3" /></label>
        {!resetPassword && <label className="block">Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-[#060b14] p-3" /><span className="block mt-2 text-xs text-slate-400">Leave this blank for first-time setup.</span></label>}
        <button type="button" onClick={() => { setResetPassword(!resetPassword); setMessage(""); }} className="text-sm text-[#ffd700] underline">{resetPassword ? "Back to sign in" : "Set up or reset administrator password"}</button>
      </> : <>
        <label className="block">Sign-in code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} className="mt-2 w-full rounded-lg border border-slate-600 bg-[#060b14] p-3 tracking-widest" /></label>
        {setup && <label className="block">New administrator password<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-[#060b14] p-3" /><span className="block mt-2 text-xs text-slate-400">Use at least 12 characters.</span></label>}
        <button type="button" onClick={() => { setChallengeId(""); setCode(""); setMessage(""); }} className="text-sm text-[#ffd700] underline">Request a new code</button>
      </>}
      {message && <p role="status" aria-live="polite" className="text-sm text-slate-200">{message}</p>}
      <button disabled={busy} type="submit" className="w-full rounded-lg bg-[#ffd700] px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Please wait…" : challengeId ? "Verify and sign in" : "Send sign-in code"}</button>
      <Link href="/login" className="block text-center text-sm text-slate-300 underline">Client sign in</Link>
    </form>
  </main>;
}
