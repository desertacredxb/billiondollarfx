import { chatLanguages, chatTopics, type ChatLanguage, type TopicId } from "./supportChat";
export type ChatEventType = "open" | "close" | "language" | "topic" | "answer" | "guide" | "team";
export type ChatCapability = { id: string; secret: string };
export type ChatContact = { name: string; email: string; phone: string; country: string; privacyAccepted: boolean; website: string };
export function newChatCapability(): ChatCapability {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return { id: crypto.randomUUID(), secret: Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("") };
}
export function chatEvent(type: ChatEventType, language: ChatLanguage, topic?: TopicId, question?: number) {
  if (!["open", "close", "language", "topic", "answer", "guide", "team"].includes(type) || !chatLanguages.some(item => item.id === language)) throw new Error("Invalid support activity.");
  if (type === "topic" && !chatTopics.some(item => item.id === topic)) throw new Error("Invalid support topic.");
  if (["answer", "guide"].includes(type) && (!Number.isInteger(question) || question === undefined || question < 0 || question > 13)) throw new Error("Invalid support question.");
  return { eventId: crypto.randomUUID(), type, language, ...(type === "topic" ? { topic } : {}), ...(["answer", "guide"].includes(type) ? { question } : {}) };
}
export async function supportChatRequest(path: string, payload: object, capability?: ChatCapability) {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) throw new Error("Saved support sessions are temporarily unavailable.");
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 10000);
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/api/support-chat${path}`, {
      method: "POST", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", signal: abort.signal,
      headers: { "Content-Type": "application/json", ...(capability ? { "X-BDFX-Chat-Token": capability.secret } : {}) }, body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw Object.assign(new Error(typeof error.message === "string" && error.message.length < 300 ? error.message : "Unable to save this support request."), { status: response.status });
    }
  } finally { clearTimeout(timer); }
}
