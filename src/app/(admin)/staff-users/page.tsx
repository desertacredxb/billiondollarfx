"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import api from "../../../../lib/apiClient";
import { managerPermissions, type AdminPermission } from "../../../../lib/adminAccess";
import { useAdminSession } from "../../../../lib/adminSession";

interface StaffUser { id: string; email: string; fullName: string; role: "owner" | "manager"; enabled: boolean; permissions: AdminPermission[]; setupComplete: boolean; lastLoginAt: string | null }
const fieldClass = "mt-2 w-full rounded-lg border border-slate-600 bg-[#080f1c] p-3 text-white";
export default function StaffUsers() {
  const session = useAdminSession();
  const [users, setUsers] = useState<StaffUser[]>([]), [page, setPage] = useState(1), [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const [name, setName] = useState(""), [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<AdminPermission[]>(["support", "enquiries"]);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const { data } = await api.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/staff?page=${page}`); setUsers(data.data); setPages(data.pages); }
    catch { setError("Unable to load staff accounts. Please try again."); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);
  function reset() { setEditing(null); setName(""); setEmail(""); setPermissions(["support", "enquiries"]); }
  function edit(user: StaffUser) { setEditing(user); setName(user.fullName); setEmail(user.email); setPermissions(user.permissions); setMessage(""); setError(""); }
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = editing ? await api.patch(`${process.env.NEXT_PUBLIC_API_BASE}/api/staff/${editing.id}`, { fullName: name.trim(), permissions }) : await api.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/staff`, { fullName: name.trim(), email: email.trim(), permissions });
      setMessage(result.data.message); reset(); await load();
    } catch (err) { setError(api.isAxiosError(err) ? err.response?.data?.message || "Unable to save this manager." : "Unable to save this manager."); }
    finally { setBusy(false); }
  }
  async function toggle(user: StaffUser) {
    if (busy) return;
    setBusy(true); setMessage(""); setError("");
    try { const { data } = await api.patch(`${process.env.NEXT_PUBLIC_API_BASE}/api/staff/${user.id}`, { enabled: !user.enabled }); setMessage(data.message); await load(); }
    catch { setError("Unable to change manager access. Please try again."); }
    finally { setBusy(false); }
  }
  if (session?.role !== "owner") return null;
  return <div className="mx-auto max-w-7xl space-y-7">
    <header><h1 className="text-3xl font-semibold">Staff users</h1><p className="mt-2 max-w-3xl leading-7 text-slate-300">Give each manager their own email login and selected permissions. They verify their own email and set a password at first sign-in. Only owners can manage staff and read activity history.</p></header>
    {error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-4">{error}</p>}
    {message && <p role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-4">{message}</p>}
    <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 rounded-xl border border-slate-700 bg-[#101827] p-5"><h2 className="text-xl font-semibold">Administrator accounts</h2><p className="mt-2 text-sm text-slate-400">Disabling a manager or changing permissions invalidates their sessions and pending sign-in codes.</p>
        {loading ? <p role="status" className="py-8">Loading accounts…</p> : users.length === 0 ? <p className="py-8 text-slate-400">No staff accounts found.</p> : <ul className="mt-5 divide-y divide-slate-700">{users.map(user => <li key={user.id} className="py-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{user.fullName} <span className="ml-2 rounded bg-slate-700 px-2 py-1 text-xs capitalize">{user.role}</span></p><p className="mt-2 break-all text-sm text-slate-300">{user.email}</p><p className="mt-2 text-xs text-slate-400">{user.enabled ? user.setupComplete ? "Active" : "Awaiting first sign-in" : "Disabled"} · Last sign-in: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }) + " Dubai" : "Not signed in yet"}</p></div>
          {user.role === "manager" && <div className="flex gap-3 text-sm"><button type="button" disabled={busy} onClick={() => edit(user)} className="rounded border border-slate-500 px-3 py-2 disabled:opacity-50">Edit permissions</button><button type="button" disabled={busy} onClick={() => toggle(user)} className="rounded border border-slate-500 px-3 py-2 disabled:opacity-50">{user.enabled ? "Disable" : "Enable"}</button></div>}</div>
          <p className="mt-3 text-sm text-slate-400">{user.role === "owner" ? "All permissions, staff management and activity history" : user.permissions.map(permission => managerPermissions[permission]).join(" · ")}</p>
        </li>)}</ul>}
        {pages > 1 && <div className="mt-4 flex items-center justify-between text-sm"><button disabled={page === 1 || loading} onClick={() => setPage(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages || loading} onClick={() => setPage(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button></div>}
      </section>
      <form onSubmit={save} className="space-y-5 rounded-xl border border-slate-700 bg-[#101827] p-6"><h2 className="text-xl font-semibold">{editing ? "Edit manager" : "Add manager"}</h2>
        <label className="block text-sm">Full name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={event => setName(event.target.value)} className={fieldClass} /></label>
        <label className="block text-sm">Manager email<input required type="email" maxLength={254} autoComplete="email" disabled={!!editing} value={email} onChange={event => setEmail(event.target.value)} className={`${fieldClass} disabled:opacity-60`} /></label>
        <fieldset><legend className="mb-3 text-sm font-semibold">Allowed access</legend><div className="space-y-3">{Object.entries(managerPermissions).map(([key, label]) => <label key={key} className="flex items-start gap-3 text-sm"><input type="checkbox" checked={permissions.includes(key as AdminPermission)} onChange={event => setPermissions(previous => event.target.checked ? [...previous, key as AdminPermission] : previous.filter(value => value !== key))} className="mt-0.5 h-4 w-4 accent-[#d6b659]" /><span>{label}</span></label>)}</div></fieldset>
        <p className="text-xs leading-5 text-slate-400">Finance permission includes payment approvals and balance operations. Managers cannot grant access to other staff.</p>
        <button type="submit" disabled={busy || !permissions.length} className="w-full rounded-lg bg-[#d6b659] px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Saving…" : editing ? "Save manager permissions" : "Add manager"}</button>
        {editing && <button type="button" disabled={busy} onClick={reset} className="w-full text-sm underline">Cancel editing</button>}
      </form>
    </div>
  </div>;
}
