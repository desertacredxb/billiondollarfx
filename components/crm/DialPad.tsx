"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, fieldClass, hashmiMessage, secondaryClass, type HashmiResponse } from "../../lib/crm";

export default function DialPad() {
  const [phone, setPhone] = useState("");
  const [requestId, setRequestId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  function changePhone(value: string) {
    setPhone(value.slice(0, 40));
    setRequestId("");
    setResult("");
    setError("");
  }

  async function dial() {
    const key = requestId || crypto.randomUUID();
    setRequestId(key);
    setBusy(true);
    setError("");
    setResult("");
    try {
      const { data } = await api.post<HashmiResponse>(crmApi + "/dial-by-number", { phone: phone.trim(), requestId: key });
      if (data.state === "accepted") setResult(hashmiMessage(data));
      else setError(hashmiMessage(data));
      if (data.state === "accepted" || data.state === "rejected") setRequestId("");
    } catch (error) { setError(crmError(error, "The call request could not be confirmed.")); }
    finally { setBusy(false); }
  }

  return <details className={cardClass}>
    <summary className="cursor-pointer font-semibold">Dial pad</summary>
    <form className="mt-4 max-w-xs space-y-3" onSubmit={event => { event.preventDefault(); void dial(); }}>
      <label className="block text-sm">Assigned lead number with country code
        <input type="tel" className={fieldClass + " mt-1"} value={phone} maxLength={40} required disabled={busy} onChange={event => changePhone(event.target.value)} />
      </label>
      <div className="grid grid-cols-3 gap-2" aria-label="Phone keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "0", "Backspace"].map(key =>
          <button key={key} type="button" className={secondaryClass} disabled={busy} onClick={() => changePhone(key === "Backspace" ? phone.slice(0, -1) : phone + key)}>{key}</button>)}
      </div>
      <button type="submit" className={buttonClass + " inline-flex items-center gap-2"} disabled={busy || !phone.trim()}>
        <Phone size={16} /> {busy ? "Requesting call…" : "Call via Hashmi"}
      </button>
      {result && <p role="status" className="text-sm text-emerald-300">{result}</p>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </form>
  </details>;
}
