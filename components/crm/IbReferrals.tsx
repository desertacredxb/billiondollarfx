import { useEffect, useState } from "react";
import CrmIbCommission from "./CrmIbCommission";
import api from "../../lib/apiClient";
import { crmApi, crmError, dubaiTime, fieldClass, secondaryClass } from "../../lib/crm";

type Activity = { deposits: number; creditedUsd: number; unpricedDeposits: number; withdrawals: number; paid: Record<string, number> };
const amount = new Intl.NumberFormat("en", { maximumFractionDigits: 8 });
function paidText(paid: Activity["paid"]) {
  return Object.entries(paid).sort(([a], [b]) => a.localeCompare(b)).map(([currency, value]) => currency + " " + amount.format(value)).join(" · ") || "—";
}
type Referral = { id: string; name: string; phone: string; email: string; registeredAt: string; verified: boolean; isKycVerified?: boolean; tradingAccounts?: number[]; agentName: string; activity?: Activity };
type ReferralPage = { rows: Referral[]; total: number; limit: number; linkedAgents: number; ownDashboard?: boolean; referralCode?: string; myReferralCode?: string; activity?: Activity & { day: string; newRegistrations: number } };

export default function IbReferrals({ agent, search, owner, team, day, version }: {
  agent: string; search: string; owner: boolean; team: boolean; day: string; version: number;
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReferralPage | null>(null);
  const [code, setCode] = useState("");
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    api.get<ReferralPage>(crmApi + "/leads", { params: { view: "ib_clients", agent, search, page, day }, signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        const last = Math.max(1, Math.ceil(data.total / data.limit));
        if (page > last) { setPage(last); return; }
        setData(data);
      }).catch(e => { if (!controller.signal.aborted) setError(crmError(e, "IB referrals could not load.")); });
    return () => controller.abort();
  }, [agent, search, page, day, version, reload]);
  async function link() {
    setSaving(true);
    setSaveError("");
    try {
      await api.patch(crmApi + "/team/" + agent + "/ib", { code: code.trim() });
      setCode("");
      setReload(current => current + 1);
    } catch (e) { setSaveError(crmError(e, "The IB could not be linked.")); }
    finally { setSaving(false); }
  }
  return <section aria-label="IB referrals" className="my-5 rounded-lg border border-slate-700 p-4">
    <h2 className="text-lg font-semibold">{data?.ownDashboard ? "My IB dashboard" : "IB referrals"}{!error && data && <span className="ml-2 text-sm font-normal text-slate-300">{data.total} {search ? "matching" : "referred"} {data.total === 1 ? "client" : "clients"}</span>}</h2>
    {!error && data?.myReferralCode && <div className="my-3">
      <label className="block text-sm">My referral link<input readOnly className={fieldClass} value={"https://www.billiondollarfx.com/register?ref=" + encodeURIComponent(data.myReferralCode)} /></label>
      <button type="button" className={secondaryClass + " mt-2"} onClick={async () => {
        try { await navigator.clipboard.writeText("https://www.billiondollarfx.com/register?ref=" + encodeURIComponent(data.myReferralCode!)); setCopyState("Copied"); }
        catch { setCopyState("Select and copy the referral link above."); }
      }}>Copy referral link</button>{copyState && <span role="status" className="ml-2 text-sm">{copyState}</span>}
    </div>}
    {!error && !!data?.linkedAgents && (!team || (owner && agent)) && <CrmIbCommission key={agent} owner={owner} agent={agent} version={version + reload} />}
    {!error && data?.activity && data.linkedAgents > 0 && <div className="my-3">
      <h3 className="font-medium">IB activity · {data.activity.day} Dubai</h3>
      <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <span>New verified registrations <strong>{data.activity.newRegistrations}</strong></span>
        <span>Deposit orders <strong>{data.activity.deposits}</strong> · credited USD <strong>{amount.format(data.activity.creditedUsd)}</strong></span>
        <span>Completed withdrawals <strong>{data.activity.withdrawals}</strong> · <strong>{paidText(data.activity.paid)}</strong></span>
      </div>
      <p className="mt-1 text-xs text-slate-400">Payments are grouped by request date. Totals cover all clients in the selected IB scope.</p>
      {data.activity.unpricedDeposits > 0 && <p className="text-xs text-amber-300">{data.activity.unpricedDeposits} successful deposit orders have no recorded USD credit.</p>}
    </div>}
    {owner && agent && data && <form className="my-3 flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); void link(); }}>
      <label className="text-sm">IB referral code{data.referralCode && <span className="ml-2 text-slate-400">Current: {data.referralCode}</span>}
        <input maxLength={100} className={fieldClass} value={code} onChange={e => setCode(e.target.value)} /></label>
      <button className={secondaryClass} disabled={saving || !code.trim()}>{saving ? "Saving…" : "Link IB"}</button>
      {saveError && <p role="alert">{saveError}</p>}
    </form>}
    {error ? <p role="alert">{error}</p> : !data ? <p role="status">Loading IB referrals…</p> :
      !data.linkedAgents ? <p className="mt-2 text-sm text-slate-300">No approved IB linked{agent || !team ? " to this agent" : " to the team"}.</p> :
      !data.rows.length ? <p className="mt-2 text-sm text-slate-300">{search ? "No IB referrals match this search." : "No clients registered under the linked IB accounts yet."}</p> :
      <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-300"><tr>
        <th className="p-2">Client</th><th className="p-2">Contact</th>{team && <th className="p-2">Referring agent</th>}
        <th className="p-2">Registered · Dubai</th><th className="p-2">Registration</th>
        {data.ownDashboard && <><th className="p-2">KYC status</th><th className="p-2">MT5 trading accounts</th></>}
        <th className="p-2">Deposits · USD credit</th><th className="p-2">Completed withdrawals</th>
      </tr></thead><tbody>{data.rows.map(row => <tr key={row.id} className="border-t border-slate-700">
        <th scope="row" className="p-2">{row.name}</th><td className="p-2">{row.phone}<div>{row.email}</div></td>
        {team && <td className="p-2">{row.agentName}</td>}<td className="p-2">{dubaiTime(row.registeredAt)}</td>
        <td className="p-2">{row.verified ? "Verified" : "Pending verification"}</td>
        {data.ownDashboard && <><td className="p-2">{row.isKycVerified ? "Verified" : "Pending"}</td>
          <td className="p-2">{row.tradingAccounts?.join(", ") || "—"}</td></>}
        <td className="p-2">{row.activity ? row.activity.deposits + " · USD " + amount.format(row.activity.creditedUsd) : "—"}</td>
        <td className="p-2">{row.activity ? row.activity.withdrawals + " · " + paidText(row.activity.paid) : "—"}</td>
      </tr>)}</tbody></table></div>}
    {!error && data && data.total > data.limit && <nav aria-label="IB referral pages" className="mt-3 flex items-center gap-2">
      <button type="button" className={secondaryClass} disabled={page <= 1} onClick={() => { setData(null); setPage(page - 1); }}>Previous</button>
      <span>Page {page} of {Math.ceil(data.total / data.limit)}</span>
      <button type="button" className={secondaryClass} disabled={page * data.limit >= data.total} onClick={() => { setData(null); setPage(page + 1); }}>Next</button>
    </nav>}
  </section>;
}
