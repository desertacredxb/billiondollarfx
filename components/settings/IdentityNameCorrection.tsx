import type { FormEvent } from "react";

interface Props {
  allowed: boolean;
  editing: boolean;
  busy: boolean;
  fullName: string;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: (event: FormEvent) => void;
  onCancel: () => void;
}

export default function IdentityNameCorrection({ allowed, editing, busy, fullName, onEdit, onChange, onSave, onCancel }: Props) {
  if (!allowed) return null;
  if (!editing) return <div className="space-y-2">
    <button type="button" disabled={busy} onClick={onEdit} className="rounded-lg border border-[#c6a15b] px-4 py-2 text-[#e7c985] disabled:opacity-50">Edit name &amp; resubmit</button>
    <p className="text-sm text-gray-300">Need to correct your name? Edit it to match your ID, save it, then resubmit verification.</p>
  </div>;
  return <form onSubmit={onSave} className="space-y-4 rounded-xl border border-gray-600 p-4">
    <h2 className="font-semibold">Enter your full name exactly as shown on your ID</h2>
    <p className="text-sm text-gray-300">For changes to address, email, mobile number, nationality or country of residence, contact WhatsApp support below.</p>
    <p className="text-sm text-amber-200">Saving your name requires a fresh identity check. Verification remains pending until the new check is approved.</p>
    <label className="block text-sm"><span>Full name as on ID</span><input name="fullName" value={fullName} required maxLength={150} disabled={busy} onChange={event => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-600 bg-[#10151f] p-3" /></label>
    <div className="flex gap-4"><button type="submit" disabled={busy} className="rounded-lg bg-[#c6a15b] px-4 py-2 font-semibold text-black disabled:opacity-50">{busy ? "Saving…" : "Save details"}</button><button type="button" disabled={busy} onClick={onCancel}>Cancel</button></div>
  </form>;
}
