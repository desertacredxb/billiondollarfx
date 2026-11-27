import { useEffect, useRef, useState, type FormEvent } from "react";
import api from "../../lib/apiClient";
import { buttonClass, crmApi, crmError, fieldClass, secondaryClass } from "../../lib/crm";

type Receipt = { reference: string; accountNo: number; amount: number; state: "reserved" | "submitting" | "review" | "failed" | "completed" };
type Wallet = { belongsToAgent: boolean; enabled?: boolean; balance?: number; accounts?: number[]; recent?: Receipt[] };

export default function CrmIbCommission({ owner, agent, version }: { owner: boolean; agent: string; version: number }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [sequence, setSequence] = useState(0);
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestId = useRef("");
  const sending = useRef(false);
  const path = owner ? crmApi + "/team/" + agent + "/ib-wallet" : crmApi + "/my-ib";
  useEffect(() => {
    const ctrl = new AbortController();
    api.get<Wallet>(path, { signal: ctrl.signal }).then(({ data }) => {
      if (!ctrl.signal.aborted) { setWallet(data); setError(""); }
    }).catch(e => { if (!ctrl.signal.aborted) { setWallet(null); setError(crmError(e, "IB commission could not be loaded.")); } });
    return () => ctrl.abort();
  }, [path, version, sequence]);
  async function toggle() {
    if (!wallet || busy) return;
    setBusy(true); setError("");
    try { await api.patch(path, { enabled: !wallet.enabled }); setSequence(n => n + 1); }
    catch (err) { setError(crmError(err, "Could not save commission transfer access.")); }
    finally { setBusy(false); }
  }
  const target = account || String(wallet?.accounts?.[0] || "");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending.current) return;
    if (!review) { setReview(true); return; }
    requestId.current ||= crypto.randomUUID();
    sending.current = true;
    setBusy(true); setError("");
    try {
      const { data } = await api.post<Receipt>(path + "/transfers", { accountNo: target, amount, requestId: requestId.current });
      setNotice(data.state === "completed" ? "Commission credited to your trading account." : data.state === "failed" ? "MT5 could not start the transfer. The reserved commission was released." : "Transfer recorded. Check its status below.");
      setReview(false); setAmount(""); requestId.current = "";
    } catch (err) { setError(crmError(err, "Transfer not confirmed. Check the status before retrying.")); }
    finally { sending.current = false; setBusy(false); setSequence(n => n + 1); }
  }
  if ((!wallet || (!owner && !wallet.belongsToAgent)) && !error) return null;
  const unresolved = wallet?.recent?.some(r => r.state !== "completed" && r.state !== "failed");
  const canSubmit = !!wallet?.enabled && !!target && (wallet.balance || 0) >= 75 && !unresolved;
  return <section className="my-4 rounded-lg border border-slate-700 p-3" aria-label="IB commission">
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {owner ? wallet?.belongsToAgent ? <button type="button" className={secondaryClass} disabled={busy} onClick={toggle}>
      {wallet.enabled ? "Disable own commission transfers" : "Enable own commission transfers"}</button> :
      <p className="text-sm">Commission transfers require the agent’s own verified IB email and approved account.</p> :
      wallet?.belongsToAgent && <>
        <h3 className="font-semibold">Available IB commission · USD {(wallet.balance || 0).toFixed(2)}</h3>
        {wallet.enabled && <form className="mt-2 flex flex-wrap items-end gap-3" onSubmit={submit}>
          <label className="text-sm">My live USD account<select className={fieldClass} value={target} disabled={busy || review} onChange={e => { requestId.current = ""; setAccount(e.target.value); }}>
            {!wallet.accounts?.length && <option value="">No eligible account</option>}
            {wallet.accounts?.map(n => <option key={n} value={String(n)}>{n}</option>)}</select></label>
          <label className="text-sm">Amount (USD)<input className={fieldClass} type="number" step="0.01" min="0.01" max={wallet.balance} required
            value={amount} disabled={busy || review} onChange={e => { requestId.current = ""; setAmount(e.target.value); }} /></label>
          <button className={buttonClass} disabled={busy || !canSubmit || !amount}>{review ? "Confirm USD " + amount + " to " + target : "Review transfer"}</button>
          {review && <button className={secondaryClass} type="button" disabled={busy} onClick={() => setReview(false)}>Back</button>}
          <p className="basis-full text-xs text-slate-400">Minimum available commission balance USD 75.</p>
        </form>}
        {notice && <p role="status" className="mt-2 text-sm">{notice}</p>}
        {wallet.recent?.map(r => <p key={r.reference} className="mt-2 text-sm">USD {r.amount.toFixed(2)} → {r.accountNo} · {r.state === "review" ? "Awaiting MT5 reconciliation" : r.state === "completed" ? "Completed" : r.state === "failed" ? "Failed · commission released" : "Processing"} · {r.reference}</p>)}
        {unresolved && <button type="button" onClick={() => setSequence(n => n + 1)} className={secondaryClass}>Refresh transfer status</button>}
      </>}
  </section>;
}
