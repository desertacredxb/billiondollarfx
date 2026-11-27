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
type Channel = "all" | "telegram" | null;

export default function WorkChat({ lead, agent, channel, onChannel }: {
  lead: string;
  agent: boolean;
  channel: Channel;
  onChannel: (value: Channel) => void;
}) {
  const open = channel !== null;
  const [threads, setThreads] = useState<Thread[] | null>(null), [notice, notify] = useState("");
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
  const visibleThreads = threads?.filter(t => channel === "all" || channel === t.channel);
  return <section className="mt-5 rounded-lg border border-slate-700 p-3">
  <button type="button" aria-expanded={open} className="font-semibold" onClick={() => onChannel(open ? null : "all")}>Client messages</button>
  {open && <div className="mt-2 space-y-3 text-sm">
   <div className="flex gap-2">
     {(["all", "telegram"] as const).map(tab => <button key={tab} type="button" className={secondaryClass} aria-pressed={channel === tab} onClick={() => onChannel(tab)}>{tab === "all" ? "All work chats" : "Telegram"}</button>)}
   </div>
   {threads === null && !notice && <p role="status">Loading client messages…</p>}
   {visibleThreads?.length === 0 && <p>{channel === "telegram" ? "No Telegram conversation linked to this lead." : "No shared client messages yet."}</p>}
   {visibleThreads?.map(t => <section key={t.id} className="space-y-2">
    <h4 className="font-medium">{t.channel === "telegram" ? "Telegram" : "WhatsApp Business"} · {t.agentName}</h4>
    <ul className="max-h-72 overflow-auto">{t.messages.map(m => <li key={m._id} className="border-b border-slate-700 py-2">
     <span className="text-xs text-slate-300">{m.outbound ? "Agent" : "Client"} · {dubaiTime(m.at)}{m.outbound ? " · " + m.state : ""}</span>
     <p className="whitespace-pre-wrap break-words">{m.text}</p></li>)}</ul>
    {agent && t.canReply && <form onSubmit={e => { e.preventDefault(); void send(t); }} className="flex gap-2">
     <textarea className={fieldClass} aria-label={"Reply via " + t.channel} maxLength={4000} value={draft[t.id] || ""} onChange={e => { setDraft({ ...draft, [t.id]: e.target.value }); keys.current.delete(t.id); }} disabled={busy}/>
     <button className={secondaryClass} disabled={busy || !draft[t.id]?.trim()}>Reply</button>
    </form>}
   </section>)}
   {agent && threads && !threads.some(t => t.channel === "telegram") && <button className={secondaryClass} onClick={async () => {
          try {
            const { data } = await api.post(path + "/telegram");
            notify("Send this code from your connected Telegram account in this client’s private work chat within 10 minutes: " + data.code);
          }
          catch (e) {
            notify(crmError(e, "Could not link Telegram chat."));
          }
        }}>Link this client’s Telegram chat</button>}
   {agent && threads && !threads.some(t => t.channel === "telegram") && <a className="ml-2 underline" href="#crm-work-accounts" onClick={() => {
     const accounts = document.getElementById("crm-work-accounts");
     if (accounts instanceof HTMLDetailsElement) accounts.open = true;
   }}>Connect my work account</a>}
   {notice && <p role="status">{notice}</p>}
  </div>}
 </section>;
}
