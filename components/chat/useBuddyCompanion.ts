"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BUDDY_ISSUE_EVENT, buddyContext, buddyField, buddyLinkContext, isBuddyGuide, type BuddyContext, type BuddyGuide } from "../../lib/bdfxBuddy";

export type BuddyCue = {
  kind: "welcome" | "idle" | "hover" | "issue";
  guide?: BuddyGuide;
  context: BuddyContext;
  anchor?: { x: number; y: number };
};
const read = (key: string) => { try { return sessionStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { sessionStorage.setItem(key, value); } catch { /* Help also works with storage blocked. */ } };

export function useBuddyCompanion(open: boolean) {
  const pathname = usePathname() || "/";
  const context = useMemo(() => buddyContext(pathname), [pathname]);
  const [enabled, setEnabled] = useState(true);
  const [cue, setCue] = useState<BuddyCue | null>(null);
  const mutedUntil = useRef(0), proactiveCount = useRef(0), invalidAt = useRef(0);
  const field = useRef<HTMLElement | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHover = useCallback(() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); hoverTimer.current = null; }, []);
  useEffect(() => {
    setEnabled(read("bdfx_buddy_paused") !== "1");
    mutedUntil.current = Number(read("bdfx_buddy_muted_until")) || 0;
    proactiveCount.current = Number(read("bdfx_buddy_prompts")) || 0;
  }, []);
  useEffect(() => { setCue(null); field.current = null; clearHover(); }, [pathname, clearHover]);
  useEffect(() => { if (open) { clearHover(); setCue(current => current?.kind === "issue" ? current : null); } }, [open, clearHover]);
  const dismiss = useCallback(() => {
    clearHover(); setCue(null); field.current = null;
    mutedUntil.current = Date.now() + 90_000;
    write("bdfx_buddy_muted_until", String(mutedUntil.current));
  }, [clearHover]);
  const toggle = useCallback(() => {
    setEnabled(current => { const next = !current; write("bdfx_buddy_paused", next ? "0" : "1"); return next; });
    clearHover(); setCue(null);
  }, [clearHover]);
  const focusField = useCallback(() => {
    const target = field.current;
    if (target?.isConnected) { target.focus(); target.scrollIntoView({ block: "nearest", behavior: "auto" }); }
  }, []);
  useEffect(() => {
    if (!enabled || !context) return;
    const interactive = () => document.visibilityState === "visible" && document.hasFocus();
    const editing = () => document.activeElement instanceof HTMLElement && !!document.activeElement.closest("input,select,textarea,[contenteditable=true]");
    const canSuggest = () => !open && interactive() && !editing() && Date.now() >= mutedUntil.current && proactiveCount.current < 2;
    let lastIdleReset = 0;
    let idleTimer: ReturnType<typeof setTimeout>;
    const suggest = (kind: "welcome" | "idle") => {
      if (!canSuggest()) return;
      proactiveCount.current++; write("bdfx_buddy_prompts", String(proactiveCount.current));
      setCue(current => current || { kind, context });
    };
    const resetIdle = () => {
      if (Date.now() - lastIdleReset < 1500) return;
      lastIdleReset = Date.now(); clearTimeout(idleTimer);
      idleTimer = setTimeout(() => suggest("idle"), 45_000);
    };
    const welcomeTimer = setTimeout(() => suggest("welcome"), 9000);
    resetIdle();
    const describeTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element) || target.closest("[data-bdfx-buddy]")) return null;
      const control = target.closest<HTMLElement>("input,select,textarea,[data-bdfx-guide]");
      if (control) {
        const guide = buddyField(control.getAttribute("name") || "", control.getAttribute("type") || "", control.getAttribute("data-bdfx-guide"));
        if (guide) return { target: control, guide };
      }
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (link && link.origin === window.location.origin) {
        const linkContext = buddyLinkContext(link.pathname);
        if (linkContext) return { target: link, guide: undefined, context: linkContext };
      }
      return null;
    };
    const showHover = (target: EventTarget | null, anchor?: { x: number; y: number }) => {
      if (open || Date.now() < mutedUntil.current) return;
      const info = describeTarget(target);
      if (!info) return;
      clearHover();
      hoverTimer.current = setTimeout(() => {
        if (!info.target.isConnected || !interactive()) return;
        field.current = info.target;
        setCue(current => current?.kind === "issue" ? current : { kind: "hover", guide: info.guide, context: info.context || context, anchor });
      }, 500);
    };
    const over = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      showHover(event.target, { x: event.clientX, y: event.clientY });
    };
    const out = () => clearHover();
    const focus = (event: FocusEvent) => showHover(event.target);
    const invalid = (event: Event) => {
      if (Date.now() - invalidAt.current < 350) return;
      const info = describeTarget(event.target);
      if (!info?.guide) return;
      invalidAt.current = Date.now(); clearHover(); field.current = info.target;
      const validity = (info.target as HTMLInputElement).validity;
      setCue({ kind: "issue", guide: validity?.valueMissing ? "required" : info.guide, context });
    };
    const issue = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isBuddyGuide(event.detail?.guide)) return;
      clearHover();
      field.current = Array.from(document.querySelectorAll<HTMLElement>("input,select,textarea")).find(control =>
        buddyField(control.getAttribute("name") || "", control.getAttribute("type") || "", control.getAttribute("data-bdfx-guide")) === event.detail.guide
      ) || null;
      setCue({ kind: "issue", guide: event.detail.guide, context });
    };
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    document.addEventListener("focusin", focus);
    document.addEventListener("invalid", invalid, true);
    document.addEventListener("pointermove", resetIdle, { passive: true });
    document.addEventListener("keydown", resetIdle, { passive: true });
    window.addEventListener(BUDDY_ISSUE_EVENT, issue);
    return () => {
      clearTimeout(welcomeTimer); clearTimeout(idleTimer); clearHover();
      document.removeEventListener("pointerover", over); document.removeEventListener("pointerout", out);
      document.removeEventListener("focusin", focus); document.removeEventListener("invalid", invalid, true);
      document.removeEventListener("pointermove", resetIdle); document.removeEventListener("keydown", resetIdle);
      window.removeEventListener(BUDDY_ISSUE_EVENT, issue);
    };
  }, [context, enabled, open, clearHover]);
  return { context, enabled, cue, dismiss, toggle, focusField, hasField: !!field.current?.isConnected };
}
