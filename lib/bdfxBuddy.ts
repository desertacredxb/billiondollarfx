import type { ChatLanguage, TopicId } from "./supportChat";

export const buddyGuides = ["name", "email", "phone", "password", "confirm", "country", "otp", "account", "amount", "network", "required", "terms", "duplicate", "connection", "payment", "verification"] as const;
export type BuddyGuide = typeof buddyGuides[number];
export type BuddyContext = { topic: TopicId; question: number; href: string };
export const BUDDY_ISSUE_EVENT = "bdfx:guide-issue";

const adminPaths = new Set(["admin", "admin-login", "adminDashboard", "users", "brokers", "tickets", "IB", "all-transactions", "bankapproval", "payout-requests", "blog-management", "enquiries", "activity-log", "staff-users", "business-report", "website-analytics", "email-marketing", "chat-reports", "api"]);
export function buddyContext(pathname: string): BuddyContext | null {
  const path = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (adminPaths.has(path.split("/")[1])) return null;
  if (path === "/register") return { topic: "account", question: 0, href: "/register" };
  if (path === "/login") return { topic: "account", question: 1, href: "/login" };
  if (path === "/dashboard") return { topic: "mt5", question: 8, href: "/live-accounts" };
  if (path === "/settings") return { topic: "verification", question: 13, href: "/verify-identity" };
  if (path === "/transactions") return { topic: "deposit", question: 5, href: "/transactions" };
  if (path === "/verify-identity") return { topic: "verification", question: 0, href: "/verify-identity" };
  if (["/deposits", "/Deposit&Withdrawal"].includes(path)) return { topic: "deposit", question: 4, href: "/deposits" };
  if (path === "/withdrawals") return { topic: "withdrawal", question: 7, href: "/withdrawals" };
  if (["/platform", "/web-trader", "/Ourplatform", "/live-accounts", "/demo-accounts"].includes(path)) return { topic: "mt5", question: 8, href: "/platform" };
  if (["/ib-broker", "/introducing-broker"].includes(path)) return { topic: "ib", question: 10, href: "/ib-broker" };
  if (path === "/support" || path === "/contact") return { topic: "support", question: 12, href: "/contact" };
  return { topic: "account", question: 0, href: "/register" };
}
export function isBuddyGuide(value: unknown): value is BuddyGuide {
  return typeof value === "string" && buddyGuides.includes(value as BuddyGuide);
}
export function buddyLinkContext(pathname: string): BuddyContext | null {
  const paths = ["/register", "/login", "/verify-identity", "/deposits", "/Deposit&Withdrawal", "/withdrawals", "/platform", "/web-trader", "/Ourplatform", "/live-accounts", "/demo-accounts", "/ib-broker", "/introducing-broker", "/contact", "/support"];
  return paths.includes(pathname.replace(/\/+$/, "")) ? buddyContext(pathname) : null;
}
// Only schema metadata is inspected; never field values, tokens, codes or labels.
export function buddyField(name: string, type = "", explicit?: string | null): BuddyGuide | null {
  if (isBuddyGuide(explicit)) return explicit;
  const field = name.toLowerCase();
  if (/confirm.*password|password.*confirm/.test(field)) return "confirm";
  if (type === "password" || field === "password") return "password";
  if (/otp|verificationcode/.test(field)) return "otp";
  if (type === "email" || field === "email") return "email";
  if (type === "tel" || /phone|mobile|countrycode/.test(field)) return "phone";
  if (/fullname|full_name/.test(field)) return "name";
  if (/nationality|residencecountry/.test(field)) return "country";
  if (/accountno|accountnumber|accountid/.test(field)) return "account";
  if (/amount/.test(field)) return "amount";
  if (/network/.test(field)) return "network";
  if (/agree|consent/.test(field)) return "terms";
  return null;
}
export function registrationBuddyIssue(message: string): BuddyGuide {
  if (/already|duplicate|exists|registered/i.test(message)) return "duplicate";
  if (/passwords do not match/i.test(message)) return "confirm";
  if (/password/i.test(message)) return "password";
  if (/code|otp|verification/i.test(message)) return "otp";
  if (/country|residence|UAE|nationality/i.test(message)) return "country";
  if (/terms|agree|consent/i.test(message)) return "terms";
  if (/phone|mobile/i.test(message)) return "phone";
  if (/email/i.test(message)) return "email";
  if (/connection|temporarily|unavailable|try again/i.test(message)) return "connection";
  return "required";
}
export function announceBuddyIssue(guide: BuddyGuide) {
  if (typeof window !== "undefined" && isBuddyGuide(guide)) {
    // Event payload is an allowlisted ID, never an error message or form content.
    window.dispatchEvent(new CustomEvent(BUDDY_ISSUE_EVENT, { detail: { guide } }));
  }
}
export function buddyQuestion(guide: BuddyGuide): number {
  if (guide === "duplicate") return 1;
  if (guide === "otp") return 2;
  if (guide === "country") return 3;
  if (["account", "amount", "network"].includes(guide)) return 4;
  if (guide === "payment") return 5;
  if (guide === "connection") return 12;
  return 0;
}
export function buddyActionHref(question: number): string | null {
  const actions: Record<number, string> = { 0: "/register", 1: "/login", 4: "/deposits", 5: "/support", 7: "/support", 8: "/platform", 10: "/ib-broker", 12: "/contact", 13: "/login" };
  return actions[question] || null;
}

type BuddyCopy = {
  hello: string; nudge: string; fix: string; hover: string; ask: string; field: string; pause: string; resume: string; dismiss: string; next: string;
  guides: Record<BuddyGuide, string>;
};
export const buddyCopy: Record<ChatLanguage, BuddyCopy> = {
  en: {
    hello: "Hi, I’m your BDFX Buddy. What would you like help with?",
    nudge: "Need a hand with the next step? I can walk you through it.",
    fix: "Let’s work through this", hover: "A little help, right here", ask: "Ask BDFX Buddy", field: "Go to the field", pause: "Pause suggestions", resume: "Resume suggestions", dismiss: "Dismiss suggestion", next: "Continue on the website",
    guides: {
      name: "Use your full name as it appears on your original ID. Check the spelling and name order before continuing.",
      email: "Use an email address you can access and check its format. Your verification code will be sent there.",
      phone: "Select the correct country calling code, then enter your own mobile number in the format shown by this form.",
      password: "Use 8–16 characters with uppercase and lowercase letters, a number and a supported special character. Keep your password private.",
      confirm: "Enter the same password in both password fields. Use the eye button in the form if you need to check them; do not send either password in chat.",
      country: "Choose your actual nationality and residence. BDFX does not accept UAE clients; check the country eligibility policy.",
      otp: "Use only the newest code in its verification field. Check Inbox/Spam or the registered WhatsApp number. Wait for the resend countdown if needed.",
      account: "Choose your own MT5 trading account. Check the account and currency before continuing.",
      amount: "Check the minimum shown on this form, the currency and the final gateway amount. The payment gateway shows the final instructions and applicable charges.",
      network: "The coin, wallet address and network must match the gateway instructions. Check all three before confirming a transfer.",
      required: "The form highlighted a required or invalid field. Complete that field using the instructions shown, then review the form again.",
      terms: "Read the terms and required verification consent before continuing. Marketing consent is optional.",
      duplicate: "This email or mobile may already belong to an account. Use sign-in or password recovery, or ask support about access to the original account.",
      connection: "The request could not be completed. Check the message on the page and your connection. Keep your existing details and contact support if it continues.",
      payment: "The payment request needs attention. Check transaction history before retrying. If funds were debited, contact support with the reference instead of paying again.",
      verification: "Keep your original physical ID ready and match your account details to it. Read the verification result; use only the correction or retry actions available on your page.",
    },
  },
  hi: {
    hello: "नमस्ते, मैं आपका BDFX साथी हूँ। किस काम में मदद करूँ?",
    nudge: "अगले चरण में मदद चाहिए? मैं प्रक्रिया समझा सकता हूँ।",
    fix: "चलिए, इसे साथ समझते हैं", hover: "यहीं थोड़ी मदद", ask: "BDFX साथी से पूछें", field: "उस फ़ील्ड पर जाएँ", pause: "सुझाव रोकें", resume: "सुझाव चालू करें", dismiss: "सुझाव हटाएँ", next: "वेबसाइट पर आगे बढ़ें",
    guides: {
      name: "मूल पहचान पत्र के अनुसार पूरा नाम भरें। आगे बढ़ने से पहले वर्तनी और नाम का क्रम जाँचें।",
      email: "ऐसा ईमेल भरें जिसे आप खोल सकें और उसका फ़ॉर्मेट जाँचें। सत्यापन कोड इसी पते पर आएगा।",
      phone: "सही देश का कॉलिंग कोड चुनें, फिर फ़ॉर्म में बताए गए तरीके से अपना मोबाइल नंबर भरें।",
      password: "8–16 अक्षरों में बड़े और छोटे अंग्रेज़ी अक्षर, अंक और स्वीकार्य विशेष चिह्न रखें। पासवर्ड निजी रखें।",
      confirm: "दोनों पासवर्ड फ़ील्ड में एक ही पासवर्ड भरें। जाँचने के लिए फ़ॉर्म का आँख वाला बटन इस्तेमाल करें; चैट में पासवर्ड न भेजें।",
      country: "अपनी वास्तविक राष्ट्रीयता और निवास चुनें। BDFX UAE ग्राहकों को स्वीकार नहीं करता; देश की पात्रता नीति देखें।",
      otp: "केवल नया कोड सत्यापन फ़ील्ड में भरें। Inbox/Spam या रजिस्टर्ड WhatsApp नंबर देखें। ज़रूरत हो तो दोबारा भेजने का टाइमर खत्म होने दें।",
      account: "अपना MT5 ट्रेडिंग खाता चुनें। आगे बढ़ने से पहले खाता और मुद्रा जाँचें।",
      amount: "फ़ॉर्म में दिखाई गई न्यूनतम राशि, मुद्रा और गेटवे की कुल राशि जाँचें। अंतिम निर्देश और लागू शुल्क भुगतान गेटवे पर मिलेंगे।",
      network: "कॉइन, वॉलेट का पता और नेटवर्क गेटवे के निर्देशों से मिलने चाहिए। ट्रांसफ़र की पुष्टि से पहले तीनों जाँचें।",
      required: "फ़ॉर्म ने ज़रूरी या गलत फ़ील्ड दिखाई है। बताए गए निर्देशों के अनुसार उसे भरें, फिर फ़ॉर्म जाँचें।",
      terms: "आगे बढ़ने से पहले शर्तें और ज़रूरी सत्यापन सहमति पढ़ें। मार्केटिंग की सहमति वैकल्पिक है।",
      duplicate: "यह ईमेल या मोबाइल पहले से किसी खाते से जुड़ा हो सकता है। पुराने खाते में लॉगिन, पासवर्ड रिकवरी या सहायता लें।",
      connection: "अनुरोध पूरा नहीं हुआ। पेज का संदेश और इंटरनेट कनेक्शन जाँचें। अपनी भरी जानकारी बनाए रखें; समस्या जारी रहे तो सहायता लें।",
      payment: "भुगतान अनुरोध में ध्यान देने की ज़रूरत है। दोबारा कोशिश से पहले लेन-देन की हिस्ट्री देखें। पैसे कट गए हों तो फिर भुगतान करने के बजाय रेफरेंस के साथ सहायता लें।",
      verification: "मूल पहचान पत्र तैयार रखें और खाते की जानकारी उससे मिलाएँ। सत्यापन का परिणाम पढ़ें; पेज पर उपलब्ध सुधार या दोबारा कोशिश के विकल्प ही इस्तेमाल करें।",
    },
  },
  bn: {
    hello: "স্বাগতম, আমি আপনার BDFX সঙ্গী। কীভাবে সাহায্য করতে পারি?",
    nudge: "পরের ধাপে সাহায্য চান? আমি প্রক্রিয়াটি বুঝিয়ে দিতে পারি।",
    fix: "চলুন একসঙ্গে বুঝে নিই", hover: "এই ধাপে একটু সাহায্য", ask: "BDFX সঙ্গীকে জিজ্ঞাসা করুন", field: "সেই ঘরে যান", pause: "পরামর্শ বন্ধ করুন", resume: "পরামর্শ চালু করুন", dismiss: "পরামর্শ সরান", next: "ওয়েবসাইটে এগিয়ে যান",
    guides: {
      name: "আসল পরিচয়পত্র অনুযায়ী পুরো নাম লিখুন। এগোনোর আগে বানান ও নামের ক্রম মিলিয়ে নিন।",
      email: "আপনি ব্যবহার করতে পারেন এমন ইমেইল ঠিকানা দিন এবং ফর্ম্যাট দেখুন। যাচাইকরণ কোড সেখানে যাবে।",
      phone: "সঠিক দেশের কলিং কোড বেছে ফর্মে দেখানো নিয়মে নিজের মোবাইল নম্বর লিখুন।",
      password: "৮–১৬ অক্ষরের মধ্যে বড় ও ছোট ইংরেজি অক্ষর, সংখ্যা ও অনুমোদিত বিশেষ চিহ্ন রাখুন। পাসওয়ার্ড গোপন রাখুন।",
      confirm: "দুই ঘরে একই পাসওয়ার্ড লিখুন। দেখতে চাইলে ফর্মের চোখের বোতাম ব্যবহার করুন; চ্যাটে পাসওয়ার্ড পাঠাবেন না।",
      country: "সঠিক জাতীয়তা ও বাসস্থানের দেশ বেছে নিন। BDFX UAE-এর গ্রাহক গ্রহণ করে না; দেশের যোগ্যতার নীতি দেখুন।",
      otp: "শুধু সর্বশেষ কোড যাচাইকরণের ঘরে লিখুন। Inbox/Spam বা নিবন্ধিত WhatsApp নম্বর দেখুন। প্রয়োজনে আবার পাঠানোর সময় শেষ হওয়া পর্যন্ত অপেক্ষা করুন।",
      account: "নিজের MT5 ট্রেডিং অ্যাকাউন্ট বেছে নিন। এগোনোর আগে অ্যাকাউন্ট ও মুদ্রা দেখুন।",
      amount: "ফর্মে দেখানো সর্বনিম্ন অর্থ, মুদ্রা ও গেটওয়ের মোট পরিমাণ দেখুন। চূড়ান্ত নির্দেশ ও প্রযোজ্য ফি গেটওয়েতে পাবেন।",
      network: "কয়েন, ওয়ালেটের ঠিকানা ও নেটওয়ার্ক গেটওয়ের নির্দেশনার সঙ্গে মিলতে হবে। পাঠানোর আগে তিনটিই দেখুন।",
      required: "ফর্মে একটি প্রয়োজনীয় বা ভুল ঘর দেখানো হয়েছে। নির্দেশ অনুযায়ী পূরণ করে আবার যাচাই করুন।",
      terms: "এগোনোর আগে শর্ত ও প্রয়োজনীয় যাচাইকরণের সম্মতি পড়ুন। বিপণনের সম্মতি ঐচ্ছিক।",
      duplicate: "ইমেইল বা মোবাইলটি আগে কোনো অ্যাকাউন্টের সঙ্গে যুক্ত থাকতে পারে। পুরোনো অ্যাকাউন্টে লগইন, পাসওয়ার্ড পুনরুদ্ধার বা সহায়তা নিন।",
      connection: "অনুরোধ সম্পূর্ণ হয়নি। পেজের বার্তা ও সংযোগ দেখুন। লেখা তথ্য রেখে দিন; সমস্যা চললে সহায়তা নিন।",
      payment: "পেমেন্টের অনুরোধে সমস্যা হয়েছে। আবার চেষ্টা করার আগে লেনদেনের ইতিহাস দেখুন। টাকা কেটে গেলে আবার পেমেন্ট না করে রেফারেন্সসহ সহায়তা নিন।",
      verification: "আসল পরিচয়পত্র প্রস্তুত রাখুন ও অ্যাকাউন্টের তথ্য মিলিয়ে নিন। যাচাইকরণের ফল পড়ে পেজে থাকা সংশোধন বা আবার চেষ্টা করার বিকল্প ব্যবহার করুন।",
    },
  },
  th: {
    hello: "สวัสดี ฉันคือเพื่อนช่วยเหลือ BDFX ต้องการให้ช่วยเรื่องอะไร?",
    nudge: "ต้องการให้ช่วยขั้นตอนต่อไปไหม? ฉันอธิบายให้ได้",
    fix: "มาดูขั้นตอนนี้ด้วยกัน", hover: "ความช่วยเหลือตรงนี้", ask: "ถามเพื่อน BDFX", field: "ไปที่ช่องนั้น", pause: "พักคำแนะนำ", resume: "เปิดคำแนะนำ", dismiss: "ปิดคำแนะนำนี้", next: "ดำเนินการบนเว็บไซต์",
    guides: {
      name: "กรอกชื่อเต็มตามเอกสารตัวจริง ตรวจตัวสะกดและลำดับชื่อก่อนดำเนินการ",
      email: "ใช้อีเมลที่คุณเข้าถึงได้และตรวจรูปแบบให้ถูกต้อง รหัสยืนยันจะส่งไปที่นั่น",
      phone: "เลือกรหัสโทรศัพท์ประเทศให้ถูกต้อง แล้วกรอกเบอร์ของคุณตามรูปแบบที่แบบฟอร์มระบุ",
      password: "ใช้ 8–16 ตัวอักษร มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษที่รองรับ เก็บรหัสผ่านเป็นความลับ",
      confirm: "กรอกรหัสผ่านให้ตรงกันทั้งสองช่อง ใช้ปุ่มรูปตาในแบบฟอร์มเพื่อตรวจสอบ อย่าส่งรหัสผ่านในแชต",
      country: "เลือกสัญชาติและประเทศที่พำนักตามจริง BDFX ไม่รับลูกค้า UAE โปรดตรวจนโยบายประเทศที่มีสิทธิ์",
      otp: "ใช้รหัสล่าสุดในช่องยืนยันเท่านั้น ตรวจ Inbox/Spam หรือ WhatsApp ของเบอร์ที่ลงทะเบียน รอเวลาส่งซ้ำหากจำเป็น",
      account: "เลือกบัญชี MT5 ของคุณเอง ตรวจบัญชีและสกุลเงินก่อนดำเนินการ",
      amount: "ตรวจยอดขั้นต่ำในแบบฟอร์ม สกุลเงิน และยอดรวมที่เกตเวย์ คำแนะนำสุดท้ายและค่าธรรมเนียมอยู่ที่เกตเวย์",
      network: "เหรียญ ที่อยู่กระเป๋า และเครือข่ายต้องตรงกับคำแนะนำของเกตเวย์ ตรวจทั้งสามอย่างก่อนยืนยันโอน",
      required: "แบบฟอร์มระบุช่องที่จำเป็นหรือไม่ถูกต้อง กรอกตามคำแนะนำแล้วตรวจแบบฟอร์มอีกครั้ง",
      terms: "อ่านเงื่อนไขและความยินยอมที่จำเป็นสำหรับการยืนยันก่อนดำเนินการ ความยินยอมการตลาดเป็นทางเลือก",
      duplicate: "อีเมลหรือเบอร์นี้อาจผูกกับบัญชีเดิมแล้ว เข้าสู่ระบบ กู้รหัสผ่าน หรือขอความช่วยเหลือเกี่ยวกับบัญชีเดิม",
      connection: "คำขอยังไม่สำเร็จ ตรวจข้อความบนหน้าและการเชื่อมต่อ เก็บข้อมูลที่กรอกไว้ หากยังมีปัญหาให้ติดต่อฝ่ายช่วยเหลือ",
      payment: "คำขอชำระเงินต้องได้รับการตรวจสอบ ดูประวัติรายการก่อนลองใหม่ หากถูกหักเงินแล้วให้ส่งหมายเลขอ้างอิงแก่ฝ่ายช่วยเหลือแทนการจ่ายซ้ำ",
      verification: "เตรียมเอกสารตัวจริงและให้ข้อมูลบัญชีตรงกัน อ่านผลการยืนยันแล้วใช้เฉพาะตัวเลือกแก้ไขหรือลองใหม่ที่ปรากฏบนหน้า",
    },
  },
  vi: {
    hello: "Xin chào, tôi là người bạn BDFX. Bạn cần hỗ trợ gì?",
    nudge: "Bạn cần giúp ở bước tiếp theo? Tôi có thể hướng dẫn.",
    fix: "Cùng xem lại bước này", hover: "Một chút trợ giúp tại đây", ask: "Hỏi người bạn BDFX", field: "Đến ô thông tin", pause: "Tạm dừng gợi ý", resume: "Tiếp tục gợi ý", dismiss: "Ẩn gợi ý này", next: "Tiếp tục trên website",
    guides: {
      name: "Nhập họ tên đúng trên giấy tờ gốc. Kiểm tra cách viết và thứ tự tên trước khi tiếp tục.",
      email: "Dùng email bạn có thể truy cập và kiểm tra định dạng. Mã xác minh được gửi đến đó.",
      phone: "Chọn đúng mã quốc gia, rồi nhập số điện thoại của bạn theo định dạng trên biểu mẫu.",
      password: "Dùng 8–16 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt được hỗ trợ. Giữ kín mật khẩu.",
      confirm: "Nhập cùng mật khẩu vào hai ô. Dùng nút hình mắt trên biểu mẫu để kiểm tra; không gửi mật khẩu qua chat.",
      country: "Chọn đúng quốc tịch và nơi cư trú. BDFX không nhận khách hàng UAE; xem chính sách quốc gia đủ điều kiện.",
      otp: "Chỉ nhập mã mới nhất vào ô xác minh. Kiểm tra thư đến/thư rác hoặc số WhatsApp đã đăng ký. Chờ hết thời gian gửi lại nếu cần.",
      account: "Chọn tài khoản giao dịch MT5 của chính bạn. Kiểm tra tài khoản và loại tiền trước khi tiếp tục.",
      amount: "Kiểm tra mức tối thiểu trên biểu mẫu, loại tiền và tổng tiền tại cổng. Hướng dẫn cuối cùng và phí áp dụng được hiển thị tại cổng thanh toán.",
      network: "Đồng tiền, địa chỉ ví và mạng phải khớp với hướng dẫn của cổng. Kiểm tra cả ba trước khi xác nhận chuyển.",
      required: "Biểu mẫu đã đánh dấu ô bắt buộc hoặc không hợp lệ. Điền theo hướng dẫn rồi kiểm tra lại.",
      terms: "Đọc điều khoản và sự đồng ý xác minh bắt buộc trước khi tiếp tục. Đồng ý tiếp thị là tùy chọn.",
      duplicate: "Email hoặc số điện thoại này có thể đã có tài khoản. Đăng nhập, khôi phục mật khẩu hoặc nhờ hỗ trợ truy cập tài khoản cũ.",
      connection: "Yêu cầu chưa hoàn tất. Kiểm tra thông báo và kết nối. Giữ thông tin đã nhập; liên hệ hỗ trợ nếu lỗi tiếp diễn.",
      payment: "Yêu cầu thanh toán cần được kiểm tra. Xem lịch sử trước khi thử lại. Nếu đã bị trừ tiền, liên hệ hỗ trợ kèm mã tham chiếu thay vì trả lần nữa.",
      verification: "Chuẩn bị giấy tờ gốc và khớp thông tin tài khoản. Đọc kết quả xác minh; chỉ dùng tùy chọn sửa hoặc thử lại có trên trang.",
    },
  },
  id: {
    hello: "Halo, saya teman BDFX Anda. Perlu bantuan apa?",
    nudge: "Perlu bantuan untuk langkah berikutnya? Saya bisa memandu.",
    fix: "Mari periksa langkah ini", hover: "Sedikit bantuan di sini", ask: "Tanya teman BDFX", field: "Buka kolom itu", pause: "Jeda saran", resume: "Lanjutkan saran", dismiss: "Tutup saran ini", next: "Lanjutkan di situs",
    guides: {
      name: "Gunakan nama lengkap sesuai dokumen asli. Periksa ejaan dan urutan nama sebelum melanjutkan.",
      email: "Gunakan email yang dapat Anda akses dan periksa formatnya. Kode verifikasi dikirim ke sana.",
      phone: "Pilih kode telepon negara yang benar, lalu masukkan nomor Anda sesuai format pada formulir.",
      password: "Gunakan 8–16 karakter dengan huruf besar, huruf kecil, angka dan simbol khusus yang didukung. Rahasiakan kata sandi.",
      confirm: "Isi kata sandi yang sama pada kedua kolom. Gunakan tombol mata di formulir untuk memeriksa; jangan kirim kata sandi lewat chat.",
      country: "Pilih kewarganegaraan dan domisili sebenarnya. BDFX tidak menerima klien UAE; baca kebijakan kelayakan negara.",
      otp: "Gunakan kode terbaru hanya di kolom verifikasi. Periksa Inbox/Spam atau WhatsApp terdaftar. Tunggu hitung mundur kirim ulang bila perlu.",
      account: "Pilih akun trading MT5 Anda sendiri. Periksa akun dan mata uang sebelum melanjutkan.",
      amount: "Periksa minimum pada formulir, mata uang dan total di gateway. Instruksi akhir dan biaya yang berlaku ditampilkan oleh gateway.",
      network: "Koin, alamat dompet dan jaringan harus sesuai instruksi gateway. Periksa ketiganya sebelum mengonfirmasi transfer.",
      required: "Formulir menandai kolom wajib atau tidak valid. Isi sesuai petunjuk lalu periksa kembali.",
      terms: "Baca ketentuan dan persetujuan verifikasi wajib sebelum melanjutkan. Persetujuan pemasaran bersifat opsional.",
      duplicate: "Email atau nomor ini mungkin sudah terhubung ke akun. Masuk, pulihkan kata sandi atau minta bantuan mengakses akun lama.",
      connection: "Permintaan belum selesai. Periksa pesan di halaman dan koneksi Anda. Pertahankan isian; hubungi bantuan jika masalah berlanjut.",
      payment: "Permintaan pembayaran perlu diperiksa. Lihat riwayat sebelum mencoba lagi. Jika dana terpotong, hubungi bantuan dengan referensi alih-alih membayar lagi.",
      verification: "Siapkan dokumen asli dan cocokkan detail akun. Baca hasil verifikasi; gunakan hanya pilihan koreksi atau coba ulang yang tersedia di halaman.",
    },
  },
};
