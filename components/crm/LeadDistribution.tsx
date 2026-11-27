"use client";

import { useEffect, useRef, useState } from "react";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, fieldClass, type Agent } from "../../lib/crm";

type Source = { _id: string; count: number };

export default function LeadDistribution({ agents, version, onSave }: { agents: Agent[]; version: number; onSave: () => void }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("100");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const submitting = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoaded(false);
    api.get<Source[]>(crmApi + "/distributions/sources", { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) { setSources(data); setLoaded(true); } })
      .catch(err => { if (!controller.signal.aborted) setError(crmError(err, "Available sources could not be loaded.")); });
    return () => controller.abort();
  }, [version]);
  const available = sources.filter(item => !source || item._id === source).reduce((sum, item) => sum + item.count, 0);
  const eligible = agents.filter(agent => agent.dialerMapped);
  const seats = selected.filter(id => eligible.some(agent => agent.id === id));
  const count = Number(quantity);
  const planned = Math.min(count, available);
  async function assign() {
    if (submitting.current || !seats.length || !Number.isInteger(count) || count < 1 || count > 1000) return;
    const payload = JSON.stringify({ source, agents: seats, quantity: count });
    const key = submission.current?.payload === payload ? submission.current.key : crypto.randomUUID();
    submission.current = { payload, key };
    submitting.current = true;
    setBusy(true); setError(""); setNotice("");
    try {
      const { data } = await api.post<{ assigned: number; counts: number[] }>(crmApi + "/distributions", {
        source, agents: seats, quantity: count, requestId: key,
      });
      const details = seats.map((id, i) => (eligible.find(agent => agent.id === id)?.name || "Agent") + " " + data.counts[i]);
      setNotice(data.assigned + " of " + count + " assigned · " + details.join(", "));
      submission.current = null;
      onSave();
    } catch (err) { setError(crmError(err, "Distribution could not be confirmed. Retry the same selection.")); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <section className={cardClass} aria-label="Distribute fresh leads">
    <h2 className="text-lg font-semibold">Distribute fresh leads</h2>
    <form className="mt-3 grid gap-3" onSubmit={event => { event.preventDefault(); void assign(); }}>
      <label className="text-sm">Source
        <select className={fieldClass} value={source} disabled={busy} onChange={e => setSource(e.target.value)}>
          <option value="">All available sources</option>
          {sources.filter(item => item._id).map(item => <option key={item._id} value={item._id}>{item._id} · {item.count}</option>)}
        </select>
      </label>
      <label className="text-sm">Total numbers
        <input className={fieldClass} type="number" required min={1} max={1000} value={quantity} disabled={busy} onChange={e => setQuantity(e.target.value)} />
      </label>
      <fieldset disabled={busy}><legend className="text-sm">Agents</legend>
        <div className="mt-2 flex flex-wrap gap-3">{eligible.map(agent => <label key={agent.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={seats.includes(agent.id)} onChange={e => setSelected(ids => e.target.checked ? [...ids, agent.id] : ids.filter(id => id !== agent.id))} />{agent.name}
        </label>)}</div>
      </fieldset>
      {loaded && <p className="text-sm text-slate-300">{available} available{seats.length > 0 && planned > 0 && " · " + seats.map((id, index) =>
        (eligible.find(agent => agent.id === id)?.name || "Agent") + " " + (Math.floor(planned / seats.length) + Number(index < planned % seats.length))).join(", ")}</p>}
      <button className={buttonClass} disabled={!loaded || !available || !seats.length || !Number.isInteger(count) || count < 1 || count > 1000 || busy}>Distribute round-robin</button>
    </form>
    {notice && <p role="status" className="mt-2 text-sm text-emerald-300">{notice}</p>}
    {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
  </section>;
}
