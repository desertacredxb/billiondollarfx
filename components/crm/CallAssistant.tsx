"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import api from "../../lib/apiClient";
import { buttonClass, cardClass, crmApi, crmError, fieldClass, secondaryClass } from "../../lib/crm";

const MAX_RECORDING_MS = 20_000;
const HELP_CENTRE = "https://www.billiondollarfx.com/help-centre";
const audioFormats = ["audio/webm", "audio/mp4", "audio/ogg"];
type VoiceState = "idle" | "starting" | "recording" | "transcribing";
type Source = { url: string; title: string; end: number };
type AssistantReply = { reply: string; sources?: Source[] };

export default function CallAssistant() {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<(AssistantReply & { question: string })[]>([]);
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const microphone = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const voiceGeneration = useRef(0);

  function releaseMicrophone() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    microphone.current?.getTracks().forEach(track => track.stop());
    microphone.current = null;
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      voiceGeneration.current++;
      if (recorder.current) {
        recorder.current.onstop = null;
        if (recorder.current.state !== "inactive") recorder.current.stop();
      }
      releaseMicrophone();
    };
  }, []);

  async function transcribe(chunks: Blob[], format: string) {
    if (!mounted.current) return;
    try {
      const type = format.split(";")[0];
      const blob = new Blob(chunks, { type });
      if (!blob.size) throw new Error("No speech was recorded. Try again or type your question.");
      const data = new FormData();
      data.append("audio", blob, "question." + type.split("/")[1]);
      const response = await api.post<{ text: string }>(crmApi + "/assistant/transcribe", data);
      if (mounted.current) setQuestion(response.data.text);
    } catch (error) {
      if (mounted.current) setError(crmError(error, "Voice input could not be transcribed. You can type your question."));
    } finally {
      if (mounted.current) setVoice("idle");
    }
  }

  function stopVoice() {
    if (recorder.current?.state !== "recording") return;
    setVoice("transcribing");
    recorder.current.stop();
    releaseMicrophone();
  }

  function discardVoice() {
    if (voice !== "starting" && voice !== "recording") return;
    voiceGeneration.current++;
    if (recorder.current) {
      recorder.current.onstop = null;
      if (recorder.current.state !== "inactive") recorder.current.stop();
      recorder.current = null;
    }
    releaseMicrophone();
    setVoice("idle");
  }

  async function startVoice() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Microphone input is unavailable in this browser. You can type your question.");
      return;
    }
    const generation = ++voiceGeneration.current;
    setVoice("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
      if (!mounted.current || voiceGeneration.current !== generation) { stream.getTracks().forEach(track => track.stop()); return; }
      microphone.current = stream;
      const format = audioFormats.find(type => MediaRecorder.isTypeSupported(type));
      const current = new MediaRecorder(stream, format ? { mimeType: format } : undefined);
      const chunks: Blob[] = [];
      current.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      current.onstop = () => {
        recorder.current = null;
        releaseMicrophone();
        if (mounted.current) setVoice("transcribing");
        void transcribe(chunks, current.mimeType || chunks[0]?.type || "");
      };
      current.onerror = () => {
        current.onstop = null;
        releaseMicrophone();
        if (mounted.current) { setVoice("idle"); setError("Recording stopped. Try again or type your question."); }
      };
      recorder.current = current;
      current.start();
      setVoice("recording");
      timer.current = setTimeout(stopVoice, MAX_RECORDING_MS);
    } catch {
      if (mounted.current && voiceGeneration.current === generation) {
        releaseMicrophone();
        setVoice("idle");
        setError("Microphone access could not start. Allow microphone access or type your question.");
      }
    }
  }

  async function ask() {
    const text = question.trim();
    if (!text || asking || voice !== "idle") return;
    setAsking(true);
    setError("");
    try {
      const { data } = await api.post<AssistantReply>(crmApi + "/assistant", { question: text });
      setTurns(previous => [{ question: text, reply: data.reply, sources: data.sources }, ...previous].slice(0, 5));
      setQuestion("");
    } catch (error) { setError(crmError(error, "The call assistant could not answer right now.")); }
    finally { setAsking(false); }
  }

  return <details className={cardClass} onToggle={event => { if (!event.currentTarget.open) discardVoice(); }}>
    <summary className="cursor-pointer font-semibold">BDFX Call assistant</summary>
    <form className="mt-4 space-y-3" onSubmit={event => { event.preventDefault(); void ask(); }}>
      <label className="block text-sm">Your question
        <textarea className={fieldClass + " mt-1"} rows={2} value={question} maxLength={1000} disabled={asking || voice !== "idle"} onChange={event => setQuestion(event.target.value)} />
      </label>
      <p className="text-sm text-slate-300">Ask about BDFX in your own words. Replies use the official website. Leave out client details.</p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={buttonClass} disabled={asking || voice !== "idle" || !question.trim()}>{asking ? "Getting reply…" : "Get suggested reply"}</button>
        <button type="button" className={secondaryClass + " inline-flex items-center gap-2"} disabled={asking || voice === "starting" || voice === "transcribing"} onClick={() => voice === "recording" ? stopVoice() : void startVoice()}>
          {voice === "recording" ? <><Square size={16} /> Stop recording</> : <><Mic size={16} /> {voice === "transcribing" ? "Transcribing…" : voice === "starting" ? "Starting microphone…" : "Speak question"}</>}
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-300">{error}{" "}
        <a href={HELP_CENTRE} target="_blank" rel="noopener noreferrer" className="text-slate-200 underline">BDFX Help Centre</a>
      </p>}
    </form>
    {turns.length > 0 && <div aria-live="polite" className="mt-4 space-y-4">
      {turns.map((turn, index) => {
        const characters = Array.from(turn.reply);
        const sources = turn.sources ?? [];
        return <article key={index} className="rounded-lg border border-slate-700 p-3">
          <p className="text-sm text-slate-300">{turn.question}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
            {sources.map((source, sourceIndex) => <Fragment key={source.url}>
              {characters.slice(sources[sourceIndex - 1]?.end ?? 0, source.end).join("")}
              {" "}<a className="text-amber-200 underline" href={source.url} target="_blank" rel="noopener noreferrer"
                title={source.title} aria-label={`Source ${sourceIndex + 1} ${source.title}`}>[{sourceIndex + 1}]</a>
            </Fragment>)}
            {characters.slice(sources.at(-1)?.end ?? 0).join("")}
          </p>
        </article>;
      })}
    </div>}
  </details>;
}
