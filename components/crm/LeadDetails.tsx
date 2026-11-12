"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, dubaiTime, fieldClass, hashmiMessage, OUTCOME_LABELS, secondaryClass, type HashmiResponse, type Lead, type Overview } from "../../lib/crm";

type Outcome = keyof typeof OUTCOME_LABELS;
type Activity = { _id: string; kind: "outcome" | "hashmi"; occurredAt: string; outcome?: Outcome; note?: string; attempted?: boolean;
  connected?: boolean; talkSeconds?: number; hashmiExportStatus?: string };
const closedOutcomes = new Set<Outcome>(["wrong_number", "number_not_in_use", "not_interested", "do_not_call"]);

export default function LeadDetails({ lead, owner, readOnly = false, mode, onClose, onChange }: {
  lead: Lead;
  owner: boolean;
  readOnly?: boolean;
  mode: Overview["dialerMode"];
  onClose: () => void;
  onChange: (name?: string) => void;
}) {
  const [history, setHistory] = useState<Activity[]>([]);
  const [outcome, setOutcome] = useState<Outcome>("connected");
  const [callback, setCallback] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [busy, setBusy] = useState(false);
  const [outcomeRequest, setOutcomeRequest] = useState<{ key: string; payload: string }>();
  const [dialRequestId, setDialRequestId] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const displayName = lead.name || lead.client?.name || "";
  const closed = closedOutcomes.has(outcome);
  const optedOut = lead.outcome === "do_not_call";
  const canLog = !owner && !readOnly && !optedOut && lead.outcome !== "number_not_in_use";

  useEffect(() => {
    const controller = new AbortController();
    api.get<Activity[]>(crmApi + "/leads/" + lead.id + "/history", { signal: controller.signal })
      .then(response => setHistory(response.data))
      .catch(error => { if (!controller.signal.aborted) setHistoryError(crmError(error, "Call history could not be loaded.")); });
    return () => controller.abort();
  }, [lead.id]);

  async function saveName() {
    setBusy(true);
    setError("");
    setResult("");
    try {
      const { data } = await api.patch<{ name: string }>(crmApi + "/leads/" + lead.id + "/name", { name: name.trim() });
      setEditingName(false);
      setResult("Lead name saved.");
      onChange(data.name);
    } catch (error) { setError(crmError(error, "The lead name could not be saved.")); }
    finally { setBusy(false); }
  }

  async function save(nextOutcome = outcome) {
    const data = { outcome: nextOutcome, note, followUpAt: !closedOutcomes.has(nextOutcome) && callback ? callback + "+04:00" : "" };
    const payload = JSON.stringify(data);
    const key = outcomeRequest?.payload === payload ? outcomeRequest.key : crypto.randomUUID();
    setOutcomeRequest({ key, payload });
    setBusy(true);
    setError("");
    setResult("");
    try {
      await api.post(crmApi + "/leads/" + lead.id + "/outcome", { requestId: key, ...data });
      setOutcomeRequest(undefined);
      onChange();
      onClose();
    } catch (error) {
      setError(crmError(error, "The outcome could not be saved."));
    } finally { setBusy(false); }
  }

  async function dial() {
    const key = dialRequestId || crypto.randomUUID();
    setDialRequestId(key);
    setBusy(true);
    setError("");
    setResult("");
    try {
      const response = await api.post<HashmiResponse>(
        crmApi + "/leads/" + lead.id + "/dial", { requestId: key },
      );
      const { data } = response;
      if (data.state === "accepted") setResult(hashmiMessage(data));
      else setError(hashmiMessage(data));
      if (data.state === "accepted" || data.state === "rejected") setDialRequestId("");
    } catch (error) { setError(crmError(error, "Check Hashmi for the current request.")); }
    finally { setBusy(false); }
  }

  return (
    <section className={cardClass} aria-labelledby="crm-lead-detail">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="crm-lead-detail" className="text-xl font-semibold">{displayName || "Lead"} <span className="text-sm font-normal text-slate-400">{lead.leadId}</span></h2>
          <p className="mt-1 break-words text-slate-300">{lead.phone}{lead.email ? " · " + lead.email : ""}</p>
          {lead.registeredAt && <p className="mt-1 text-sm text-slate-300">Website registration · {dubaiTime(lead.registeredAt)}</p>}
          {lead.accountOpened && <p className="mt-1 text-sm text-slate-300">Live account opened</p>}
        </div>
        <button type="button" aria-label="Close lead details" onClick={onClose} className={secondaryClass}><X size={18} /></button>
      </div>
      {lead.note && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">{lead.note}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      {result && <p role="status" className="mt-4 text-sm text-emerald-300">{result}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {!readOnly && !editingName && <button type="button" className={secondaryClass} disabled={busy} onClick={() => { setName(displayName); setEditingName(true); }}>{displayName ? "Edit name" : "Add name"}</button>}
        {!readOnly && !canLog && !optedOut && <button type="button" className={secondaryClass} disabled={busy} onClick={() => void save("do_not_call")}>Do not call back</button>}
        {optedOut && <p className="text-sm font-medium text-amber-300">Do not call back</p>}
      </div>
      {editingName && <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); void saveName(); }}>
        <label className="block w-full max-w-sm text-sm">CRM lead name
          <input className={fieldClass + " mt-1"} required maxLength={150} value={name} onChange={event => setName(event.target.value)} />
        </label>
        <button type="submit" className={buttonClass} disabled={busy || !name.trim()}>Save name</button>
        <button type="button" className={secondaryClass} disabled={busy} onClick={() => setEditingName(false)}>Cancel</button>
      </form>}
      {canLog && (
        <div className="mt-5 space-y-4">
          {lead.status !== "closed" && <button type="button" onClick={dial} disabled={busy} className={buttonClass + " inline-flex items-center gap-2"}>
            <Phone size={16} /> {mode === "developer" ? "Test Hashmi" : "Call via Hashmi"}
          </button>}
          <form onSubmit={event => { event.preventDefault(); void save(); }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">Call outcome
                <select className={fieldClass + " mt-1"} value={outcome} onChange={event => setOutcome(event.target.value as Outcome)}>
                  {Object.entries(OUTCOME_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label className="block text-sm">Callback date and time · Dubai
                <input className={fieldClass + " mt-1"} type="datetime-local" value={callback} disabled={closed} onChange={event => setCallback(event.target.value)} />
              </label>
            </div>
            <label className="block text-sm">Call note
              <textarea className={fieldClass + " mt-1"} rows={2} maxLength={1500} value={note} onChange={event => setNote(event.target.value)} />
            </label>
            <button type="submit" disabled={busy} className={buttonClass}>Save outcome</button>
          </form>
        </div>
      )}
      <h3 className="mt-5 text-sm font-semibold">Recent activity</h3>
      {historyError ? <p role="alert" className="mt-2 text-sm text-red-300">{historyError}</p> :
        history.length ? <ul className="mt-2 divide-y divide-slate-700 text-sm">
          {history.map(event => <li key={event._id} className="py-2">
            <p className="text-slate-200">{event.kind === "hashmi" ? "Hashmi · " + (event.hashmiExportStatus || (event.connected ? "connected" : event.attempted ? "attempted" : "unconfirmed")) : event.outcome ? OUTCOME_LABELS[event.outcome] : "Call outcome"} <span className="text-slate-400">· {dubaiTime(event.occurredAt)}</span>{Boolean(event.connected && event.talkSeconds) && <span className="text-slate-400"> · {event.talkSeconds} s talk time</span>}</p>
            {event.note && <p className="mt-1 whitespace-pre-wrap text-slate-300">{event.note}</p>}
          </li>)}
        </ul> : <p className="mt-2 text-sm text-slate-400">No calls logged yet.</p>}
    </section>
  );
}
