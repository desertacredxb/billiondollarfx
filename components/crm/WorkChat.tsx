"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../lib/apiClient";
import { crmApi, crmError, dubaiTime, fieldClass, secondaryClass } from "../../lib/crm";
type Thread = {
  id: string;
  agentName: string;
  channel: "telegram" | "whatsapp";
  canReply: boolean;
  messages: {
    _id: string;
    outbound: boolean;
    at: string;
    state: string;
    text: string;
  }[];
};
export default function WorkChat({ lead, agent }: {
  lead: string;
  agent: boolean;
}) {
  const [open, show] = useState(false), [threads, setThreads] = useState<Thread[]>([]), [notice, notify] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({}), [busy, lock] = useState(false);
  const keys = useRef(new Map<string, string>());
  const path = crmApi + "/inbox/leads/" + lead;
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const { data } = await api.get<Thread[]>(path, { signal });
    if (!signal?.aborted)
      setThreads(data);
  }, [path]);
  useEffect(() => {
    if (!open)
      return;
    const c = new AbortController();
    function read() { void refresh(c.signal).catch(e => { if (!c.signal.aborted)
      notify(crmError(e, "Could not load client chats.")); }); }
    read();
    const timer = window.setInterval(() => { if (!document.hidden)
      read(); }, 10000);
    return () => { c.abort(); clearInterval(timer); };
  }, [refresh, open]);
  async function send(t: Thread) {
    const text = draft[t.id]?.trim();
    if (!text || busy)
      return;
    lock(true);
    const key = keys.current.get(t.id) || crypto.randomUUID();
    keys.current.set(t.id, key);
    try {
      const res = await api.post(path + "/reply", { thread: t.id, text, key });
      if (res.data.state === "sent") {
        setDraft(old => ({ ...old, [t.id]: "" }));
        notify("Reply sent.");
        keys.current.delete(t.id);
      }
      else if (res.data.state === "failed") {
        keys.current.delete(t.id);
        notify("The provider declined the reply.");
      }
      else
        notify("Delivery is unconfirmed. Check the conversation before sending again.");
      await refresh();
    }
    catch (e) {
      notify(crmError(e, "Could not confirm delivery."));
    }
    finally {
      lock(false);
    }
  }
  return <details className="mt-5" onToggle={e => show(e.currentTarget.open)}>
  <summary className="cursor-pointer font-semibold">Client messages</summary>
  {open && <div className="mt-2 space-y-3 text-sm">
   {!threads.length && <p>No shared client messages yet.</p>}
   {threads.map(t => <section key={t.id} className="space-y-2">
    <h4 className="font-medium">{t.channel === "telegram" ? "Telegram" : "WhatsApp Business"} · {t.agentName}</h4>
    <ul className="max-h-72 overflow-auto">{t.messages.map(m => <li key={m._id} className="border-b border-slate-700 py-2">
     <span className="text-xs text-slate-300">{m.outbound ? "Agent" : "Client"} · {dubaiTime(m.at)}{m.outbound ? " · " + m.state : ""}</span>
     <p className="whitespace-pre-wrap break-words">{m.text}</p></li>)}</ul>
    {agent && t.canReply && <form onSubmit={e => { e.preventDefault(); void send(t); }} className="flex gap-2">
     <textarea className={fieldClass} aria-label={"Reply via " + t.channel} maxLength={4000} value={draft[t.id] || ""} onChange={e => { setDraft({ ...draft, [t.id]: e.target.value }); keys.current.delete(t.id); }} disabled={busy}/>
     <button className={secondaryClass} disabled={busy || !draft[t.id]?.trim()}>Reply</button>
    </form>}
   </section>)}
   {agent && !threads.some(t => t.channel === "telegram") && <button className={secondaryClass} onClick={async () => {
          try {
            const { data } = await api.post(path + "/telegram");
            notify("Send this code from your connected Telegram account in this client’s private work chat within 10 minutes: " + data.code);
          }
          catch (e) {
            notify(crmError(e, "Could not link Telegram chat."));
          }
        }}>Link this client’s Telegram chat</button>}
   {notice && <p role="status">{notice}</p>}
  </div>}
 </details>;
}
