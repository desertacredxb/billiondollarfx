"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, X, ChevronLeft, ArrowRight } from "lucide-react";
import logo from "../../assets/logo.webp";
import { chatCopy, chatGuideHref, chatLanguages, chatTopics, searchChatQuestions, type ChatLanguage, type TopicId } from "../../lib/supportChat";
import { chatSessionCopy } from "../../lib/chatSessionCopy";
import { useSupportChatSession } from "./useSupportChatSession";
import ChatContactForm from "./ChatContactForm";
import BuddyMascot from "./BuddyMascot";
import { useBuddyCompanion } from "./useBuddyCompanion";
import { buddyActionHref, buddyCopy, buddyQuestion } from "../../lib/bdfxBuddy";
import { buddyEngagementCopy, buddyStarterQuestions } from "../../lib/buddyEngagement";
import BuddyAiChat from "./BuddyAiChat";
import styles from "./BuddyEngagement.module.css";

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
  const engagement = buddyEngagementCopy[language];
  const floating = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CSSProperties>();
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("bdfx_buddy_language");
      const preferred = saved || navigator.language.split("-")[0];
      if (chatLanguages.some(item => item.id === preferred)) setLanguage(preferred as ChatLanguage);
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
  const chooseLanguage = (next: ChatLanguage) => {
    setLanguage(next); setSearch("");
    try { sessionStorage.setItem("bdfx_buddy_language", next); } catch { /* Optional preference. */ }
    tracking.record("language", next);
  };
  const questions = search.trim() ? searchChatQuestions(language, search) : chatTopics.find(item => item.id === topic)?.questions || [];
  return <div ref={floating} style={position} data-bdfx-buddy className={styles.root + " notranslate"} translate="no">
    {!open && buddy.cue && <section lang={language} aria-label="BDFX Buddy" className={styles.invitation}>
      <header className={styles.cardHeader}><Image src={logo} alt="BDFX" className={styles.logo} /><div><p className={styles.eyebrow}>BDFX BUDDY</p><h2 className={styles.title}>{buddy.cue.kind === "issue" ? companionCopy.fix : engagement.title}</h2></div><button type="button" aria-label={companionCopy.dismiss} onClick={buddy.dismiss} className={styles.dismiss}><X size={17} /></button></header>
      <div className={styles.cardBody}>
        <p role={buddy.cue.kind === "issue" ? "status" : undefined}>{buddy.cue.guide ? companionCopy.guides[buddy.cue.guide] : buddy.cue.kind === "welcome" ? companionCopy.hello : buddy.cue.kind === "hover" ? copy.answers[buddy.cue.context.question] : companionCopy.nudge}</p>
        <div className={styles.quickActions}>
          {buddy.cue.kind === "issue" && buddy.hasField && <button type="button" onClick={buddy.focusField} className={styles.quick}>{companionCopy.field}<ArrowRight size={14} /></button>}
          {(buddy.cue.guide ? [buddyQuestion(buddy.cue.guide)] : buddyStarterQuestions(buddy.cue.context.question)).map(question => <button key={question} type="button" onClick={() => showAnswer(question)} className={styles.quick}><span>{buddy.cue?.guide ? copy.questions[question] : question === 12 ? engagement.support : question === 8 ? engagement.mt5 : engagement.start}</span><ArrowRight size={15} className="shrink-0" /></button>)}
        </div>
        <div className={styles.preferences}><select aria-label={engagement.choose} value={language} onChange={event => chooseLanguage(event.target.value as ChatLanguage)} className={styles.select}>{chatLanguages.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><button type="button" onClick={buddy.toggle} className={styles.pause}>{companionCopy.pause}</button></div>
      </div>
    </section>}
    {open && <section id="bdfx-support-guide" role="dialog" aria-modal="false" aria-labelledby="bdfx-support-title" lang={language} className={styles.panel}>
      <header className="flex items-start justify-between gap-3 border-b border-slate-700 bg-[#171d2b] p-4"><Image src={logo} alt="BDFX" className={styles.logo} /><div className="flex-1"><h2 id="bdfx-support-title" className="font-semibold">BDFX Buddy</h2><p className="mt-1 text-xs text-[#e3c569]">{engagement.subtitle}</p></div><button type="button" onClick={close} aria-label={copy.close} className={styles.dismiss}><X size={20} /></button></header>
      <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3"><label className="text-sm" htmlFor="bdfx-chat-language">{copy.language}</label><select id="bdfx-chat-language" ref={languageInput} value={language} onChange={event => chooseLanguage(event.target.value as ChatLanguage)} className="rounded border border-slate-600 bg-[#101827] p-2 text-sm">{chatLanguages.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="min-h-0 space-y-4 overflow-y-auto p-4">
        <p className="rounded-xl bg-[#172033] p-3 text-sm leading-6">{copy.greeting}</p>
        {buddy.context && answer === null && <BuddyAiChat key={language} language={language} contextQuestion={answer} />}
        {buddy.cue?.kind === "issue" && buddy.cue.guide && <aside className="space-y-2 rounded-lg border border-[#927948] p-3 text-sm"><p role="status">{companionCopy.guides[buddy.cue.guide]}</p>{buddy.hasField && <button type="button" onClick={buddy.focusField} className="text-[#e3c569] underline">{companionCopy.field}</button>}<button type="button" onClick={buddy.dismiss} className="ml-3 text-[#e3c569] underline">{companionCopy.dismiss}</button></aside>}
        <details className="space-y-2 rounded-lg border border-slate-700 p-3 text-xs leading-5"><summary className="cursor-pointer text-[#e3c569]">{sessionCopy.save}</summary>
          {tracking.status === "saved" ? <><p>{sessionCopy.saved}</p><button type="button" onClick={() => { tracking.stop(); setContactOpen(false); }} className="text-[#e3c569] underline">{sessionCopy.stop}</button></> : <><p>{sessionCopy.notice}</p><button type="button" disabled={tracking.status === "starting"} onClick={() => { void tracking.start(language).catch(() => {}); }} className="text-[#e3c569] underline disabled:opacity-50">{tracking.status === "starting" ? sessionCopy.saving : sessionCopy.save}</button></>}
          {(tracking.status === "error" || tracking.warning) && <p role="status" className="text-amber-200">{sessionCopy.error}</p>}
          <Link href="/Privacy-Policy" className="ml-3 text-[#e3c569] underline">{sessionCopy.privacy}</Link>
        </details>
        {answer !== null ? <article aria-live="polite"><h3 className="text-sm font-semibold text-[#e3c569]">{copy.questions[answer]}</h3><p className="mt-3 text-sm leading-7 text-slate-200">{copy.answers[answer]}</p><Link href={chatGuideHref(answer)} onClick={() => tracking.record("guide", language, undefined, answer)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#d6b659] px-4 py-2 text-sm font-semibold text-black">{copy.guide}<ArrowRight size={16} /></Link>
          {buddyActionHref(answer) && <Link href={buddyActionHref(answer)!} onClick={() => { tracking.record("guide", language, undefined, answer); close(); }} className="ml-3 mt-4 inline-flex items-center gap-2 text-sm text-[#e3c569] underline">{companionCopy.next}<ArrowRight size={14} /></Link>}
          <div className="mt-4 grid gap-2">{(chatTopics.find(item => item.questions.includes(answer))?.questions || []).filter(index => index !== answer).map(index => <button key={index} type="button" onClick={() => showAnswer(index)} className="flex min-h-10 items-center justify-between gap-2 rounded-lg border border-slate-600 p-3 text-left text-sm hover:border-[#d6b659]">{copy.questions[index]}<ArrowRight size={14} className="shrink-0" /></button>)}</div>
        </article> : <>
          <input type="search" value={search} maxLength={100} onChange={event => setSearch(event.target.value)} aria-label={copy.search} placeholder={copy.search} className="w-full rounded-lg border border-slate-600 bg-[#101827] p-3 text-sm" />
          {!topic && !search.trim() ? <div className="grid gap-2">{chatTopics.map(item => <button key={item.id} type="button" onClick={() => { setTopic(item.id); setSearch(""); tracking.record("topic", language, item.id); }} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-3 text-left text-sm hover:border-[#d6b659]">{copy.topics[item.id]}<ArrowRight size={16} /></button>)}</div> : <div className="grid gap-2">{questions.map(index => <button key={index} type="button" onClick={() => { setAnswer(index); tracking.record("answer", language, undefined, index); }} className="rounded-lg border border-slate-700 px-3 py-3 text-left text-sm hover:border-[#d6b659]">{copy.questions[index]}</button>)}{!questions.length && <p role="status" className="text-sm text-slate-300">{copy.empty}</p>}</div>}
        </>}
        {(topic || answer !== null || search) && <button type="button" onClick={() => { if (answer !== null) setAnswer(null); else reset(); }} className="inline-flex items-center gap-1 text-sm text-[#e3c569]"><ChevronLeft size={16} />{copy.back}</button>}
        {buddy.context && answer !== null && <BuddyAiChat key={language} language={language} contextQuestion={answer} />}
        <div className="flex flex-wrap gap-3 border-t border-slate-700 pt-4 text-sm"><button type="button" onClick={reset} className="text-[#e3c569] underline">{copy.menu}</button><Link href="/contact" onClick={() => tracking.record("team", language)} className="text-[#e3c569] underline">{copy.team}</Link><button type="button" onClick={() => setContactOpen(value => !value)} aria-expanded={contactOpen} className="text-[#e3c569] underline">{sessionCopy.details}</button></div>
        {contactOpen && <ChatContactForm language={language} submit={tracking.contact} />}
        <p className="text-xs leading-5 text-slate-400">{copy.privacy}</p>
        {buddy.context && <button type="button" onClick={buddy.toggle} className="text-xs text-[#e3c569] underline">{buddy.enabled ? companionCopy.pause : companionCopy.resume}</button>}
      </div>
    </section>}
    <button ref={launcher} type="button" onClick={() => { tracking.record(open ? "close" : "open", language); if (open) buddy.dismiss(); setOpen(value => !value); }} aria-label={open ? copy.close : companionCopy.ask} aria-expanded={open} aria-controls="bdfx-support-guide" className={styles.launcher}><span className={styles.mascot}><BuddyMascot concerned={buddy.cue?.kind === "issue"} /></span><span className={styles.launcherText}><span className={styles.launcherName}>BDFX Buddy</span><span className={styles.launcherHint}>{engagement.launcher}</span></span><MessageCircle size={19} className={styles.launcherIcon} /></button>
  </div>;
}
