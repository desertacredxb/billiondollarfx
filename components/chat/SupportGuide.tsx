"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { MessageCircle, X, ChevronLeft, ArrowRight, Sparkles } from "lucide-react";
import { chatCopy, chatGuideHref, chatLanguages, chatTopics, searchChatQuestions, type ChatLanguage, type TopicId } from "../../lib/supportChat";
import { chatSessionCopy } from "../../lib/chatSessionCopy";
import { useSupportChatSession } from "./useSupportChatSession";
import ChatContactForm from "./ChatContactForm";
import BuddyMascot from "./BuddyMascot";
import { useBuddyCompanion } from "./useBuddyCompanion";
import { buddyActionHref, buddyCopy, buddyQuestion } from "../../lib/bdfxBuddy";

export default function SupportGuide() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>("en");
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const tracking = useSupportChatSession();
  const { record } = tracking;
  const sessionCopy = chatSessionCopy[language];
  const launcher = useRef<HTMLButtonElement>(null);
  const languageInput = useRef<HTMLSelectElement>(null);
  const copy = chatCopy[language];
  const buddy = useBuddyCompanion(open);
  const companionCopy = buddyCopy[language];
  const floating = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CSSProperties>();
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("bdfx_buddy_language");
      if (chatLanguages.some(item => item.id === saved)) setLanguage(saved as ChatLanguage);
    } catch { /* Keep the default language when storage is unavailable. */ }
  }, []);
  useLayoutEffect(() => {
    const anchor = !open && buddy.cue?.anchor;
    if (!anchor) { setPosition(undefined); return; }
    const place = () => {
      if (window.innerWidth < 768 || !floating.current) { setPosition(undefined); return; }
      const bounds = floating.current.getBoundingClientRect();
      let left = anchor.x + 24, top = anchor.y + 24;
      if (left + bounds.width > window.innerWidth - 12) left = anchor.x - bounds.width - 20;
      if (top + bounds.height > window.innerHeight - 12) top = anchor.y - bounds.height - 20;
      setPosition({ left: Math.max(12, Math.min(left, window.innerWidth - bounds.width - 12)), top: Math.max(12, Math.min(top, window.innerHeight - bounds.height - 12)), right: "auto", bottom: "auto" });
    };
    place(); window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, buddy.cue, language]);
  useEffect(() => {
    if (!open) return;
    languageInput.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { record("close", language); setOpen(false); launcher.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, language, record]);
  const close = () => { tracking.record("close", language); buddy.dismiss(); setOpen(false); launcher.current?.focus(); };
  const showAnswer = (index: number) => {
    if (!open) tracking.record("open", language);
    setOpen(true); setAnswer(index); setTopic(chatTopics.find(item => item.questions.includes(index))?.id || null); setSearch("");
    tracking.record("answer", language, undefined, index);
  };
  const reset = () => { setTopic(null); setAnswer(null); setSearch(""); };
  const questions = search.trim() ? searchChatQuestions(language, search) : chatTopics.find(item => item.id === topic)?.questions || [];
  return <div ref={floating} style={position} data-bdfx-buddy className={"fixed bottom-6 right-6 z-[10000] text-slate-100 notranslate " + (!open ? "flex items-end gap-2" : "")} translate="no">
    {!open && buddy.cue && <section lang={language} aria-label="BDFX Buddy" className="max-h-[min(440px,calc(100dvh-9rem))] w-[260px] max-w-[calc(100vw-7rem)] overflow-y-auto rounded-[18px_18px_3px_18px] border border-[#dfc78f] bg-[#fff1d3] text-[#262b35] shadow-2xl">
      <header className="flex items-start gap-2 px-3 pt-3"><Sparkles size={15} className="mt-1 shrink-0 text-[#8c6d32]" /><h2 className="flex-1 text-xs font-semibold">{buddy.cue.kind === "issue" ? companionCopy.fix : "BDFX Buddy"}</h2><button type="button" aria-label={companionCopy.dismiss} onClick={buddy.dismiss} className="flex min-h-8 min-w-8 items-center justify-center rounded hover:bg-[#e7d5ad]"><X size={16} /></button></header>
      <div className="space-y-3 px-3 pb-3 text-[13px] leading-6">
        <p role={buddy.cue.kind === "issue" ? "status" : undefined}>{buddy.cue.guide ? companionCopy.guides[buddy.cue.guide] : buddy.cue.kind === "welcome" ? companionCopy.hello : buddy.cue.kind === "hover" ? copy.answers[buddy.cue.context.question] : companionCopy.nudge}</p>
        <div className="grid gap-2">
          {buddy.cue.kind === "issue" && buddy.hasField && <button type="button" onClick={buddy.focusField} className="min-h-10 rounded-lg bg-[#1b283d] px-3 py-2 text-left text-xs text-[#f8e6bb]">{companionCopy.field}</button>}
          <button type="button" onClick={() => showAnswer(buddy.cue!.guide ? buddyQuestion(buddy.cue!.guide) : buddy.cue!.context.question)} className="flex min-h-10 items-center justify-between gap-2 rounded-lg border border-[#b6a071] px-3 py-2 text-left text-xs hover:bg-[#e7d5ad]"><span>{copy.questions[buddy.cue.guide ? buddyQuestion(buddy.cue.guide) : buddy.cue.context.question]}</span><ArrowRight size={14} className="shrink-0" /></button>
          {!buddy.cue.guide && buddy.cue.context.topic === "account" && <button type="button" onClick={() => showAnswer(4)} className="min-h-10 rounded-lg border border-[#b6a071] px-3 py-2 text-left text-xs hover:bg-[#e7d5ad]">{copy.topics.deposit}</button>}
        </div>
        <button type="button" onClick={buddy.toggle} className="text-[11px] text-[#715b32] underline">{companionCopy.pause}</button>
      </div>
    </section>}
    {open && <section id="bdfx-support-guide" role="dialog" aria-modal="false" aria-labelledby="bdfx-support-title" lang={language} className="mb-3 flex max-h-[min(650px,calc(100dvh-11rem))] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#927948] bg-[#0a0f1c] shadow-2xl">
      <header className="flex items-start justify-between gap-3 border-b border-slate-700 bg-[#171d2b] p-4"><div><h2 id="bdfx-support-title" className="font-semibold">BDFX Buddy</h2><p className="mt-1 text-xs text-[#e3c569]">{copy.intro}</p></div><button type="button" onClick={close} aria-label={copy.close} className="rounded p-1 hover:bg-slate-700"><X size={20} /></button></header>
      <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3"><label className="text-sm" htmlFor="bdfx-chat-language">{copy.language}</label><select id="bdfx-chat-language" ref={languageInput} value={language} onChange={event => { const next = event.target.value as ChatLanguage; setLanguage(next); try { sessionStorage.setItem("bdfx_buddy_language", next); } catch { /* Optional preference. */ } setSearch(""); tracking.record("language", next); }} className="rounded border border-slate-600 bg-[#101827] p-2 text-sm">{chatLanguages.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="min-h-0 space-y-4 overflow-y-auto p-4">
        <p className="rounded-xl bg-[#172033] p-3 text-sm leading-6">{copy.greeting}</p>
        {buddy.cue?.kind === "issue" && buddy.cue.guide && <aside className="space-y-2 rounded-lg border border-[#927948] p-3 text-sm"><p role="status">{companionCopy.guides[buddy.cue.guide]}</p>{buddy.hasField && <button type="button" onClick={buddy.focusField} className="text-[#e3c569] underline">{companionCopy.field}</button>}<button type="button" onClick={buddy.dismiss} className="ml-3 text-[#e3c569] underline">{companionCopy.dismiss}</button></aside>}
        <div className="space-y-2 rounded-lg border border-slate-700 p-3 text-xs leading-5">
          {tracking.status === "saved" ? <><p>{sessionCopy.saved}</p><button type="button" onClick={() => { tracking.stop(); setContactOpen(false); }} className="text-[#e3c569] underline">{sessionCopy.stop}</button></> : <><p>{sessionCopy.notice}</p><button type="button" disabled={tracking.status === "starting"} onClick={() => { void tracking.start(language).catch(() => {}); }} className="text-[#e3c569] underline disabled:opacity-50">{tracking.status === "starting" ? sessionCopy.saving : sessionCopy.save}</button></>}
          {(tracking.status === "error" || tracking.warning) && <p role="status" className="text-amber-200">{sessionCopy.error}</p>}
          <Link href="/Privacy-Policy" className="ml-3 text-[#e3c569] underline">{sessionCopy.privacy}</Link>
        </div>
        {answer !== null ? <article aria-live="polite"><h3 className="text-sm font-semibold text-[#e3c569]">{copy.questions[answer]}</h3><p className="mt-3 text-sm leading-7 text-slate-200">{copy.answers[answer]}</p><Link href={chatGuideHref(answer)} onClick={() => tracking.record("guide", language, undefined, answer)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#d6b659] px-4 py-2 text-sm font-semibold text-black">{copy.guide}<ArrowRight size={16} /></Link>
          {buddyActionHref(answer) && <Link href={buddyActionHref(answer)!} onClick={() => { tracking.record("guide", language, undefined, answer); close(); }} className="ml-3 mt-4 inline-flex items-center gap-2 text-sm text-[#e3c569] underline">{companionCopy.next}<ArrowRight size={14} /></Link>}
          <div className="mt-4 grid gap-2">{(chatTopics.find(item => item.questions.includes(answer))?.questions || []).filter(index => index !== answer).map(index => <button key={index} type="button" onClick={() => showAnswer(index)} className="flex min-h-10 items-center justify-between gap-2 rounded-lg border border-slate-600 p-3 text-left text-sm hover:border-[#d6b659]">{copy.questions[index]}<ArrowRight size={14} className="shrink-0" /></button>)}</div>
        </article> : <>
          <input type="search" value={search} maxLength={100} onChange={event => setSearch(event.target.value)} aria-label={copy.search} placeholder={copy.search} className="w-full rounded-lg border border-slate-600 bg-[#101827] p-3 text-sm" />
          {!topic && !search.trim() ? <div className="grid gap-2">{chatTopics.map(item => <button key={item.id} type="button" onClick={() => { setTopic(item.id); setSearch(""); tracking.record("topic", language, item.id); }} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-3 text-left text-sm hover:border-[#d6b659]">{copy.topics[item.id]}<ArrowRight size={16} /></button>)}</div> : <div className="grid gap-2">{questions.map(index => <button key={index} type="button" onClick={() => { setAnswer(index); tracking.record("answer", language, undefined, index); }} className="rounded-lg border border-slate-700 px-3 py-3 text-left text-sm hover:border-[#d6b659]">{copy.questions[index]}</button>)}{!questions.length && <p role="status" className="text-sm text-slate-300">{copy.empty}</p>}</div>}
        </>}
        {(topic || answer !== null || search) && <button type="button" onClick={() => { if (answer !== null) setAnswer(null); else reset(); }} className="inline-flex items-center gap-1 text-sm text-[#e3c569]"><ChevronLeft size={16} />{copy.back}</button>}
        <div className="flex flex-wrap gap-3 border-t border-slate-700 pt-4 text-sm"><button type="button" onClick={reset} className="text-[#e3c569] underline">{copy.menu}</button><Link href="/contact" onClick={() => tracking.record("team", language)} className="text-[#e3c569] underline">{copy.team}</Link><button type="button" onClick={() => setContactOpen(value => !value)} aria-expanded={contactOpen} className="text-[#e3c569] underline">{sessionCopy.details}</button></div>
        {contactOpen && <ChatContactForm language={language} submit={tracking.contact} />}
        <p className="text-xs leading-5 text-slate-400">{copy.privacy}</p>
        {buddy.context && <button type="button" onClick={buddy.toggle} className="text-xs text-[#e3c569] underline">{buddy.enabled ? companionCopy.pause : companionCopy.resume}</button>}
      </div>
    </section>}
    <button ref={launcher} type="button" onClick={() => { tracking.record(open ? "close" : "open", language); if (open) buddy.dismiss(); setOpen(value => !value); }} aria-label={open ? copy.close : companionCopy.ask} aria-expanded={open} aria-controls="bdfx-support-guide" className="ml-auto flex shrink-0 flex-col items-center rounded-xl px-1 pb-1 text-[11px] text-[#f1d697] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c569]"><BuddyMascot concerned={buddy.cue?.kind === "issue"} /><span className="rounded-full border border-[#927948] bg-[#101827] px-2 py-1"><MessageCircle size={12} className="mr-1 inline" />BDFX Help</span></button>
  </div>;
}
