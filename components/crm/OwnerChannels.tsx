"use client";
import { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { cardClass, crmApi, crmError, dubaiTime, secondaryClass } from "../../lib/crm";

const channels = { hashmi: "Hashmi", "9ance": "9ance", telegram: "Telegram", whatsapp: "WhatsApp" } as const;
type Channel = keyof typeof channels;
type Member = { id: string; name: string; status: string };
type Entry = { id: string; label: string; at: string; connected?: boolean; talkSeconds?: number; playable?: boolean };
type Chat = { _id: string; text: string; outbound: boolean; at: string; state: string };
type Page<T> = { rows: T[]; hasMore: boolean };
const base = crmApi + "/owner/channels/";

function useData<T>(url: string) {
  const [result, set] = useState<{ url: string; data?: T; error?: string }>({ url: "" });
  useEffect(() => {
    const controller = new AbortController();
    api.get<T>(url, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) set({ url, data });
    }).catch(e => { if (!controller.signal.aborted) set({ url, error: crmError(e, "Could not load the team activity.") }); });
    return () => controller.abort();
  }, [url]);
  return result.url === url ? result : { url };
}

function Pages({ page, more, change }: { page: number; more: boolean; change: (p: number) => void }) {
  if (page === 1 && !more) return null;
  return <div className="flex items-center gap-3">
    <button className={secondaryClass} disabled={page === 1} onClick={() => change(page - 1)}>Previous</button>
    <span>Page {page}</span><button className={secondaryClass} disabled={!more} onClick={() => change(page + 1)}>Next</button>
  </div>;
}

function Conversation({ path, name }: { path: string; name: string }) {
  const [page, setPage] = useState(1);
  const { data, error } = useData<Page<Chat>>(path + "/messages?page=" + page);
  if (!data) return <p role="status">{error || "Loading messages…"}</p>;
  return <div className="my-2 rounded border border-slate-700 p-3">
    {!data.rows.length && <p>No shared messages yet.</p>}
    <ol className="space-y-2">{data.rows.map(m => <li key={m._id}>
      <small>{m.outbound ? name : "Client"} · {dubaiTime(m.at)} · {m.state}</small>
      <p className="whitespace-pre-wrap break-words">{m.text}</p>
    </li>)}</ol>
    <Pages page={page} more={data.hasMore} change={setPage} />
  </div>;
}

function Recording({ path }: { path: string }) {
  const [source, setSource] = useState(""), [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";
    api.get<Blob>(path + "/audio", { responseType: "blob", signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(data);
      setSource(objectUrl);
    }).catch(async err => {
      if (controller.signal.aborted) return;
      let message = "Could not load this recording.";
      if (api.isAxiosError(err) && err.response?.data instanceof Blob) {
        try { message = JSON.parse(await err.response.data.text()).message || message; } catch {}
      }
      if (!controller.signal.aborted) setNotice(message);
    });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);
  return <div>
    {source && <audio className="mt-2 w-full max-w-lg" aria-label="Call recording" controls autoPlay src={source}
      onError={() => setNotice("The browser could not decode this recording.")} onCanPlay={() => setNotice("")} />}
    {(notice || !source) && <p role="status">{notice || "Loading recording…"}</p>}
  </div>;
}

function Activity({ channel, member, day }: { channel: Channel; member: Member; day: string }) {
  const [page, setPage] = useState(1), [selected, select] = useState("");
  const dialer = channel === "hashmi" || channel === "9ance";
  const path = base + channel + "/" + member.id;
  const { data, error } = useData<Page<Entry>>(path + "?page=" + page + (dialer ? "&day=" + day : ""));
  return <section className="mt-4 space-y-2" aria-label={member.name + " activity"}>
    <h3 className="font-semibold">{member.name} · {channels[channel]}</h3>
    {!data && <p role="status">{error || "Loading activity…"}</p>}
    {data && !data.rows.length && <p>{dialer ? "No verified calls for the selected Dubai date." : "No shared client conversations yet."}</p>}
    {data?.rows.map(row => <div key={row.id} className="border-b border-slate-700 py-2">
      <p>{row.label} · {dubaiTime(row.at)}{dialer && (row.connected ? " · Answered · " + row.talkSeconds + "s" : " · No connection")}</p>
      {(!dialer || row.playable) ? <button className={secondaryClass} aria-expanded={selected === row.id} onClick={() => select(selected === row.id ? "" : row.id)}>
        {selected === row.id ? "Close" : dialer ? "Play recording" : "Open chat"}</button> : <small>Recording unavailable</small>}
      {selected === row.id && (dialer ? <Recording key={row.id} path={path + "/" + row.id} /> :
        <Conversation key={row.id} path={path + "/" + row.id} name={member.name} />)}
    </div>)}
    {data && <Pages page={page} more={data.hasMore} change={p => { select(""); setPage(p); }} />}
  </section>;
}

function Team({ channel, day }: { channel: Channel; day: string }) {
  const [selected, select] = useState("");
  const { data, error } = useData<Member[]>(base + channel);
  const member = data?.find(a => a.id === selected);
  const webOnly = (a: Member) => channel === "whatsapp" && a.status === "Provider setup pending";
  return <div className="mt-4">
    {!data && <p role="status">{error || "Loading team…"}</p>}
    <div className="flex flex-wrap gap-2">{data?.map(a => <button key={a.id} className={secondaryClass}
      aria-pressed={a.id === selected} onClick={() => select(a.id)}>{a.name} <small>· {webOnly(a) ? "WhatsApp Web" : a.status}</small></button>)}</div>
    {data && !data.length && <p>No active CRM agents.</p>}
    {member && webOnly(member) && <p className="mt-3">{member.name} can open WhatsApp Web from the CRM. Login status and chats are visible on the linked device.</p>}
    {member && !webOnly(member) && <Activity key={member.id + day} channel={channel} member={member} day={day} />}
  </div>;
}

type LiveStats = { onCall: number; ringing: number; signedIn: number; onBreak: number; checkedAt: string };

function DialerDashboard({ channel }: { channel: "hashmi" | "9ance" }) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (channel !== "hashmi") return;
    const ctl = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const result = await api.get<LiveStats>(base + "hashmi/live-status", { signal: ctl.signal, timeout: 12000 });
        if (!ctl.signal.aborted) { setStats(result.data); setFailed(false); }
      } catch {
        if (!ctl.signal.aborted) { setStats(null); setFailed(true); }
      } finally {
        if (!ctl.signal.aborted) timer = setTimeout(refresh, 15000);
      }
    }
    void refresh();
    return () => { ctl.abort(); clearTimeout(timer); };
  }, [channel]);
  const hashmi = channel === "hashmi";
  const dashboard = hashmi ? "https://cloud.hashmiinfonet.net/user/telephony/0/dashboard" : "https://indiavoice.rpdigitalphone.com/admin/live-call";
  const reports = hashmi ? "https://cloud.hashmiinfonet.net/user/telephony/0/callLog/listCallLogs" : "https://indiavoice.rpdigitalphone.com/admin/call-metrics";
  return <section className="my-4 space-y-2" aria-label="Dialer live status">
    {hashmi && (stats ? <div><p>Hashmi agents on calls: <strong>{stats.onCall}</strong> · Ringing: {stats.ringing} · Logged in: {stats.signedIn} · On break: {stats.onBreak}</p>
      <small>Updated {dubaiTime(stats.checkedAt)} Dubai</small></div> : <p>{failed ? "Hashmi live status unavailable." : "Loading Hashmi live status…"}</p>)}
    <div className="flex flex-wrap gap-3">
      <a className={secondaryClass} href={dashboard} target="_blank" rel="noopener noreferrer">{hashmi ? "Hashmi dashboard" : "9ance live calls and queue"}</a>
      <a className={secondaryClass} href={reports} target="_blank" rel="noopener noreferrer">{channels[channel]} call reports</a>
      {hashmi && <a className={secondaryClass} href="https://cloud.hashmiinfonet.net/user/telephony/0/agent/agentLiveAction" target="_blank" rel="noopener noreferrer">Hashmi agent activity</a>}
    </div>
  </section>;
}

export default function OwnerChannels({ day }: { day: string }) {
  const [channel, select] = useState<Channel | null>(null);
  return <section className={cardClass} aria-label="Team communications">
    <h2 className="mb-3 text-lg font-semibold">Team communications</h2>
    <div className="flex flex-wrap gap-2">{(Object.keys(channels) as Channel[]).map(key =>
      <button key={key} aria-pressed={channel === key} className={secondaryClass + (channel === key ? " border-amber-400" : "")}
        onClick={() => select(key)}>{channels[key]}</button>)}</div>
    {(channel === "hashmi" || channel === "9ance") && <DialerDashboard key={channel} channel={channel} />}
    {channel && <Team key={channel} channel={channel} day={day} />}
  </section>;
}
