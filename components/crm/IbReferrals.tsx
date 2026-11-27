import { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { crmApi, crmError, dubaiTime, fieldClass, secondaryClass } from "../../lib/crm";

type Referral = { id: string; name: string; phone: string; email: string; registeredAt: string; verified: boolean; agentName: string };
type ReferralPage = { rows: Referral[]; total: number; limit: number; linkedAgents: number; referralCode?: string };

export default function IbReferrals({ agent, search, owner, team, version }: {
  agent: string; search: string; owner: boolean; team: boolean; version: number;
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReferralPage | null>(null);
  const [code, setCode] = useState("");
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    api.get<ReferralPage>(crmApi + "/leads", { params: { view: "ib_clients", agent, search, page }, signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        const last = Math.max(1, Math.ceil(data.total / data.limit));
        if (page > last) { setPage(last); return; }
        setData(data);
      }).catch(e => { if (!controller.signal.aborted) setError(crmError(e, "IB referrals could not load.")); });
    return () => controller.abort();
  }, [agent, search, page, version, reload]);
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
    <h2 className="text-lg font-semibold">IB referrals{!error && data && <span className="ml-2 text-sm font-normal text-slate-300">{data.total} clients</span>}</h2>
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
      </tr></thead><tbody>{data.rows.map(row => <tr key={row.id} className="border-t border-slate-700">
        <th scope="row" className="p-2">{row.name}</th><td className="p-2">{row.phone}<div>{row.email}</div></td>
        {team && <td className="p-2">{row.agentName}</td>}<td className="p-2">{dubaiTime(row.registeredAt)}</td>
        <td className="p-2">{row.verified ? "Verified" : "Pending verification"}</td>
      </tr>)}</tbody></table></div>}
    {!error && data && data.total > data.limit && <nav aria-label="IB referral pages" className="mt-3 flex items-center gap-2">
      <button type="button" className={secondaryClass} disabled={page <= 1} onClick={() => { setData(null); setPage(page - 1); }}>Previous</button>
      <span>Page {page} of {Math.ceil(data.total / data.limit)}</span>
      <button type="button" className={secondaryClass} disabled={page * data.limit >= data.total} onClick={() => { setData(null); setPage(page + 1); }}>Next</button>
    </nav>}
  </section>;
}
