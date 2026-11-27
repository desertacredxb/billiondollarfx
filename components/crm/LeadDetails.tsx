"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Phone, Send, X } from "lucide-react";
import WorkChat from "./WorkChat";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, dubaiTime, fieldClass, dialMessage, leadChatLinks, OUTCOME_LABELS, secondaryClass, type Agent, type DialResponse, type Lead, type Overview } from "../../lib/crm";

type Outcome = keyof typeof OUTCOME_LABELS;
type Activity = { _id: string; kind: "outcome" | "hashmi" | "indiavoice"; occurredAt: string; outcome?: Outcome; note?: string; attempted?: boolean;
  followUpAt?: string; connected?: boolean; talkSeconds?: number; hashmiExportStatus?: string };
const closedOutcomes = new Set<Outcome>(["wrong_number", "number_not_in_use", "not_interested", "do_not_call"]);

export default function LeadDetails({ lead, owner, readOnly = false, mode, dialer = "hashmi", agents = [], onClose, onChange, onSaved, allowNext = false }: {
  lead: Lead;
  owner: boolean;
  readOnly?: boolean;
  mode: Overview["dialerMode"];
  dialer?: "hashmi" | "9ance";
  agents?: Agent[];
  onClose: () => void;
  onChange: (fields: Partial<Pick<Lead, "name" | "email" | "status" | "followUpAt" | "assignedTo" | "assignmentPending">>) => void;
  onSaved: (next: boolean) => void;
  allowNext?: boolean;
}) {
  const [history, setHistory] = useState<Activity[]>([]);
  const [outcome, setOutcome] = useState<Outcome | "">("");
  const [callback, setCallback] = useState(() => lead.followUpAt && Date.parse(lead.followUpAt) > Date.now()
    ? new Date(Date.parse(lead.followUpAt) + 4 * 3600000).toISOString().slice(0, 16) : "");
  const [transferring, showTransfer] = useState(false);
  const [newAgent, setNewAgent] = useState("");
  const needsCallback = outcome === "call_back" || outcome === "follow_up";
  const [chat, setChat] = useState<"all" | "telegram" | null>(null);
  const chatPanel = useRef<HTMLDivElement>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminder, setReminder] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [busy, setBusy] = useState(false);
  const [outcomeRequest, setOutcomeRequest] = useState<{ key: string; payload: string }>();
  const [dialRequestId, setDialRequestId] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const displayName = lead.name || lead.client?.name || "";
  const closed = !!outcome && closedOutcomes.has(outcome);
  const optedOut = lead.outcome === "do_not_call";
  const canLog = !owner && !readOnly && !optedOut && lead.outcome !== "number_not_in_use";
  const canContact = canLog && lead.status !== "closed";
  const chatLinks = canContact && leadChatLinks(lead.phone);

  useEffect(() => {
    const controller = new AbortController();
    api.get<Activity[]>(crmApi + "/leads/" + lead.id + "/history", { signal: controller.signal })
      .then(response => setHistory(response.data))
      .catch(error => { if (!controller.signal.aborted) setHistoryError(crmError(error, "Call history could not be loaded.")); });
    return () => controller.abort();
  }, [lead.id]);

  async function saveReminder() {
    const followUpAt = reminder + "+04:00";
    if (!reminder || Date.parse(followUpAt) <= Date.now()) { setError("Choose a future reminder time in Dubai."); return; }
    setBusy(true);
    setResult("");
    setError("");
    try {
      const { data } = await api.patch<Pick<Lead, "status" | "followUpAt">>(crmApi + "/leads/" + lead.id + "/reminder",
        { followUpAt, previous: lead.followUpAt || null });
      onChange(data);
      setCallback(reminder);
      setResult("Reminder saved.");
      setReminderOpen(false);
    } catch (e) { setError(crmError(e, "The reminder could not be saved.")); }
    finally { setBusy(false); }
  }

  async function transfer() {
    setBusy(true);
    setError("");
    setResult("");
    try {
      const { data } = await api.patch<Pick<Lead, "assignedTo" | "assignmentPending">>(crmApi + "/leads/" + lead.id + "/assignment",
        { previous: lead.assignedTo || null, agent: newAgent });
      onChange(data);
      showTransfer(false);
      setResult("Assigned to " + (agents.find(agent => agent.id === newAgent)?.name || "the selected agent") + ".");
    } catch (e) { setError(crmError(e, "The lead could not be transferred.")); }
    finally { setBusy(false); }
  }

  async function saveName() {
    setBusy(true);
    setError("");
    setResult("");
    try {
      const { data } = await api.patch<{ name: string }>(crmApi + "/leads/" + lead.id + "/name", { name: name.trim() });
      setEditingName(false);
      setResult("Lead name saved.");
      onChange({ name: data.name });
    } catch (error) { setError(crmError(error, "The lead name could not be saved.")); }
    finally { setBusy(false); }
  }

  async function saveEmail() {
    setBusy(true);
    setError("");
    setResult("");
    try {
      const { data } = await api.patch<{ email: string }>(crmApi + "/leads/" + lead.id + "/email", { email: email.trim() });
      onChange({ email: data.email });
      setEditingEmail(false);
      setResult("Lead email saved.");
    } catch (error) { setError(crmError(error, "The lead email could not be saved.")); }
    finally { setBusy(false); }
  }

  async function save(nextOutcome = outcome, next = false) {
    if (!nextOutcome) return;
    const data = { outcome: nextOutcome, note, followUpAt: !closedOutcomes.has(nextOutcome) && callback ? callback + "+04:00" : "" };
    const payload = JSON.stringify(data);
    if (data.followUpAt && Date.parse(data.followUpAt) <= Date.now() && outcomeRequest?.payload !== payload) {
      setError("Choose a future callback time in Dubai.");
      return;
    }
    const key = outcomeRequest?.payload === payload ? outcomeRequest.key : crypto.randomUUID();
    setOutcomeRequest({ key, payload });
    setBusy(true);
    setError("");
    setResult("");
    try {
      await api.post(crmApi + "/leads/" + lead.id + "/outcome", { requestId: key, ...data });
      setOutcomeRequest(undefined);
      onSaved(next);
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
      const response = await api.post<DialResponse>(
        crmApi + "/leads/" + lead.id + "/dial", { requestId: key },
      );
      const { data } = response;
      if (data.state === "accepted") setResult(dialMessage(data));
      else setError(dialMessage(data));
      if (data.state === "accepted" || data.state === "rejected") setDialRequestId("");
    } catch (error) { setError(crmError(error, "Check your dialer for the current request.")); }
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
      {lead.followUpAt && <p className="mt-3 text-sm text-amber-200">Callback · {dubaiTime(lead.followUpAt)} Dubai</p>}
      {lead.note && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">{lead.note}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      {result && <p role="status" className="mt-4 text-sm text-emerald-300">{result}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {owner && !readOnly && lead.status !== "closed" && !optedOut && lead.outcome !== "number_not_in_use" && <button type="button" className={secondaryClass} aria-expanded={transferring} onClick={() => { setNewAgent(""); showTransfer(!transferring); }}>Transfer lead</button>}
        {canContact && <button type="button" className={secondaryClass} aria-expanded={reminderOpen} onClick={() => {
          setReminderOpen(!reminderOpen);
          setReminder(lead.followUpAt ? new Date(Date.parse(lead.followUpAt) + 4 * 3600000).toISOString().slice(0, 16) : "");
        }}>{lead.followUpAt ? "Change reminder" : "Set reminder"}</button>}
        {!readOnly && !editingName && <button type="button" className={secondaryClass} disabled={busy} onClick={() => { setName(displayName); setEditingName(true); }}>{displayName ? "Edit name" : "Add name"}</button>}
        {!readOnly && !editingEmail && <button type="button" className={secondaryClass} disabled={busy} onClick={() => { setEmail(lead.email || ""); setEditingEmail(true); }}>{lead.email ? "Edit email" : "Add email"}</button>}
        {!readOnly && !canLog && !optedOut && <button type="button" className={secondaryClass} disabled={busy} onClick={() => void save("do_not_call")}>Do not call back</button>}
        {optedOut && <p className="text-sm font-medium text-amber-300">Do not call back</p>}
      </div>
      {transferring && owner && <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); void transfer(); }}>
        <label className="block text-sm">Assign to agent
          <select className={fieldClass + " mt-1"} required value={newAgent} onChange={e => setNewAgent(e.target.value)}>
            <option value="">Choose an agent</option>
            {agents.filter(agent => agent.dialerMapped && agent.id !== lead.assignedTo).map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
          </select>
        </label>
        <button className={buttonClass} disabled={busy || !newAgent}>Save assignment</button>
        <button type="button" className={secondaryClass} onClick={() => showTransfer(false)}>Cancel</button>
      </form>}
      {reminderOpen && canContact && <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); void saveReminder(); }}>
        <label className="block text-sm">Reminder · Dubai
          <input autoFocus required type="datetime-local" className={fieldClass + " mt-1"} value={reminder} onChange={e => setReminder(e.target.value)} />
        </label>
        <button className={buttonClass} disabled={!reminder || busy}>Save reminder</button>
        <button type="button" className={secondaryClass} onClick={() => setReminderOpen(false)}>Cancel</button>
      </form>}
      {editingEmail && <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); void saveEmail(); }}>
        <label className="block w-full max-w-sm text-sm">CRM lead email
          <input type="email" className={fieldClass + " mt-1"} required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
        </label>
        <button type="submit" className={buttonClass} disabled={busy || !email.trim()}>Save email</button>
        <button type="button" className={secondaryClass} disabled={busy} onClick={() => setEditingEmail(false)}>Cancel</button>
      </form>}
      {editingName && <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); void saveName(); }}>
        <label className="block w-full max-w-sm text-sm">CRM lead name
          <input className={fieldClass + " mt-1"} required maxLength={150} value={name} onChange={event => setName(event.target.value)} />
        </label>
        <button type="submit" className={buttonClass} disabled={busy || !name.trim()}>Save name</button>
        <button type="button" className={secondaryClass} disabled={busy} onClick={() => setEditingName(false)}>Cancel</button>
      </form>}
      {canLog && (
        <div className="mt-5 space-y-4">
          {canContact && <div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={dial} disabled={busy} className={buttonClass + " inline-flex items-center gap-2"}>
                <Phone size={16} /> {dialer === "9ance" ? "Call via 9ance" : mode === "developer" ? "Test Hashmi" : "Call via Hashmi"}
              </button>
              <button type="button" className={secondaryClass + " inline-flex items-center gap-2"} aria-controls="crm-client-chat" onClick={() => {
                setChat("telegram");
                chatPanel.current?.scrollIntoView({ block: "nearest" });
              }}><Send size={16} aria-hidden="true" /> Telegram inbox</button>
              {chatLinks && <>
                <a href={chatLinks.telegram} target="_blank" rel="noopener noreferrer" className={secondaryClass + " inline-flex items-center gap-2"}>
                  Open Telegram app
                </a>
                <a href={chatLinks.whatsapp} target="_blank" rel="noopener noreferrer" className={secondaryClass + " inline-flex items-center gap-2"}>
                  <MessageCircle size={16} aria-hidden="true" /> Chat on WhatsApp
                </a>
              </>}
            </div>

          </div>}
          <form onSubmit={event => {
            event.preventDefault();
            const submitter = (event.nativeEvent as SubmitEvent).submitter;
            void save(outcome, submitter?.getAttribute("value") === "next");
          }} className="space-y-4">
            <h3 className="font-semibold">Add feedback</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">Call outcome
                <select required className={fieldClass + " mt-1"} value={outcome} onChange={event => setOutcome(event.target.value as Outcome)}>
                  <option value="" disabled>Choose an outcome</option>
                  {Object.entries(OUTCOME_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label className="block text-sm">Callback date and time · Dubai{needsCallback && " (required)"}
                <input className={fieldClass + " mt-1"} type="datetime-local" required={needsCallback} value={callback} disabled={closed} onChange={event => setCallback(event.target.value)} />
              </label>
            </div>
            <label className="block text-sm">Call note
              <textarea className={fieldClass + " mt-1"} rows={2} maxLength={1500} value={note} onChange={event => setNote(event.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
              {allowNext && <button type="submit" value="next" disabled={busy || !outcome || (needsCallback && !callback)} className={buttonClass}>Save &amp; open next lead</button>}
              <button type="submit" disabled={busy || !outcome || (needsCallback && !callback)} className={allowNext ? secondaryClass : buttonClass}>Save outcome</button>
            </div>
          </form>
        </div>
      )}
      {!readOnly && <div id="crm-client-chat" ref={chatPanel}><WorkChat key={lead.id} lead={lead.id} agent={canContact} channel={chat} onChannel={setChat} /></div>}
      <h3 className="mt-5 text-sm font-semibold">Feedback and call history</h3>
      {historyError ? <p role="alert" className="mt-2 text-sm text-red-300">{historyError}</p> :
        history.length ? <ul className="mt-2 divide-y divide-slate-700 text-sm">
          {history.map(event => <li key={event._id} className="py-2">
            <p className="text-slate-200">{event.kind !== "outcome" ? (event.kind === "indiavoice" ? "9ance · " : "Hashmi · ") + (event.hashmiExportStatus || (event.connected ? "connected" : event.attempted ? "attempted" : "unconfirmed")) : event.outcome ? OUTCOME_LABELS[event.outcome] : "Call outcome"} <span className="text-slate-400">· {dubaiTime(event.occurredAt)}</span>{Boolean(event.connected && event.talkSeconds) && <span className="text-slate-400"> · {event.talkSeconds} s talk time</span>}</p>
            {event.followUpAt && <p className="text-xs text-amber-200">Callback · {dubaiTime(event.followUpAt)} Dubai</p>}
            {event.note && <p className="mt-1 whitespace-pre-wrap text-slate-300">{event.note}</p>}
          </li>)}
        </ul> : <p className="mt-2 text-sm text-slate-400">No calls logged yet.</p>}
    </section>
  );
}
