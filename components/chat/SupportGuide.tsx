"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, ChevronLeft, ArrowRight } from "lucide-react";
import { chatCopy, chatGuideHref, chatLanguages, chatTopics, searchChatQuestions, type ChatLanguage, type TopicId } from "../../lib/supportChat";

export default function SupportGuide() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>("en");
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const launcher = useRef<HTMLButtonElement>(null);
  const languageInput = useRef<HTMLSelectElement>(null);
  const copy = chatCopy[language];
  useEffect(() => {
    if (!open) return;
    languageInput.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); launcher.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const close = () => { setOpen(false); launcher.current?.focus(); };
  const reset = () => { setTopic(null); setAnswer(null); setSearch(""); };
  const questions = search.trim() ? searchChatQuestions(language, search) : chatTopics.find(item => item.id === topic)?.questions || [];
  return <div className="fixed bottom-6 right-6 z-[10000] text-slate-100 notranslate" translate="no">
    {open && <section id="bdfx-support-guide" role="dialog" aria-modal="false" aria-labelledby="bdfx-support-title" lang={language} className="mb-3 flex max-h-[min(650px,calc(100dvh-7rem))] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#927948] bg-[#0a0f1c] shadow-2xl">
      <header className="flex items-start justify-between gap-3 border-b border-slate-700 bg-[#171d2b] p-4"><div><h2 id="bdfx-support-title" className="font-semibold">Billion Dollar FX</h2><p className="mt-1 text-xs text-[#e3c569]">{copy.intro}</p></div><button type="button" onClick={close} aria-label={copy.close} className="rounded p-1 hover:bg-slate-700"><X size={20} /></button></header>
      <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3"><label className="text-sm" htmlFor="bdfx-chat-language">{copy.language}</label><select id="bdfx-chat-language" ref={languageInput} value={language} onChange={event => { setLanguage(event.target.value as ChatLanguage); setSearch(""); }} className="rounded border border-slate-600 bg-[#101827] p-2 text-sm">{chatLanguages.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="min-h-0 space-y-4 overflow-y-auto p-4">
        <p className="rounded-xl bg-[#172033] p-3 text-sm leading-6">{copy.greeting}</p>
        {answer !== null ? <article aria-live="polite"><h3 className="text-sm font-semibold text-[#e3c569]">{copy.questions[answer]}</h3><p className="mt-3 text-sm leading-7 text-slate-200">{copy.answers[answer]}</p><Link href={chatGuideHref(answer)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#d6b659] px-4 py-2 text-sm font-semibold text-black">{copy.guide}<ArrowRight size={16} /></Link></article> : <>
          <input type="search" value={search} maxLength={100} onChange={event => setSearch(event.target.value)} aria-label={copy.search} placeholder={copy.search} className="w-full rounded-lg border border-slate-600 bg-[#101827] p-3 text-sm" />
          {!topic && !search.trim() ? <div className="grid gap-2">{chatTopics.map(item => <button key={item.id} type="button" onClick={() => { setTopic(item.id); setSearch(""); }} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-3 text-left text-sm hover:border-[#d6b659]">{copy.topics[item.id]}<ArrowRight size={16} /></button>)}</div> : <div className="grid gap-2">{questions.map(index => <button key={index} type="button" onClick={() => setAnswer(index)} className="rounded-lg border border-slate-700 px-3 py-3 text-left text-sm hover:border-[#d6b659]">{copy.questions[index]}</button>)}{!questions.length && <p role="status" className="text-sm text-slate-300">{copy.empty}</p>}</div>}
        </>}
        {(topic || answer !== null || search) && <button type="button" onClick={() => { if (answer !== null) setAnswer(null); else reset(); }} className="inline-flex items-center gap-1 text-sm text-[#e3c569]"><ChevronLeft size={16} />{copy.back}</button>}
        <div className="flex flex-wrap gap-3 border-t border-slate-700 pt-4 text-sm"><button type="button" onClick={reset} className="text-[#e3c569] underline">{copy.menu}</button><Link href="/contact" className="text-[#e3c569] underline">{copy.team}</Link></div>
        <p className="text-xs leading-5 text-slate-400">{copy.privacy}</p>
      </div>
    </section>}
    <button ref={launcher} type="button" onClick={() => setOpen(value => !value)} aria-label="Open BDFX support chat" aria-expanded={open} aria-controls="bdfx-support-guide" className="ml-auto flex h-14 items-center gap-2 rounded-full border border-[#e3c569] bg-[#927948] px-4 text-sm font-semibold text-white shadow-xl"><MessageCircle size={23} /><span>BDFX Help</span></button>
  </div>;
}
