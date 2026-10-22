"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "../../../../lib/apiClient";
import { supportCategories, validateTicket, type TicketDraft } from "../../../../lib/supportForms";

interface Ticket { _id: string; category: string; subject: string; description: string; status: string; createdAt: string; unreadByUser?: number }
interface Message { _id: string; senderType: "User" | "Admin"; message: string; createdAt: string }
const emptyDraft: TicketDraft = { category: "", subject: "", description: "" };
const inputStyle = "mt-2 w-full rounded-lg border border-slate-600 bg-[#080f1c] p-3 text-white disabled:opacity-60";
const buttonStyle = "rounded-lg bg-[#d6b659] px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50";
const dateLabel = (value: string) => new Date(value).toLocaleString();
function errorMessage(error: unknown) {
  return api.isAxiosError(error) && typeof error.response?.data?.message === "string"
    ? error.response.data.message : "Unable to connect. Please try again; your text has been kept.";
}

export default function Support() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");
  const [listError, setListError] = useState("");
  const [draft, setDraft] = useState<TicketDraft>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketDraft, string>>>({});
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const submission = useRef<{ payload: string; requestId: string } | null>(null);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Ticket | null>(null);
  const activeId = useRef<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesBusy, setMessagesBusy] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const replyLock = useRef(false);
  const replySubmission = useRef<{ payload: string; requestId: string } | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const activeCount = tickets.filter(ticket => ["Open", "Pending"].includes(ticket.status)).length;

  const loadTickets = useCallback(async (address: string, signal?: AbortSignal) => {
    setListState("loading");
    try {
      const { data } = await api.get<Ticket[]>(`${process.env.NEXT_PUBLIC_API_BASE}/api/tickets/${encodeURIComponent(address)}`, { signal });
      if (signal?.aborted) return;
      setTickets(data.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
      setListState("ready"); setListError("");
    } catch (error) {
      if (signal?.aborted) return;
      setListState("error"); setListError(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (typeof user?.email !== "string" || !user.email) throw new Error("Missing account");
      setEmail(user.email); void loadTickets(user.email, controller.signal);
    } catch { setListState("error"); setListError("Please sign in again to view your support tickets."); }
    return () => controller.abort();
  }, [loadTickets]);
  useEffect(() => {
    if (active && !dialog.current?.open) dialog.current?.showModal();
    if (!active) dialog.current?.close();
  }, [active]);
  useEffect(() => {
    if (active) messagesEnd.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
  }, [messages, active]);

  async function createTicket(event: FormEvent) {
    event.preventDefault();
    if (submitLock.current || !email || listState !== "ready" || activeCount >= 2) return;
    const validation = validateTicket(draft); setErrors(validation); setFeedback(null);
    if (Object.keys(validation).length) {
      document.getElementById(`ticket-${Object.keys(validation)[0]}`)?.focus(); return;
    }
    submitLock.current = true; setSubmitting(true);
    const payload = JSON.stringify({ category: draft.category, subject: draft.subject.trim(), description: draft.description.trim() });
    if (submission.current?.payload !== payload) submission.current = { payload, requestId: crypto.randomUUID() };
    try {
      const { data } = await api.post<Ticket>(`${process.env.NEXT_PUBLIC_API_BASE}/api/tickets/${encodeURIComponent(email)}`, { ...JSON.parse(payload), requestId: submission.current.requestId });
      setTickets(previous => [data, ...previous.filter(ticket => ticket._id !== data._id)]);
      setDraft(emptyDraft); setPage(1); submission.current = null;
      setFeedback({ success: true, text: `Your ticket has been saved. Reference: ${data._id}. Open it below to follow replies.` });
    } catch (error) {
      setFeedback({ success: false, text: errorMessage(error) });
      if (api.isAxiosError(error) && error.response?.status === 409) void loadTickets(email);
    } finally { submitLock.current = false; setSubmitting(false); }
  }
  async function loadMessages(ticketId: string) {
    setMessagesBusy(true); setMessageError("");
    try {
      const { data } = await api.get<{ ticket: Ticket; messages: Message[] }>(`${process.env.NEXT_PUBLIC_API_BASE}/api/tickets/one/${ticketId}`);
      if (activeId.current !== ticketId) return;
      setActive(data.ticket); setMessages(data.messages);
      setTickets(previous => previous.map(ticket => ticket._id === ticketId ? { ...data.ticket, unreadByUser: 0 } : ticket));
    } catch (error) { if (activeId.current === ticketId) setMessageError(errorMessage(error)); }
    finally { if (activeId.current === ticketId) setMessagesBusy(false); }
  }
  function openTicket(ticket: Ticket) {
    activeId.current = ticket._id; setActive(ticket); setMessages([]); setReply(""); setMessageError("");
    replySubmission.current = null; void loadMessages(ticket._id);
  }
  function closeTicket() { activeId.current = null; setActive(null); setMessages([]); setMessageError(""); }
  async function sendReply(event: FormEvent) {
    event.preventDefault();
    if (replyLock.current || !active || active.status === "Closed") return;
    const message = reply.trim();
    if (!message || message.length > 5000) { setMessageError("Enter a message of 1–5,000 characters."); return; }
    const ticketId = active._id;
    replyLock.current = true; setSending(true); setMessageError("");
    const payload = JSON.stringify({ ticketId, message });
    if (replySubmission.current?.payload !== payload) replySubmission.current = { payload, requestId: crypto.randomUUID() };
    try {
      const { data } = await api.post<Message>(`${process.env.NEXT_PUBLIC_API_BASE}/api/tickets/${ticketId}/messages`, { message, requestId: replySubmission.current.requestId });
      if (activeId.current !== ticketId) return;
      setMessages(previous => [...previous.filter(item => item._id !== data._id), data]);
      setReply(""); replySubmission.current = null;
    } catch (error) { if (activeId.current === ticketId) setMessageError(errorMessage(error)); }
    finally { replyLock.current = false; setSending(false); }
  }
  function editField(key: keyof TicketDraft, value: string) {
    setDraft(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: undefined }));
  }
  return <main className="min-h-screen bg-black p-4 text-white sm:p-6">
    <header className="mb-6"><h1 className="text-2xl font-semibold">Client support</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Keep updates about the same issue in one ticket. For payment help, include the order reference, date, amount and payment method. Never share passwords, OTPs or wallet recovery phrases.</p><Link href="/help-centre" className="mt-3 inline-block text-sm text-[#d6b659] underline">Browse the Help Centre</Link></header>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-700 bg-[#121a2a] p-5"><h2 className="text-xl font-semibold">Create a new ticket</h2><p className="mt-2 text-sm text-slate-400">Up to 2 open or pending tickets. Reply to an existing ticket for follow-up.</p>
        <form onSubmit={createTicket} noValidate className="mt-5 space-y-5">
          <label className="block text-sm" htmlFor="ticket-category">Category<select id="ticket-category" value={draft.category} disabled={submitting} onChange={event => editField("category", event.target.value)} aria-invalid={!!errors.category} aria-describedby={errors.category ? "category-error" : undefined} className={inputStyle}><option value="">Choose a category</option>{supportCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{errors.category && <span id="category-error" className="mt-2 block text-red-300">{errors.category}</span>}</label>
          <label className="block text-sm" htmlFor="ticket-subject">Subject<input id="ticket-subject" value={draft.subject} maxLength={160} disabled={submitting} onChange={event => editField("subject", event.target.value)} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} className={inputStyle} />{errors.subject && <span id="subject-error" className="mt-2 block text-red-300">{errors.subject}</span>}</label>
          <label className="block text-sm" htmlFor="ticket-description">Describe your issue<textarea id="ticket-description" rows={5} value={draft.description} maxLength={5000} disabled={submitting} onChange={event => editField("description", event.target.value)} aria-invalid={!!errors.description} aria-describedby="description-hint description-error" className={inputStyle} /><span id="description-hint" className="mt-2 block text-xs text-slate-400">{draft.description.length}/5,000 characters</span>{errors.description && <span id="description-error" className="mt-2 block text-red-300">{errors.description}</span>}</label>
          {feedback && <p role={feedback.success ? "status" : "alert"} className={`break-words rounded-lg border p-4 text-sm ${feedback.success ? "border-emerald-600 text-emerald-200" : "border-red-700 text-red-200"}`}>{feedback.text}</p>}
          <button disabled={submitting || !email || listState !== "ready" || activeCount >= 2} className={buttonStyle}>{submitting ? "Saving ticket…" : activeCount >= 2 ? "2 active tickets — reply below" : "Submit ticket"}</button>
        </form>
      </section>
      <section className="rounded-xl border border-slate-700 bg-[#121a2a] p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">My tickets</h2>{email && <button type="button" disabled={listState === "loading" || submitting} onClick={() => void loadTickets(email)} className="text-sm text-[#d6b659] underline disabled:opacity-50">Refresh</button>}</div>
        {listState === "loading" ? <p role="status" className="mt-5 text-sm text-slate-400">Loading your tickets…</p> : listState === "error" ? <p role="alert" className="mt-5 text-sm text-red-200">{listError}</p> : !tickets.length ? <p className="mt-5 text-sm text-slate-400">You have no support tickets yet.</p> : <ul className="mt-5 space-y-3">{tickets.slice((page - 1) * 6, page * 6).map(ticket => <li key={ticket._id}><button type="button" onClick={() => openTicket(ticket)} className="w-full rounded-lg border border-slate-600 p-4 text-left hover:bg-slate-800"><span className="flex flex-wrap justify-between gap-3"><span className="min-w-0 break-words font-medium">{ticket.subject}</span><span className={`rounded-full px-2 py-1 text-xs ${ticket.status === "Closed" ? "bg-emerald-900 text-emerald-200" : "bg-amber-900 text-amber-200"}`}>{ticket.status}</span></span><span className="mt-2 block text-sm text-slate-400">{supportCategories.find(([value]) => value === ticket.category)?.[1] || ticket.category}</span><span className="mt-2 block break-all text-xs text-slate-400">Reference: {ticket._id}</span><span className="mt-2 block text-xs text-slate-400">{dateLabel(ticket.createdAt)}{ticket.unreadByUser ? ` · ${ticket.unreadByUser} unread replies` : ""}</span></button></li>)}</ul>}
        {tickets.length > 6 && <nav aria-label="Ticket pages" className="mt-5 flex flex-wrap gap-2">{Array.from({ length: Math.ceil(tickets.length / 6) }, (_, index) => <button type="button" key={index} onClick={() => setPage(index + 1)} aria-current={page === index + 1 ? "page" : undefined} className={`rounded px-3 py-2 text-sm ${page === index + 1 ? "bg-[#d6b659] text-black" : "bg-slate-800"}`}>{index + 1}</button>)}</nav>}
      </section>
    </div>
    <dialog ref={dialog} onCancel={closeTicket} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl border border-slate-600 bg-[#121a2a] p-0 text-white backdrop:bg-black/85" aria-labelledby="conversation-title">
      {active && <><header className="flex items-start justify-between gap-4 border-b border-slate-700 p-5"><div className="min-w-0"><h2 id="conversation-title" className="break-words text-lg font-semibold">{active.subject}</h2><p className="mt-2 break-all text-xs text-slate-400">Reference: {active._id} · {active.status}</p></div><button type="button" aria-label="Close conversation" onClick={closeTicket} className="rounded px-3 py-1 text-2xl">×</button></header>
        <div className="space-y-4 p-5"><div className="rounded-lg bg-[#080f1c] p-4"><p className="text-xs text-slate-400">Your original request</p><p className="mt-3 whitespace-pre-wrap break-words text-sm">{active.description}</p></div>
          {messagesBusy ? <p role="status" className="text-sm text-slate-400">Loading replies…</p> : <><button type="button" disabled={sending} onClick={() => void loadMessages(active._id)} className="text-sm text-[#d6b659] underline">Refresh replies</button><div role="log" aria-label="Ticket replies" aria-live="polite" className="space-y-4">{messages.map(message => <div key={message._id} className={`rounded-lg p-4 ${message.senderType === "Admin" ? "bg-slate-700" : "bg-[#080f1c]"}`}><p className="text-xs text-slate-400">{message.senderType === "Admin" ? "BDFX Support" : "You"} · {dateLabel(message.createdAt)}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm">{message.message}</p></div>)}{!messages.length && <p className="text-sm text-slate-400">Team replies will appear here.</p>}</div></>}
          {messageError && <p role="alert" className="text-sm text-red-200">{messageError}</p>}<div ref={messagesEnd} />
        </div>
        {active.status === "Closed" ? <p className="border-t border-slate-700 p-5 text-sm text-slate-300">This ticket is closed. Open a new ticket if you still need help.</p> : <form onSubmit={sendReply} className="border-t border-slate-700 p-5"><label className="block text-sm" htmlFor="ticket-reply">Reply to this ticket<textarea id="ticket-reply" rows={3} value={reply} disabled={sending} maxLength={5000} onChange={event => setReply(event.target.value)} className={inputStyle} /></label><button disabled={sending || !reply.trim() || messagesBusy} className={`${buttonStyle} mt-4`}>{sending ? "Sending…" : "Send reply"}</button></form>}
      </>}
    </dialog>
  </main>;
}
