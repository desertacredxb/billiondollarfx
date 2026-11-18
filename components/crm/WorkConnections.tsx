"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../lib/apiClient";
import { cardClass, crmApi, crmError, fieldClass, secondaryClass } from "../../lib/crm";
type Settings = {
  telegram: boolean;
  whatsapp: boolean;
  bot: string | null;
  appId: string | null;
  configId: string | null;
  version: string;
  state: Record<string, string>;
};
type MetaSdk = {
  init(options: {
    appId: string;
    version: string;
    xfbml: boolean;
  }): void;
  login(done: (v: {
    authResponse?: {
      code?: string;
    };
  }) => void, options: Record<string, unknown>): void;
};
let sdkTask: Promise<MetaSdk> | undefined;
function loadSdk(settings: Settings) {
  if (!sdkTask)
    sdkTask = new Promise<MetaSdk>((resolve, reject) => {
      const w = window as Window & {
        FB?: MetaSdk;
        fbAsyncInit?: () => void;
      };
      function init() { if (w.FB && settings.appId) {
        w.FB.init({ appId: settings.appId, version: settings.version, xfbml: false });
        resolve(w.FB);
      } }
      if (w.FB) {
        init();
        return;
      }
      w.fbAsyncInit = init;
      const s = document.createElement("script");
      s.src = "https://connect.facebook.net/en_US/sdk.js";
      s.async = true;
      s.onerror = () => { sdkTask = undefined; reject(new Error("Meta sign-in could not load.")); };
      document.head.appendChild(s);
    });
  return sdkTask;
}
export default function WorkConnections({ owner }: {
  owner: boolean;
}) {
  const [s, set] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false), [consent, allow] = useState(false), [phone, number] = useState("");
  const [notice, notify] = useState(""), [link, setLink] = useState("");
  const [sdk, setSdk] = useState<MetaSdk | null>(null);
  const attempt = useRef<{
    code?: string;
    waba?: string;
    token: string;
    phone: string;
    submitting?: boolean;
    expires: number;
  } | null>(null);
  const refresh = useCallback(async () => { set((await api.get(crmApi + "/inbox/settings")).data); }, []);
  useEffect(() => { void refresh().catch(e => notify(crmError(e, "Could not read inbox connections."))); }, [refresh]);
  useEffect(() => {
    if (s?.whatsapp && consent && !owner)
      void loadSdk(s).then(setSdk).catch(e => notify(e.message));
  }, [s, consent, owner]);
  const finish = useCallback(async () => {
    const a = attempt.current;
    if (!a?.code || !a.waba || a.submitting || Date.now() > a.expires)
      return;
    a.submitting = true;
    try {
      await api.post(crmApi + "/inbox/whatsapp/finish", { code: a.code, waba: a.waba, token: a.token, phone: a.phone });
      notify("WhatsApp Business connected.");
    }
    catch (e) {
      notify(crmError(e, "Could not connect WhatsApp."));
    }
    finally {
      attempt.current = null;
      setBusy(false);
      void refresh().catch(() => { });
    }
  }, [refresh]);
  useEffect(() => {
    function metaEvent(e: MessageEvent) {
      if (!attempt.current || !["https://www.facebook.com", "https://web.facebook.com"].includes(e.origin))
        return;
      let data = e.data;
      try {
        if (typeof data === "string")
          data = JSON.parse(data);
      }
      catch {
        return;
      }
      if (data?.type !== "WA_EMBEDDED_SIGNUP")
        return;
      if (data.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING" && typeof data.data?.waba_id === "string") {
        attempt.current.waba = data.data.waba_id;
        void finish();
      }
      else if (["CANCEL", "ERROR"].includes(data.event)) {
        attempt.current = null;
        setBusy(false);
        notify("Meta connection was not completed.");
      }
    }
    window.addEventListener("message", metaEvent);
    return () => { window.removeEventListener("message", metaEvent); attempt.current = null; };
  }, [finish]);
  async function begin(channel: "telegram" | "whatsapp") {
    if (!consent || !s?.[channel])
      return;
    setBusy(true);
    notify("");
    setLink("");
    try {
      const { data } = await api.post(crmApi + "/inbox/connect/" + channel, { consent: true });
      if (channel === "telegram") {
        setLink(data.url);
        notify("Open the bot and press Start. Then add @" + s.bot + " to your Telegram Business chatbots and select work chats.");
      }
      else {
        attempt.current = { token: data.token, phone: phone.trim(), expires: Date.now() + 600000 };
        notify("Continue with Meta to authorize your work number.");
      }
    }
    catch (e) {
      notify(crmError(e, "Could not start connection."));
    }
    finally {
      setBusy(false);
    }
  }
  function openMeta() {
    if (!sdk || !s?.configId || !attempt.current)
      return;
    // Keep the provider popup on a direct user gesture, including on mobile Safari.
    sdk.login(result => {
      if (!attempt.current)
        return;
      if (!result.authResponse?.code) {
        notify("Meta sign-in was cancelled. You can try again.");
        return;
      }
      attempt.current.code = result.authResponse.code;
      void finish();
    }, { config_id: s.configId, response_type: "code", override_default_response_type: true,
      extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" } });
  }
  async function disconnect(channel: string) {
    try {
      await api.delete(crmApi + "/inbox/connect/" + channel);
      await refresh();
      setLink("");
      attempt.current = null;
      notify("Disconnected from the CRM. You can also remove access in the provider app.");
    }
    catch (e) {
      notify(crmError(e, "Could not disconnect."));
    }
  }
  return <details className={cardClass}>
  <summary className="cursor-pointer font-semibold">Work messaging accounts</summary>
  <div className="mt-3 space-y-3 text-sm">
   {owner ? <p>Open a lead to read messages shared by its assigned agent.</p> :
      <label className="flex items-start gap-2"><input type="checkbox" checked={consent} onChange={e => { allow(e.target.checked); if (!e.target.checked) {
        attempt.current = null;
        setLink("");
      } }}/>
    I agree to share messages with my assigned BDFX clients in this CRM. The BDFX owner can read client messages and my replies.</label>}
   {s && (["telegram", "whatsapp"] as const).map(channel => <div key={channel} className="flex flex-wrap items-center gap-2">
    <strong>{channel === "telegram" ? "Telegram" : "WhatsApp Business"}</strong>
    {channel === "whatsapp" && !s.whatsapp ? <>
      {!owner && <a className={secondaryClass} href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer">Open WhatsApp Web</a>}
      <span>{owner ? "Agents use WhatsApp Web on their own devices. Chats stay in WhatsApp." : "Scan the WhatsApp Web QR from Linked devices on your work phone. Chats stay in WhatsApp."}</span>
    </> : <span>{!s[channel] ? "Provider setup pending" : s.state[channel] || "Ready to connect"}</span>}
    {!owner && s[channel] && s.state[channel] !== "connected" && <>
     {channel === "whatsapp" && <input className={fieldClass} type="tel" value={phone} placeholder="Work number with +country code" aria-label="WhatsApp work number" onChange={e => number(e.target.value)}/>}
     <button className={secondaryClass} disabled={!consent || busy || (channel === "whatsapp" && (!sdk || !/^\+[1-9]\d{6,14}$/.test(phone.trim())))} onClick={() => void begin(channel)}>Connect</button>
    </>}
    {!owner && s.state[channel] && <button className={secondaryClass} onClick={() => void disconnect(channel)}>Disconnect</button>}
    {owner && channel === "telegram" && s.telegram && <button className={secondaryClass} onClick={async () => {
          try {
            const { data } = await api.post(crmApi + "/inbox/telegram/webhook");
            notify(data.saved ? "Telegram webhook verified." : "Telegram webhook still pending.");
          }
          catch (e) {
            notify(crmError(e, "Telegram setup could not finish."));
          }
        }}>Verify bot webhook</button>}
   </div>)}
   {link && <a href={link} target="_blank" rel="noopener noreferrer" className="underline">Open Telegram and press Start</a>}
   {consent && attempt.current && <button className={secondaryClass} onClick={openMeta}>Continue with Meta</button>}
   {notice && <p role="status">{notice}</p>}
  </div>
 </details>;
}
