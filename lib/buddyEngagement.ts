import type { ChatLanguage } from "./supportChat";
type EngagementCopy = { title: string; subtitle: string; launcher: string; start: string; mt5: string; support: string; choose: string; chat: string };
export const buddyEngagementCopy: Record<ChatLanguage, EngagementCopy> = {
  en: { title: "Hi, I’m Buddy 👋", subtitle: "Your next step, made simple.", launcher: "Let’s find your next step", start: "Help me get started", mt5: "Explore MT5", support: "I need some help", choose: "Choose your language", chat: "Chat with Buddy" },
  hi: { title: "नमस्ते, मैं Buddy हूँ 👋", subtitle: "हर कदम पर आसान मदद।", launcher: "अगला कदम साथ समझें", start: "शुरू करने में मदद करें", mt5: "MT5 के बारे में जानें", support: "मुझे मदद चाहिए", choose: "अपनी भाषा चुनें", chat: "Buddy से बात करें" },
  bn: { title: "হ্যালো, আমি Buddy 👋", subtitle: "আপনার পরবর্তী ধাপ আরও সহজ।", launcher: "পরবর্তী ধাপ একসঙ্গে জানুন", start: "শুরু করতে সাহায্য করুন", mt5: "MT5 সম্পর্কে জানুন", support: "আমার সাহায্য দরকার", choose: "আপনার ভাষা বেছে নিন", chat: "Buddy-র সঙ্গে কথা বলুন" },
  th: { title: "สวัสดี ฉันคือ Buddy 👋", subtitle: "ช่วยให้ขั้นตอนต่อไปง่ายขึ้น", launcher: "มาดูขั้นตอนต่อไปกัน", start: "ช่วยฉันเริ่มต้น", mt5: "รู้จัก MT5", support: "ฉันต้องการความช่วยเหลือ", choose: "เลือกภาษาของคุณ", chat: "คุยกับ Buddy" },
  vi: { title: "Chào bạn, tôi là Buddy 👋", subtitle: "Giúp bước tiếp theo dễ dàng hơn.", launcher: "Cùng tìm bước tiếp theo", start: "Giúp tôi bắt đầu", mt5: "Khám phá MT5", support: "Tôi cần hỗ trợ", choose: "Chọn ngôn ngữ của bạn", chat: "Trò chuyện với Buddy" },
  id: { title: "Halo, saya Buddy 👋", subtitle: "Langkah berikutnya jadi mudah.", launcher: "Temukan langkah berikutnya", start: "Bantu saya mulai", mt5: "Jelajahi MT5", support: "Saya perlu bantuan", choose: "Pilih bahasa Anda", chat: "Chat dengan Buddy" },
};
export function buddyStarterQuestions(question: number) {
  return [...new Set([question, question === 8 ? 0 : 8, 12])];
}
