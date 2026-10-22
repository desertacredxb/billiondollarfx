"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "../lib/apiClient";
import { useUserProfile } from "../lib/userStore";

type Connection = { id: string; fullName: string; createdAt: string; isKycVerified: boolean; accounts: { accountNo: number }[] };
type Report = { referralCode: string; connections: Connection[]; page: number; limit: number; total: number };

export default function IBPage({ user }: { user: { email: string; isApprovedIB?: boolean } }) {
  const { profile, accounts, refresh } = useUserProfile();
  const [report, setReport] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const balance = Number(profile?.commission || 0);
  const referralUrl = report?.referralCode ? `https://www.billiondollarfx.com/register?ref=${encodeURIComponent(report.referralCode)}` : "";

  useEffect(() => {
    const abort = new AbortController();
    setBusy(true);
    setError("");
    api.get<Report>(`${process.env.NEXT_PUBLIC_API_BASE}/api/ib/connections`, { params: { page, limit: 25 }, signal: abort.signal })
      .then(response => setReport(response.data))
      .catch(error => { if (!abort.signal.aborted) setError(error.response?.data?.message || "Unable to load your referrals. Please try again."); })
      .finally(() => { if (!abort.signal.aborted) setBusy(false); });
    return () => abort.abort();
  }, [page, user.email]);

  async function copyReferral() {
    if (!referralUrl) return;
    try { await navigator.clipboard.writeText(referralUrl); setCopied(true); }
    catch { setMessage("Copy the referral link from the field above."); }
  }

  async function withdraw(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/ib/withdrawalIBamountV2`, {
        email: user.email, accountno: accountNo || String(accounts[0]?.accountNo || ""), amount: Number(amount),
      });
      setMessage(response.data.message || "Commission transferred to your trading account.");
      setWithdrawOpen(false);
      setAmount("");
      refresh();
    } catch (error) {
      setMessage(api.isAxiosError(error) ? error.response?.data?.message || "Unable to transfer commission. Please try again." : "Unable to transfer commission.");
    } finally { setSubmitting(false); }
  }

  const panel = "rounded-xl border border-white/10 bg-[#101827] p-5";
  const input = "mt-2 w-full rounded-lg border border-slate-600 bg-[#060b14] p-3";
  const button = "rounded-lg bg-[#ffd700] px-5 py-3 text-black font-semibold disabled:opacity-40";
  return <div className="mx-auto max-w-6xl text-white space-y-7">
    <div><p className="text-[#ffd700] text-sm font-medium">BDFX Partners</p><h1 className="mt-2 text-3xl font-semibold">Your IB dashboard</h1></div>
    <section className="grid gap-4 md:grid-cols-3">
      <div className={panel}><p className="text-slate-300">Referred clients</p><p className="mt-2 text-3xl">{report ? report.total : "—"}</p></div>
      <div className={panel}><p className="text-slate-300">Available commission</p><p className="mt-2 text-3xl">{profile ? `$${balance.toFixed(2)}` : "—"}</p></div>
      <div className={panel}><p className="text-slate-300">Commission transfer</p><button onClick={() => setWithdrawOpen(true)} disabled={!profile || balance < 75 || !accounts.length} className={`${button} mt-3`}>Transfer to my trading account</button><p className="mt-2 text-xs text-slate-400">Minimum available commission: $75.</p></div>
    </section>
    <section className={panel}>
      <label htmlFor="ib-referral-link" className="block text-lg font-medium">Your referral link</label>
      <div className="mt-3 flex flex-col sm:flex-row gap-3"><input id="ib-referral-link" readOnly value={referralUrl} placeholder="Loading your referral link…" className={`${input} min-w-0 flex-1 text-sm`} /><button onClick={copyReferral} disabled={!referralUrl} className={button}>{copied ? "Copied" : "Copy link"}</button></div>
    </section>
    {message && <p role="status" className="rounded-lg border border-white/15 p-4">{message}</p>}
    <section className={panel}>
      <h2 className="text-xl font-semibold">Your referred clients</h2>
      {error ? <p role="alert" className="mt-4 text-red-300">{error}</p> : busy ? <p role="status" className="mt-4 text-slate-300">Loading referrals…</p> : !report?.connections.length ? <p className="mt-4 text-slate-300">No referred clients yet. Share your referral link to get started.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-300"><tr><th className="p-3">Client</th><th className="p-3">Verification</th><th className="p-3">Trading accounts</th><th className="p-3">Registered</th></tr></thead><tbody>{report.connections.map(client => <tr key={client.id} className="border-t border-white/10"><td className="p-3">{client.fullName}</td><td className="p-3">{client.isKycVerified ? "Verified" : "Pending"}</td><td className="p-3">{client.accounts.map(account => account.accountNo).join(", ") || "—"}</td><td className="p-3 whitespace-nowrap">{new Date(client.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
      {report && report.total > report.limit && <nav aria-label="Referral pages" className="mt-4 flex items-center justify-between gap-3"><button disabled={page === 1 || busy} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-slate-600 px-4 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {Math.ceil(report.total / report.limit)}</span><button disabled={page * report.limit >= report.total || busy} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-slate-600 px-4 py-2 disabled:opacity-40">Next</button></nav>}
    </section>
    {withdrawOpen && <section className={panel} aria-labelledby="commission-transfer-title"><h2 id="commission-transfer-title" className="text-xl font-semibold">Transfer commission</h2><form onSubmit={withdraw} className="mt-4 space-y-4"><label className="block">Trading account<select required value={accountNo || String(accounts[0]?.accountNo || "")} onChange={event => setAccountNo(event.target.value)} className={input}>{accounts.map(account => <option key={account.accountNo} value={account.accountNo}>{account.accountNo} · {account.currency}</option>)}</select></label><label className="block">Amount (USD)<input required type="number" min="0.01" max={balance} step="0.01" value={amount} onChange={event => setAmount(event.target.value)} className={input} /></label><div className="flex gap-3"><button type="submit" disabled={submitting} className={button}>{submitting ? "Processing…" : "Confirm transfer"}</button><button type="button" disabled={submitting} onClick={() => setWithdrawOpen(false)} className="rounded-lg border border-slate-600 px-5 py-3">Cancel</button></div></form></section>}
  </div>;
}
