"use client";
import { useCallback, useRef, useState } from "react";
import type { ChatLanguage, TopicId } from "../../lib/supportChat";
import { chatEvent, newChatCapability, supportChatRequest, type ChatCapability, type ChatContact, type ChatEventType } from "../../lib/supportChatSession";
export function useSupportChatSession() {
  const [status, setStatus] = useState<"idle" | "starting" | "saved" | "error">("idle");
  const [warning, setWarning] = useState(false);
  const active = useRef<ChatCapability | null>(null), candidate = useRef<ChatCapability | null>(null);
  const starting = useRef<Promise<ChatCapability> | null>(null), generation = useRef(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const start = useCallback((language: ChatLanguage): Promise<ChatCapability> => {
    if (active.current) return Promise.resolve(active.current);
    if (starting.current) return starting.current;
    const capability = candidate.current ||= newChatCapability(), version = generation.current;
    setStatus("starting"); setWarning(false);
    const pending: Promise<ChatCapability> = supportChatRequest("/sessions", { requestId: capability.id, secret: capability.secret, language, consent: true })
      .then(() => {
        if (version !== generation.current) throw new Error("Session saving stopped.");
        active.current = capability; setStatus("saved"); return capability;
      }).catch(error => { if (version === generation.current) { if (error?.status === 404) candidate.current = null; setStatus("error"); } throw error; })
      .finally(() => { if (starting.current === pending) starting.current = null; });
    starting.current = pending;
    return pending;
  }, []);
  const record = useCallback((type: ChatEventType, language: ChatLanguage, topic?: TopicId, question?: number) => {
    const capability = active.current;
    if (!capability) return;
    const payload = chatEvent(type, language, topic, question);
    queue.current = queue.current.then(async () => {
      if (active.current !== capability) return;
      try { await supportChatRequest(`/sessions/${capability.id}/events`, payload, capability); }
      catch (error) { if (active.current === capability) { setWarning(true); if (error instanceof Error && "status" in error && error.status === 404) { active.current = null; candidate.current = null; setStatus("error"); } } }
    });
  }, []);
  const stop = useCallback(() => {
    generation.current++; active.current = null; candidate.current = null; starting.current = null;
    setStatus("idle"); setWarning(false);
  }, []);
  const contact = useCallback(async (language: ChatLanguage, details: ChatContact) => {
    const capability = await start(language);
    await queue.current;
    if (active.current !== capability) throw new Error("Session saving stopped.");
    await supportChatRequest(`/sessions/${capability.id}/contact`, details, capability);
  }, [start]);
  return { status, warning, start, stop, record, contact };
}
