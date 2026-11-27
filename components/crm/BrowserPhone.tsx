"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import type { SimpleUser } from "sip.js/lib/platform/web";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, fieldClass, secondaryClass, type BrowserDial } from "../../lib/crm";

const domain = "sip.rpdigitalphone.com";
type Call = { controller: AbortController; invited: boolean; stopTone?: () => void; rejected?: string };
export type PhoneControls = { dial: BrowserDial };

// Play local ringback only after the provider signals ringing. 183 with SDP carries provider audio.
function ring(context: AudioContext) {
  const tone = context.createOscillator();
  const volume = context.createGain();
  tone.frequency.value = 425;
  volume.gain.value = 0;
  tone.connect(volume).connect(context.destination);
  const pulse = () => {
    volume.gain.setValueAtTime(0.055, context.currentTime);
    volume.gain.setValueAtTime(0, context.currentTime + 1);
  };
  tone.start();
  pulse();
  const timer = window.setInterval(pulse, 4000);
  return () => { window.clearInterval(timer); tone.stop(); tone.disconnect(); volume.disconnect(); };
}

export default function BrowserPhone({ user, controls }: { user: string; controls: Ref<PhoneControls> }) {
  const [connection, setConnection] = useState<"offline" | "connecting" | "ready">("offline");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);
  const password = useRef<HTMLInputElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const context = useRef<AudioContext | null>(null);
  const phone = useRef<SimpleUser | null>(null);
  const attempt = useRef<Call | null>(null);
  const lifecycle = useRef(0);
  const registered = useRef(false);
  const connecting = useRef(false);
  const registerTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function finish(text: string) {
    attempt.current?.controller.abort();
    attempt.current?.stopTone?.();
    attempt.current = null;
    setActive(false);
    setPlayBlocked(false);
    setMessage(text);
  }

  function disconnect(text: string) {
    lifecycle.current++;
    clearTimeout(registerTimeout.current);
    registered.current = false;
    connecting.current = false;
    const old = phone.current;
    phone.current = null;
    if (old) { old.delegate = undefined; void old.disconnect().catch(() => {}); }
    setConnection("offline");
    finish(text);
  }

  useEffect(() => {
    function close() {
      lifecycle.current++;
      clearTimeout(registerTimeout.current);
      registered.current = false;
      connecting.current = false;
      attempt.current?.controller.abort();
      attempt.current?.stopTone?.();
      attempt.current = null;
      const old = phone.current;
      phone.current = null;
      if (old) { old.delegate = undefined; void old.disconnect().catch(() => {}); }
      if (context.current) void context.current.close().catch(() => {});
      context.current = null;
    }
    // pagehide also runs when a browser puts this page in its back/forward cache.
    const onHide = () => { close(); setConnection("offline"); setActive(false); setMessage(""); };
    window.addEventListener("pagehide", onHide);
    return () => { window.removeEventListener("pagehide", onHide); close(); };
  }, []);

  async function connect() {
    if (!password.current?.value || !audio.current || connecting.current || phone.current) return;
    const secret = password.current.value;
    password.current.value = "";
    connecting.current = true;
    const generation = ++lifecycle.current;
    const current = () => lifecycle.current === generation;
    setConnection("connecting");
    setMessage("Checking microphone…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      if (!current()) return;
      const { SimpleUser } = await import("sip.js/lib/platform/web");
      if (!current() || !audio.current) return;
      const client = new SimpleUser("wss://" + domain + ":5000/ws", {
        aor: "sip:" + user + "@" + domain,
        media: { constraints: { audio: true, video: false }, remote: { audio: audio.current } },
        reconnectionAttempts: 0,
        userAgentOptions: { authorizationUsername: user, authorizationPassword: secret, logBuiltinEnabled: false },
      });
      phone.current = client;
      client.delegate = {
        onRegistered() {
          if (!current()) return;
          clearTimeout(registerTimeout.current);
          registered.current = true;
          connecting.current = false;
          setConnection("ready");
          if (!attempt.current) setMessage("Headset ready.");
        },
        onUnregistered() { if (current()) disconnect("Headset registration ended. Reconnect to call."); },
        onServerDisconnect() { if (current()) disconnect("Connection to 9ance was lost. Reconnect to call."); },
        onCallReceived() { void client.decline().catch(() => {}); },
        onCallAnswered() {
          if (!current() || !attempt.current) return;
          attempt.current.stopTone?.();
          attempt.current.stopTone = undefined;
          setMessage("Connected");
          void audio.current?.play().catch(() => { if (current() && attempt.current) setPlayBlocked(true); });
        },
        onCallHangup() {
          if (current() && attempt.current?.invited) finish(attempt.current.rejected || "Call ended.");
        },
      };
      setMessage("Connecting headset to 9ance…");
      registerTimeout.current = setTimeout(() => { if (current() && !registered.current) disconnect("9ance did not confirm headset registration."); }, 20000);
      await client.connect();
      if (current()) await client.register({ requestDelegate: { onReject: () => {
        if (current()) disconnect("9ance declined headset registration. Check your agent SIP login.");
      } } });
    } catch (err) {
      if (current()) disconnect(err instanceof DOMException && ["NotAllowedError", "NotFoundError", "NotReadableError"].includes(err.name)
        ? "Allow microphone access and check your headset in this browser."
        : "Could not connect the headset to 9ance.");
    }
  }

  const dial: BrowserDial = async target => {
    const client = phone.current;
    if (!client || !registered.current) {
      password.current?.focus();
      throw new Error("Connect your headset in the CRM first.");
    }
    if (attempt.current) throw new Error("Finish the current call first.");
    const call: Call = { controller: new AbortController(), invited: false };
    attempt.current = call;
    setActive(true);
    setMessage("Preparing call…");
    try {
      context.current ??= new AudioContext();
      await context.current.resume();
      if (attempt.current !== call) return;
      const { data } = await api.post<{ phone: string }>(crmApi + "/browser-dial", {
        ...target, sipUser: user, requestId: crypto.randomUUID(),
      }, { signal: call.controller.signal });
      if (attempt.current !== call) return;
      if (!/^\+[1-9]\d{6,14}$/.test(data.phone)) throw new Error("Invalid assigned number.");
      call.invited = true;
      setMessage("Dialing " + data.phone);
      await client.call("sip:" + data.phone.slice(1) + "@" + domain, { earlyMedia: true }, {
        requestDelegate: {
          onProgress: ({ message }) => {
            if (attempt.current !== call) return;
            if (message.statusCode === 180) {
              setMessage("Ringing " + data.phone);
              if (!call.stopTone && context.current) call.stopTone = ring(context.current);
            }
            if (message.statusCode === 183 && message.body) {
              call.stopTone?.();
              call.stopTone = undefined;
              setMessage("Connecting " + data.phone);
            }
          },
          onReject: ({ message }) => {
            if (attempt.current !== call) return;
            call.rejected = "9ance ended the attempt (SIP " + message.statusCode + ").";
            setMessage(call.rejected);
          },
        },
      });
    } catch (err) {
      if (attempt.current !== call) return;
      const text = crmError(err, "Could not start the call. Check the microphone and 9ance connection.");
      finish(text);
      throw new Error(text);
    }
  };
  useImperativeHandle(controls, () => ({ dial }));

  async function hangup() {
    const call = attempt.current;
    if (!call) return;
    if (!call.invited) { finish("Call cancelled."); return; }
    setMessage("Ending call…");
    try { await phone.current?.hangup(); }
    catch { if (attempt.current === call) disconnect("Headset disconnected to end the call."); }
  }

  return <section className={cardClass} aria-label="CRM headset">
    <h2 className="font-semibold">9ance headset</h2>
    <audio ref={audio} autoPlay />
    {connection === "offline" && <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); void connect(); }}>
      <label className="text-sm">SIP password for {user}
        <input ref={password} type="password" autoComplete="off" required maxLength={256} className={fieldClass + " mt-1 block"} />
      </label>
      <button className={buttonClass}>Connect headset</button>
    </form>}
    {message && <p role="status" className="mt-2 text-sm">{message}</p>}
    {active && <button type="button" onClick={hangup} className={secondaryClass + " mt-2"}>End call</button>}
    {playBlocked && <button type="button" className={secondaryClass} onClick={() => {
      void audio.current?.play().then(() => setPlayBlocked(false)).catch(() => setMessage("Check this tab’s audio permission."));
    }}>Enable speaker</button>}
    {connection !== "offline" && !active && <button type="button" className={secondaryClass + " mt-2"} onClick={() => disconnect("Headset disconnected.")}>Disconnect headset</button>}
  </section>;
}
