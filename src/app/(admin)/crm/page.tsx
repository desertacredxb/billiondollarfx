"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Phone, RefreshCw, Upload } from "lucide-react";
import api from "../../../../lib/apiClient";
import { useAdminSession } from "../../../../lib/adminSession";
import LeadDetails from "../../../../components/crm/LeadDetails";
import DialPad from "../../../../components/crm/DialPad";
import CallAssistant from "../../../../components/crm/CallAssistant";
import { importBatches, readCrmFile } from "../../../../lib/crmImport";
import {
  buttonClass, cardClass, crmApi, crmError, dubaiDate, dubaiTime, fieldClass,
  LEAD_LISTS, secondaryClass, STATUS_LABELS, type Agent, type Lead, type LeadPage, type Overview,
} from "../../../../lib/crm";

type LeadList = keyof typeof LEAD_LISTS;
type View = "queue" | "leads" | "clients";
type ImportResult = { imported: number; duplicates: number; rejected: { row: number; reason: string }[] };
type HashmiImportResult = { added: number; updated: number; existing: number; leadsAdded: number; skipped: number; rejected: { row: number; reason: string }[] };
type ImportSummary = { leads: number; calls: number; duplicates: number; rejected: { row: number; reason: string; area: string }[];
  hashmi?: { updated: number; skipped: number } };
const blank: LeadPage = { rows: [], total: 0, page: 1, limit: 50 };
const number = new Intl.NumberFormat("en-GB");

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className={cardClass}><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">{value}</p></div>;
}

function AgentRow({ agent, target, editable, onSave }: { agent: Agent; target: number; editable: boolean; onSave: () => void }) {
  const [hashmiId, setHashmiId] = useState(agent.hashmiId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      await api.patch(crmApi + "/team/" + agent.id + "/hashmi", { hashmiId: hashmiId.trim() });
      onSave();
    } catch (error) { setError(crmError(error, "Mapping could not be saved.")); }
    finally { setBusy(false); }
  }
  return <tr className="border-t border-slate-700">
    <th scope="row" className="px-3 py-3 text-left font-medium">{agent.name}</th>
    <td className="px-3 py-3 tabular-nums">{agent.ready}</td>
    <td className="px-3 py-3 tabular-nums">{agent.logged}</td>
    <td className="px-3 py-3 tabular-nums">{agent.verified} / {target}</td>
    <td className="px-3 py-3 tabular-nums">{Math.max(0, target - agent.verified)}</td>
    <td className="px-3 py-3 tabular-nums">{agent.connected}</td>
    <td className="px-3 py-3 tabular-nums">{Math.floor(agent.talkSeconds / 60)}m {agent.talkSeconds % 60}s</td>
    <td className="px-3 py-3 tabular-nums">{agent.overdue ?? 0}</td>
    <td className="px-3 py-3">
      <p>{(agent.dialerMapped ?? Boolean(agent.hashmiId)) ? "Dialer mapped" : "Dialer setup pending"}</p>
      <p className="text-xs text-slate-300">{agent.lastActivityAt ? "Last CRM activity " + dubaiTime(agent.lastActivityAt) : "No CRM activity on report date"}</p>
    </td>
    {editable && <td className="min-w-52 px-3 py-3">
      <form className="flex items-center gap-2" onSubmit={event => { event.preventDefault(); void save(); }}>
        <input className={fieldClass + " min-w-24"} inputMode="numeric" aria-label={"Hashmi ID for " + agent.name} value={hashmiId} onChange={event => { setHashmiId(event.target.value); setError(""); }} />
        <button type="submit" className={secondaryClass} disabled={busy || hashmiId.trim() === agent.hashmiId}>Save</button>
      </form>
      {error && <p role="alert" className="mt-1 text-xs text-red-300">{error}</p>}
    </td>}
  </tr>;
}

export default function CrmPage() {
  const session = useAdminSession();
  const owner = session?.role === "owner";
  const readOnly = !owner && !!session?.permissions?.includes("crm_view") && !session.permissions.includes("crm");
  const reportOnly = !owner && !readOnly && !!session?.permissions?.includes("crm_team") && !session.permissions.includes("crm");
  const team = owner || readOnly || reportOnly;
  const canAssign = Boolean(session) && !readOnly && !reportOnly;
  const [day, setDay] = useState(dubaiDate);
  const [view, setView] = useState<View>("queue");
  const [leadList, setLeadList] = useState<LeadList | "all">("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [leads, setLeads] = useState<LeadPage>(blank);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const [assigning, setAssigning] = useState(false);
  const detail = useRef<HTMLDivElement>(null);
  const refresh = () => setVersion(current => current + 1);
  const requestedView = view === "leads" && leadList !== "all" ? leadList : view;

  useEffect(() => {
    if (!canAssign) return;
    const controller = new AbortController();
    api.post(crmApi + "/distribute", undefined, { signal: controller.signal })
      .then(() => setVersion(current => current + 1))
      .catch(error => { if (!controller.signal.aborted) setActionError(crmError(error, "Automatic assignment could not run.")); });
    return () => controller.abort();
  }, [canAssign]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setReadError("");
    Promise.all([
      api.get<Overview>(crmApi + "/overview", { params: { day }, signal: controller.signal }),
      reportOnly ? Promise.resolve({ data: blank }) : api.get<LeadPage>(crmApi + "/leads", {
        params: { view: requestedView, page, search, ...(agentFilter ? { agent: agentFilter } : {}) }, signal: controller.signal,
      }),
    ]).then(([report, data]) => {
      if (controller.signal.aborted) return;
      setOverview(report.data);
      setLeads(data.data);
    }).catch(error => {
      if (!controller.signal.aborted) setReadError(crmError(error, "CRM could not load."));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [day, requestedView, page, search, agentFilter, version, reportOnly]);

  useEffect(() => {
    if (selected) detail.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  useEffect(() => {
    if (importing) return;
    const refreshVisible = () => { if (!document.hidden) setVersion(current => current + 1); };
    const timer = window.setInterval(refreshVisible, 60_000);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [importing]);

  async function assign() {
    setAssigning(true);
    setActionError("");
    setNotice("");
    try {
      const response = await api.post<{ assigned: number; busy?: boolean }>(crmApi + "/distribute");
      setNotice(response.data.busy ? "Automatic assignment is running." : number.format(response.data.assigned) + " leads assigned.");
      refresh();
    } catch (error) { setActionError(crmError(error, "Lead assignment could not run.")); }
    finally { setAssigning(false); }
  }

  async function upload() {
    if (!file) return;
    setImporting(true);
    setImportProgress("Reading file…");
    setActionError("");
    setNotice("");
    setImportResult(null);
    const summary: ImportSummary = { leads: 0, calls: 0, duplicates: 0, rejected: [] };
    let processed = 0;
    try {
      const rows = await readCrmFile(file);
      if (rows.hashmi.length) {
        summary.hashmi = { updated: 0, skipped: 0 };
        for (const batch of importBatches(rows.hashmi)) {
          const { data } = await api.post<HashmiImportResult>(crmApi + "/import/hashmi", { rows: batch });
          summary.leads += data.leadsAdded;
          summary.calls += data.added;
          summary.duplicates += data.existing;
          summary.hashmi.updated += data.updated;
          summary.hashmi.skipped += data.skipped;
          summary.rejected.push(...data.rejected.map(row => ({ ...row, area: "Hashmi" })));
          processed += batch.length;
          setImportProgress(number.format(processed) + " of " + number.format(rows.hashmi.length) + " Hashmi rows checked");
        }
        setImportResult(summary);
        setNotice("Hashmi history imported.");
        setFile(null);
        return;
      }
      const total = rows.leads.length + rows.outcomes.length;
      for (const [area, field, endpoint, group] of [
        ["Leads", "leads", "/import", rows.leads],
        ["Calls", "calls", "/import/outcomes", rows.outcomes],
      ] as const) {
        for (const batch of importBatches<{ row: number }>(group)) {
          const { data } = await api.post<ImportResult>(crmApi + endpoint, { rows: batch });
          summary[field] += data.imported;
          summary.duplicates += data.duplicates;
          summary.rejected.push(...data.rejected.map(row => ({ ...row, area })));
          processed += batch.length;
          setImportProgress(number.format(processed) + " of " + number.format(total) + " rows checked");
        }
      }
      setImportResult(summary);
      setImportProgress("Distributing available leads…");
      const { data } = await api.post<{ assigned: number; busy?: boolean }>(crmApi + "/distribute");
      setNotice(data.busy ? "Lead upload finished. Automatic assignment is running." : number.format(data.assigned) + " leads assigned.");
      setFile(null);
    } catch (error) {
      if (processed) setImportResult(summary);
      setActionError(crmError(error, "The upload could not finish. You can retry the same file."));
    } finally {
      setImporting(false);
      setImportProgress("");
      refresh();
    }
  }

  const agents = overview?.agents || [];
  const target = overview?.target || 300;
  const verified = agents.reduce((sum, agent) => sum + agent.verified, 0);
  const ready = agents.reduce((sum, agent) => sum + agent.ready, 0);
  const logged = agents.reduce((sum, agent) => sum + agent.logged, 0);
  const agentNames = new Map(agents.map(agent => [agent.id, agent.name]));
  const dialerMode = overview?.dialerMode || "unconfigured";
  function changeView(next: View, list = leadList) {
    if (next !== view || list !== leadList || page !== 1) setLoading(true);
    setView(next);
    setLeadList(list);
    setPage(1);
    setSelected(null);
  }
  const views: { id: View; name: string }[] = [
    { id: "queue", name: "Work queue" },
    { id: "leads", name: team ? "Data bank" : "My leads" },
    { id: "clients", name: team ? "Clients" : "My clients" },
  ];
  const listTitle = view === "leads" && leadList !== "all" ? LEAD_LISTS[leadList] : null;

  return (
    <div className="mx-auto max-w-[1450px] space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">BDFX CRM</h1>
          <p className="mt-2 text-sm text-slate-300">{owner ? "Assign leads, monitor callbacks and track verified calling progress." : reportOnly ? "View team calling activity and overdue follow-ups." : readOnly ? "View lead lists and team calling reports." : "Work your assigned leads and see your client conversions."}</p>
        </div>
        <div className="flex items-end gap-2">
          <label className="block text-xs text-slate-300">Report date · Dubai
            <input type="date" className={fieldClass + " mt-1"} value={day} onChange={event => { if (event.target.value) setDay(event.target.value); }} />
          </label>
          <button type="button" onClick={refresh} aria-label="Refresh CRM report" className={secondaryClass}><RefreshCw size={18} /></button>
        </div>
      </header>
      {(readError || actionError) && <p role="alert" className="rounded-lg border border-red-700/70 bg-red-950/50 p-3 text-sm text-red-200">{actionError || readError}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-200">{notice}</p>}
      {overview && <>
        <section aria-label="Calling progress" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Hashmi verified attempts" value={number.format(verified) + " / " + number.format(team ? agents.length * target : target)} />
          <Metric label="Ready leads and callbacks" value={number.format(ready)} />
          <Metric label="Outcomes logged" value={number.format(logged)} />
          <Metric label={team ? "Available in data bank" : "Connected calls"} value={number.format(team ? overview.bank || 0 : agents[0]?.connected || 0)} />
        </section>
        <p className="flex flex-wrap items-center gap-2 text-sm text-slate-300"><Phone size={16} className="text-[#d6b659]" />
          {dialerMode === "unconfigured" ? "Hashmi connection pending API access." :
            dialerMode === "developer" ? "Hashmi developer mode is configured for call tests." : "Hashmi click-to-call is configured."}
          {overview.reportEnabled && " Call report webhook configured."}
          {!team && !agents[0]?.hashmiId && dialerMode !== "unconfigured" && " Your Hashmi agent ID needs mapping before leads can be assigned."}
          {!team && dialerMode === "unconfigured" && (
            <a className="text-[#e0bf65] underline underline-offset-4" href="https://cloud.hashmiinfonet.net/user/telephony/agent"
              target="_blank" rel="noreferrer">Open Hashmi dialer</a>
          )}
        </p>
        {!verified && logged > 0 && <p className="text-sm text-amber-200">CRM outcomes are logged. Hashmi has yet to verify call results for this report.</p>}
      </>}

      {!team && Boolean(agents[0]?.hashmiId) && dialerMode !== "unconfigured" && <DialPad />}
      {canAssign && <CallAssistant />}

      {owner && (
        <section className={cardClass} aria-labelledby="crm-import">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="crm-import" className="text-lg font-semibold">Upload leads and call history</h2>
              <p className="mt-1 text-sm text-slate-300">Upload leads or call history as Excel or CSV. A Hashmi report CSV updates verified calls and adds missing numbers to Data Bank.</p>
              {Boolean(overview?.pending) && <p className="mt-2 text-sm text-amber-200">{number.format(overview?.pending || 0)} leads are waiting for a matching CRM caller with a saved Hashmi Agent ID.</p>}
            </div>
            <button type="button" className={secondaryClass} onClick={assign} disabled={assigning || importing}>{assigning ? "Assigning…" : "Distribute available leads"}</button>
          </div>
          <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); void upload(); }}>
            <label className="block min-w-0 text-sm">Lead file
              <input type="file" accept=".xlsx,.csv" className={fieldClass + " mt-1 block max-w-full"} disabled={importing}
                onChange={event => setFile(event.target.files?.[0] || null)} />
            </label>
            <button type="submit" disabled={!file || importing || assigning} className={buttonClass + " inline-flex items-center gap-2"}><Upload size={16} />Import file</button>
          </form>
          {importProgress && <p role="status" className="mt-3 text-sm text-slate-300">{importProgress}</p>}
          {importResult && <div className="mt-3 text-sm">
            {importResult.hashmi ? <p>{number.format(importResult.leads)} leads added · {number.format(importResult.calls)} Hashmi calls added · {number.format(importResult.hashmi.updated)} calls updated · {number.format(importResult.duplicates)} already current · {number.format(importResult.hashmi.skipped)} other call types skipped · {number.format(importResult.rejected.length)} rows to review</p> :
              <p>{number.format(importResult.leads)} leads added · {number.format(importResult.calls)} call outcomes added · {number.format(importResult.duplicates)} duplicates · {number.format(importResult.rejected.length)} rows to review</p>}
            {importResult.rejected.length > 0 && <ul className="mt-2 space-y-1 text-amber-200">
              {importResult.rejected.slice(0, 10).map((item, index) => <li key={item.row + "-" + index}>{item.area} row {item.row} · {item.reason}</li>)}
            </ul>}
          </div>}
        </section>
      )}

      {team && overview && <section className={cardClass} aria-labelledby="crm-team">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="crm-team" className="text-lg font-semibold">Team calling report</h2>
          {owner && <Link href="/staff-users" className={secondaryClass}>Manage CRM agents</Link>}
        </div>
        {agents.length ? <div className="mt-4 overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="text-xs text-slate-300"><tr>{["Agent", "Ready", "Logged", "Hashmi verified", "Calls left", "Connected", "Talk time", "Overdue now", "Member status", ...(owner ? ["Hashmi agent ID"] : [])].map(label => <th scope="col" className="px-3 py-2" key={label}>{label}</th>)}</tr></thead>
            <tbody>{agents.map(agent => <AgentRow key={agent.id + ":" + agent.hashmiId} agent={agent} target={target} editable={owner} onSave={refresh} />)}</tbody>
          </table>
        </div> : <p className="mt-3 text-sm text-slate-300">Enable CRM-only access in Staff Users to start assigning leads.</p>}
      </section>}

      <div ref={detail}>
        {selected && <LeadDetails key={selected.id} lead={selected} owner={owner} readOnly={readOnly} mode={dialerMode} onClose={() => setSelected(null)} onChange={name => {
          if (name !== undefined) setSelected(current => current?.id === selected.id ? { ...current, name } : current);
          refresh();
        }} />}
      </div>
      {!reportOnly && <section className={cardClass} aria-label="CRM records">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <nav className="flex flex-wrap items-end gap-2" aria-label="CRM views">
            {views.map(item => <button key={item.id} type="button" aria-pressed={view === item.id} className={view === item.id ? buttonClass : secondaryClass}
              onClick={() => changeView(item.id)}>{item.name}</button>)}
            <label className="block text-xs text-slate-300">Lead list
              <select className={fieldClass + " mt-1"} value={view === "leads" ? leadList : ""}
                onChange={event => changeView("leads", event.target.value as LeadList | "all")}>
                <option value="" disabled>Choose a list</option>
                <option value="all">All leads</option>
                {Object.entries(LEAD_LISTS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
          </nav>
          <form className="flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); setSearch(searchInput.trim()); setPage(1); setSelected(null); }}>
            {team && <label className="block text-xs text-slate-300">Assigned agent
              <select className={fieldClass + " mt-1"} value={agentFilter} onChange={event => { setAgentFilter(event.target.value); setPage(1); setSelected(null); }}>
                <option value="">All agents</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
              </select>
            </label>}
            <label className="block text-xs text-slate-300">Search by name, phone or Lead ID
              <input className={fieldClass + " mt-1"} maxLength={80} value={searchInput} onChange={event => setSearchInput(event.target.value)} />
            </label>
            <button type="submit" className={secondaryClass}>Search</button>
          </form>
        </div>
        {listTitle && <h2 className="mt-4 text-base font-semibold">{listTitle}{!loading && !readError && <span className="ml-2 text-sm font-normal text-slate-300">{number.format(leads.total)} leads</span>}</h2>}
        {loading ? <p role="status" className="mt-4 text-sm text-slate-300">Loading CRM records…</p> : readError ? null :
          leads.rows.length === 0 ? <p className="mt-4 text-sm text-slate-300">{view === "queue" ? "No leads or callbacks are due in this queue." : view === "clients" ? "No verified clients linked to these leads yet." : "No leads match this view."}</p> :
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-300"><tr>
                <th scope="col" className="px-3 py-2">Lead</th>
                {team && <th scope="col" className="px-3 py-2">Agent</th>}
                <th scope="col" className="px-3 py-2">Source</th>
                <th scope="col" className="px-3 py-2">{view === "clients" ? "Conversion" : "Status"}</th>
                <th scope="col" className="px-3 py-2">Callback · Dubai</th>
                <th scope="col" className="px-3 py-2"><span className="sr-only">Open record</span></th>
              </tr></thead>
              <tbody>{leads.rows.map(lead => <tr key={lead.id} className="border-t border-slate-700">
                <th scope="row" className="min-w-40 px-3 py-3 font-medium">
                  <p>{lead.name || lead.client?.name || "Lead"}</p>
                  <p className="text-xs font-normal text-slate-300">{lead.phone}</p>
                  <p className="break-all text-xs font-normal text-slate-400">{lead.leadId}</p>
                </th>
                {team && <td className="px-3 py-3">{lead.assignmentPending ? "Awaiting " + lead.originalAgent : lead.assignedTo ? agentNames.get(lead.assignedTo) || "Inactive agent" : "Unassigned"}</td>}
                <td className="px-3 py-3">
                  {lead.source}
                  {lead.registeredAt && <p className="mt-1 text-xs text-slate-300">{lead.source === "Website registration" ? "" : "Registered · "}{dubaiTime(lead.registeredAt)}</p>}
                </td>
                <td className="px-3 py-3">{lead.outcome === "do_not_call" ? "Do not call back" : lead.client ? <span>{lead.client.firstDeposit ? "First deposit" : lead.client.kycApproved ? "KYC approved" : "Registered"}</span> : lead.outcome === "number_not_in_use" ? "Number not in use" : lead.accountOpened ? "Account opened" : STATUS_LABELS[lead.status] || lead.status}</td>
                <td className="whitespace-nowrap px-3 py-3">{lead.followUpAt ? dubaiTime(lead.followUpAt) : "—"}</td>
                <td className="whitespace-nowrap px-3 py-3"><button type="button" className={secondaryClass} onClick={() => setSelected(lead)}>{team || view === "clients" || lead.status === "closed" || lead.outcome === "do_not_call" ? "View" : "Open to call"}</button></td>
              </tr>)}</tbody>
            </table>
          </div>}
        {!loading && !readError && (page > 1 || leads.total > leads.limit) && <nav aria-label="Lead pages" className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex gap-2">
            <button type="button" className={secondaryClass} disabled={page <= 1} onClick={() => { setPage(page - 1); setSelected(null); }}>Previous</button>
            <button type="button" className={secondaryClass} disabled={page * leads.limit >= leads.total} onClick={() => { setPage(page + 1); setSelected(null); }}>Next</button>
          </div>
          <p>{number.format(leads.total)} records · Page {leads.page} of {Math.max(1, Math.ceil(leads.total / leads.limit))}</p>
        </nav>}
      </section>}
    </div>
  );
}
