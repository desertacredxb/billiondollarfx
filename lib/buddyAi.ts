import type { ChatLanguage } from "./supportChat";
type Copy = { title: string; consent: string; prompt: string; send: string; sending: string; unavailable: string; private: string; notice: string };
export const buddyAiCopy: Record<ChatLanguage, Copy> = {
  en: { title: "Ask Buddy AI", consent: "Share the question I type with n8n and its AI provider to answer it. This is separate from saving a support session.", prompt: "Ask a general website question", send: "Ask Buddy", sending: "Thinking…", unavailable: "AI help is unavailable right now. Use the guide above or contact support.", private: "Remove email addresses, phone/account numbers, codes and wallet details before sending.", notice: "Do not include passwords, OTPs, ID documents or account details. AI can make mistakes; account actions stay in your secure client area." },
  hi: { title: "Buddy AI से पूछें", consent: "मेरे लिखे सवाल का जवाब देने के लिए उसे n8n और उसके AI प्रदाता से साझा करें। यह सहायता सत्र सहेजने से अलग है।", prompt: "वेबसाइट के बारे में सामान्य सवाल पूछें", send: "Buddy से पूछें", sending: "जवाब तैयार हो रहा है…", unavailable: "AI सहायता अभी उपलब्ध नहीं है। ऊपर की गाइड या सहायता टीम का उपयोग करें।", private: "भेजने से पहले ईमेल, फोन/खाता नंबर, कोड और वॉलेट जानकारी हटाएँ।", notice: "पासवर्ड, OTP, पहचान दस्तावेज़ या खाते की जानकारी न लिखें। AI से गलती हो सकती है; खाते के काम सुरक्षित क्लाइंट क्षेत्र में करें।" },
  bn: { title: "Buddy AI-কে জিজ্ঞাসা করুন", consent: "উত্তরের জন্য আমার লেখা প্রশ্ন n8n ও তার AI প্রদানকারীর সঙ্গে ভাগ করুন। এটি সহায়তা সেশন সংরক্ষণ থেকে আলাদা।", prompt: "ওয়েবসাইট সম্পর্কে সাধারণ প্রশ্ন করুন", send: "Buddy-কে জিজ্ঞাসা করুন", sending: "উত্তর তৈরি হচ্ছে…", unavailable: "AI সহায়তা এখন উপলব্ধ নয়। উপরের গাইড বা সহায়তা দল ব্যবহার করুন।", private: "পাঠানোর আগে ইমেল, ফোন/অ্যাকাউন্ট নম্বর, কোড ও ওয়ালেটের তথ্য মুছুন।", notice: "পাসওয়ার্ড, OTP, পরিচয়পত্র বা অ্যাকাউন্টের তথ্য লিখবেন না। AI ভুল করতে পারে; অ্যাকাউন্টের কাজ নিরাপদ ক্লায়েন্ট এলাকায় করুন।" },
  th: { title: "ถาม Buddy AI", consent: "แชร์คำถามที่ฉันพิมพ์กับ n8n และผู้ให้บริการ AI เพื่อรับคำตอบ แยกจากการบันทึกเซสชันช่วยเหลือ", prompt: "ถามคำถามทั่วไปเกี่ยวกับเว็บไซต์", send: "ถาม Buddy", sending: "กำลังเตรียมคำตอบ…", unavailable: "AI ยังไม่พร้อมใช้งาน โปรดใช้คู่มือด้านบนหรือติดต่อฝ่ายช่วยเหลือ", private: "ลบอีเมล หมายเลขโทรศัพท์/บัญชี รหัส และข้อมูลกระเป๋าเงินก่อนส่ง", notice: "อย่าระบุรหัสผ่าน OTP เอกสารระบุตัวตน หรือข้อมูลบัญชี AI อาจผิดพลาดได้ จัดการบัญชีในพื้นที่ลูกค้าที่ปลอดภัย" },
  vi: { title: "Hỏi Buddy AI", consent: "Chia sẻ câu hỏi tôi nhập với n8n và nhà cung cấp AI để trả lời. Việc này tách biệt với lưu phiên hỗ trợ.", prompt: "Đặt câu hỏi chung về trang web", send: "Hỏi Buddy", sending: "Đang chuẩn bị trả lời…", unavailable: "AI hiện không khả dụng. Hãy dùng hướng dẫn phía trên hoặc liên hệ hỗ trợ.", private: "Xóa email, số điện thoại/tài khoản, mã và thông tin ví trước khi gửi.", notice: "Không nhập mật khẩu, OTP, giấy tờ tùy thân hoặc thông tin tài khoản. AI có thể sai; thao tác tài khoản phải thực hiện trong khu vực khách hàng an toàn." },
  id: { title: "Tanya Buddy AI", consent: "Bagikan pertanyaan yang saya ketik kepada n8n dan penyedia AI-nya untuk dijawab. Ini terpisah dari penyimpanan sesi dukungan.", prompt: "Ajukan pertanyaan umum tentang situs", send: "Tanya Buddy", sending: "Menyiapkan jawaban…", unavailable: "Bantuan AI sedang tidak tersedia. Gunakan panduan di atas atau hubungi dukungan.", private: "Hapus email, nomor telepon/rekening, kode, dan informasi dompet sebelum mengirim.", notice: "Jangan masukkan kata sandi, OTP, dokumen identitas, atau data akun. AI dapat keliru; tindakan akun tetap dilakukan di area klien yang aman." },
};
export class BuddyAiError extends Error {
  constructor(public code: string) { super(code); }
}
function endpoint(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) throw new BuddyAiError("ASSISTANT_UNAVAILABLE");
  return `${base.replace(/\/$/, "")}/api/support-chat/n8n/${path}`;
}
export async function buddyAiAvailable(signal: AbortSignal, transport: typeof fetch = fetch) {
  const response = await transport(endpoint("options"), { signal, credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer" });
  if (!response.ok) return false;
  const data = await response.json(); return data.available === true && data.requiresConsent === true;
}
export async function askBuddyAi(language: ChatLanguage, message: string, consent: boolean, contextQuestion: number | null, signal: AbortSignal, transport: typeof fetch = fetch): Promise<string> {
  if (!consent || !message.trim() || message.length > 1000) throw new BuddyAiError("INVALID_ASSISTANT_REQUEST");
  const response = await transport(endpoint("reply"), { method: "POST", signal, credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language, message: message.trim(), consent: true, contextQuestion }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.answer !== "string" || !data.answer.trim() || data.answer.length > 2400 || data.language !== language) {
    throw new BuddyAiError(data.code === "REMOVE_PRIVATE_DETAILS" ? data.code : "ASSISTANT_UNAVAILABLE");
  }
  return data.answer;
}

