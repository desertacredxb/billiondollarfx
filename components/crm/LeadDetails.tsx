"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, dubaiTime, fieldClass, OUTCOME_LABELS, secondaryClass, type Lead, type Overview } from "../../lib/crm";

type Outcome = keyof typeof OUTCOME_LABELS;
type Activity = { _id: string; kind: "outcome" | "hashmi"; occurredAt: string; outcome?: Outcome; note?: string; connected?: boolean; talkSeconds?: number };

export default function LeadDetails({ lead, owner, mode, mapped, onClose, onChange }: {
  lead: Lead;
  owner: boolean;
  mode: Overview["dialerMode"];
  mapped: boolean;
  onClose: () => void;
  onChange: () => void;
}) {
  const [history, setHistory] = useState<Activity[]>([]);
  const [outcome, setOutcome] = useState<Outcome>("connected");
  const [callback, setCallback] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [dialRequestId, setDialRequestId] = useState("");
  const closed = ["wrong_number", "number_not_in_use", "not_interested", "do_not_call"].includes(outcome);
  const canDial = !owner && mode !== "unconfigured" && mapped && lead.status !== "closed";

  useEffect(() => {
    const controller = new AbortController();
    api.get<Activity[]>(crmApi + "/leads/" + lead.id + "/history", { signal: controller.signal })
      .then(response => setHistory(response.data))
      .catch(error => { if (!controller.signal.aborted) setHistoryError(crmError(error, "Call history could not be loaded.")); });
    return () => controller.abort();
  }, [lead.id]);

  async function save() {
    const key = requestId || crypto.randomUUID();
    setRequestId(key);
    setBusy(true);
    setError("");
    setResult("");
    try {
      await api.post(crmApi + "/leads/" + lead.id + "/outcome", {
        requestId: key, outcome, note, followUpAt: !closed && callback ? callback + "+04:00" : "",
      });
      setRequestId("");
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
      const response = await api.post<{ state: string; mode: Overview["dialerMode"] }>(
        crmApi + "/leads/" + lead.id + "/dial", { requestId: key },
      );
      if (response.data.state === "accepted") {
        setResult(response.data.mode === "developer" ? "Hashmi accepted the test request." : "Hashmi accepted the call request.");
        setDialRequestId("");
      } else if (response.data.state === "rejected") {
        setError("Hashmi declined the call request. Check your Hashmi agent login and try again.");
        setDialRequestId("");
      } else {
        setError("Hashmi has not confirmed this request. Check your dialer before placing another call.");
      }
    } catch (error) { setError(crmError(error, "Check Hashmi for the current request.")); }
    finally { setBusy(false); }
  }

  return (
    <section className={cardClass} aria-labelledby="crm-lead-detail">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="crm-lead-detail" className="text-xl font-semibold">{lead.name || lead.client?.name || "Lead"} <span className="text-sm font-normal text-slate-400">{lead.leadId}</span></h2>
          <p className="mt-1 break-words text-slate-300">{lead.phone}{lead.email ? " · " + lead.email : ""}</p>
          {lead.registeredAt && <p className="mt-1 text-sm text-slate-300">Website registration · {dubaiTime(lead.registeredAt)}</p>}
          {lead.accountOpened && <p className="mt-1 text-sm text-slate-300">Live account opened</p>}
        </div>
        <button type="button" aria-label="Close lead details" onClick={onClose} className={secondaryClass}><X size={18} /></button>
      </div>
      {lead.note && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">{lead.note}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      {result && <p role="status" className="mt-4 text-sm text-emerald-300">{result}</p>}
      {!owner && lead.outcome !== "do_not_call" && lead.outcome !== "number_not_in_use" && (
        <div className="mt-5 space-y-4">
          {canDial && <button type="button" onClick={dial} disabled={busy} className={buttonClass + " inline-flex items-center gap-2"}>
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
            <p className="text-slate-200">{event.kind === "hashmi" ? event.connected ? "Hashmi · connected" : "Hashmi · attempted" : event.outcome ? OUTCOME_LABELS[event.outcome] : "Call outcome"} <span className="text-slate-400">· {dubaiTime(event.occurredAt)}</span></p>
            {event.note && <p className="mt-1 whitespace-pre-wrap text-slate-300">{event.note}</p>}
          </li>)}
        </ul> : <p className="mt-2 text-sm text-slate-400">No calls logged yet.</p>}
    </section>
  );
}
