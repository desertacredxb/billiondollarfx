import { SITE_ORIGIN } from "./seo";

export type Guide = {
  country: "india" | "pakistan" | "vietnam";
  language: "en" | "hi" | "ur" | "vi";
  locale: string;
  countryName: string;
  languageName: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: { title: string; text: string }[];
  terms: { term: string; meaning: string }[];
  notice: string;
  sources: { label: string; url: string }[];
  ui: { home: string; languages: string; glossary: string; sources: string; education: string; help: string; risk: string; sourceDate: string };
};

export const guideUpdated = "2026-11-04";
const enUi = { home: "Country learning guides", languages: "Read in", glossary: "Three terms to understand", sources: "Official sources", education: "Explore the education centre", help: "Help with this guide", risk: "Read the risk disclosure", sourceDate: "Guide updated: 4 November 2026. Refer to the relevant authority for current guidance." };
const rbi = { label: "RBI: notice on unauthorised forex platforms (3 February 2022)", url: "https://www.rbi.org.in/commonman/Upload/English/PressRelease/PDFs/PR166003022022.pdf" };
const sbp = { label: "SBP: offshore forex and CFD platform advisory (18 May 2022)", url: "https://www.sbp.org.pk/press/2022/Pr-18-May-2022.pdf" };
const secp = { label: "SECP: warning about illegal offshore trading platforms (9 April 2025)", url: "https://www.secp.gov.pk/wp-content/uploads/2025/04/Press-Release-SECP-Cautions-Public-Against-Illegal-Offshore-Trading-and-Investment-Platforms-002.pdf" };
const vietnam = { label: "Vietnam Government Portal: forex-account eligibility questions (10 July 2026)", url: "https://baochinhphu.vn/thu-nhap-tu-giao-dich-ngoai-hoi-co-phai-nop-thue-thu-nhap-ca-nhan-102260708162224945.htm" };

export const countryGuides: readonly Guide[] = [
  {
    country: "india", language: "en", locale: "en-IN", countryName: "India", languageName: "English",
    title: "Forex Basics & MT5 Risk Education in India | BDFX",
    description: "Learn forex terminology, MT5 platform concepts and where to find RBI guidance. A country learning guide for readers in India from Billion Dollar FX.",
    heading: "Forex education for readers in India",
    intro: "Understand the language of a trading platform before interpreting its features or promotional claims. Start with the distinction between currency exchange, a financial product and the software used to display it.",
    sections: [
      { title: "Currency exchange and trading products", text: "Changing currency for travel or trade differs from speculating on price movements. A currency-pair label or a familiar trading app does not establish whether a transaction is permitted. Identify the product, the provider and the applicable rules separately." },
      { title: "Read an MT5 symbol specification", text: "The Specification panel explains contract size, minimum volume, volume steps and trading sessions. Bid and ask are different prices; their difference is the spread. Margin is collateral and is not a promise that losses will be limited to that amount." },
      { title: "Check the Indian authorization requirements", text: "RBI's February 2022 notice limits residents' forex transactions to authorized persons and permitted purposes, with requirements for electronic platforms and recognized exchanges. It also states that overseas margin remittances are not permitted under LRS. Consult RBI's current official information rather than a platform's marketing claims." },
    ],
    terms: [{ term: "Currency pair", meaning: "A quotation expressing one currency in another; the label alone does not establish eligibility." }, { term: "Margin", meaning: "Collateral required for an exposure. It is distinct from the maximum possible loss." }, { term: "MT5", meaning: "Trading software. Software availability is separate from a service provider's authorization." }],
    notice: "This is an educational resource. It does not confirm local authorization, eligibility for a live account or permission to remit funds. No return is guaranteed.",
    sources: [rbi], ui: enUi,
  },
  {
    country: "india", language: "hi", locale: "hi-IN", countryName: "भारत", languageName: "हिन्दी",
    title: "भारत में फ़ॉरेक्स और MT5 की बुनियादी जानकारी | BDFX",
    description: "फ़ॉरेक्स के शब्द, MT5 की बुनियादी जानकारी और RBI के आधिकारिक निर्देश समझें। भारत के पाठकों के लिए Billion Dollar FX की शैक्षिक मार्गदर्शिका।",
    heading: "भारत के पाठकों के लिए फ़ॉरेक्स शिक्षा",
    intro: "किसी ट्रेडिंग प्लेटफ़ॉर्म की सुविधाओं या प्रचार के दावों को समझने से पहले ज़रूरी शब्दों को जानें। मुद्रा विनिमय, वित्तीय उत्पाद और उन्हें दिखाने वाले सॉफ़्टवेयर के बीच का अंतर समझना पहला कदम है।",
    sections: [
      { title: "मुद्रा विनिमय और ट्रेडिंग उत्पाद", text: "यात्रा या व्यापार के लिए मुद्रा बदलना और कीमतों के उतार-चढ़ाव पर सट्टा लगाना अलग गतिविधियाँ हैं। किसी मुद्रा जोड़ी का नाम या परिचित ऐप यह साबित नहीं करता कि लेनदेन की अनुमति है। उत्पाद, सेवा प्रदाता और लागू नियमों को अलग-अलग पहचानें।" },
      { title: "MT5 में सिंबल की जानकारी पढ़ें", text: "Specification पैनल में कॉन्ट्रैक्ट साइज़, न्यूनतम वॉल्यूम, वॉल्यूम स्टेप और ट्रेडिंग सत्र देखें। Bid और Ask अलग भाव हैं; उनके अंतर को स्प्रेड कहते हैं। मार्जिन गिरवी रखी राशि है, नुकसान की अधिकतम सीमा की गारंटी नहीं।" },
      { title: "भारत में अनुमति संबंधी निर्देश देखें", text: "RBI की फ़रवरी 2022 की सूचना के अनुसार, निवासी केवल अधिकृत व्यक्तियों के साथ और अनुमत उद्देश्यों के लिए फ़ॉरेक्स लेनदेन कर सकते हैं। इलेक्ट्रॉनिक प्लेटफ़ॉर्म और मान्यता प्राप्त एक्सचेंज की शर्तें भी लागू हैं। LRS के तहत विदेश में मार्जिन भेजने की अनुमति नहीं है। प्रचार के दावों के बजाय RBI की वर्तमान आधिकारिक जानकारी देखें।" },
    ],
    terms: [{ term: "मुद्रा जोड़ी", meaning: "एक मुद्रा का भाव दूसरी मुद्रा में। केवल नाम से लेनदेन की पात्रता तय नहीं होती।" }, { term: "मार्जिन", meaning: "एक्सपोज़र के लिए ज़रूरी गिरवी राशि; यह अधिकतम संभावित नुकसान से अलग है।" }, { term: "MT5", meaning: "ट्रेडिंग सॉफ़्टवेयर। सॉफ़्टवेयर की उपलब्धता सेवा प्रदाता की अनुमति का प्रमाण नहीं है।" }],
    notice: "यह शैक्षिक जानकारी है। इससे स्थानीय अनुमति, लाइव खाते की पात्रता या धन भेजने की अनुमति की पुष्टि नहीं होती। किसी रिटर्न की गारंटी नहीं है।",
    sources: [{ ...rbi, label: "RBI: अनधिकृत फ़ॉरेक्स प्लेटफ़ॉर्म संबंधी सूचना (3 फ़रवरी 2022)" }],
    ui: { home: "देश के अनुसार शिक्षा", languages: "भाषा चुनें", glossary: "तीन ज़रूरी शब्द", sources: "आधिकारिक स्रोत", education: "शिक्षा केंद्र देखें", help: "इस मार्गदर्शिका को समझने में सहायता", risk: "जोखिम संबंधी जानकारी पढ़ें", sourceDate: "मार्गदर्शिका अपडेट: 4 नवंबर 2026। वर्तमान निर्देशों के लिए संबंधित प्राधिकरण देखें।" },
  },
  {
    country: "pakistan", language: "en", locale: "en-PK", countryName: "Pakistan", languageName: "English",
    title: "Forex Risk & Platform Safety in Pakistan | BDFX",
    description: "Understand forex, margin and CFD terms, recognize platform warning signs and find SBP and SECP guidance. A BDFX education guide for readers in Pakistan.",
    heading: "Forex risks and platform checks for Pakistan",
    intro: "Understanding an interface and checking the business behind it are different tasks. This guide focuses on product terminology, common warning signs and official information for readers in Pakistan.",
    sections: [
      { title: "Read claims critically", text: "Guaranteed profits, pressure to transfer money immediately and unsolicited investment offers deserve scrutiny. Screenshots and testimonials are not authorization records. A familiar software name does not establish the legal status of the organization using it." },
      { title: "Separate practice from an investment outcome", text: "Forex, margin and CFD products have different features and risks. A demo balance is a practice display, not evidence of achievable returns. Understand leverage, spread and unrealized profit before interpreting a platform screen." },
      { title: "Read Pakistan's official warnings", text: "SBP's May 2022 advisory states that residents are prohibited from buying the relevant products and services of offshore forex, margin and CFD platforms, and warns against remitting funds to them. SECP also warns about unauthorized online investment platforms. This guide does not invite residents to fund an offshore trading account." },
    ],
    terms: [{ term: "CFD", meaning: "A contract for difference; exposure to price changes does not confer ownership of the underlying asset." }, { term: "Unrealized profit or loss", meaning: "A changing value on an open position, distinct from a closed result or a withdrawal." }, { term: "Authorization", meaning: "Permission for a provider and activity from the relevant authority; testimonials are not evidence of it." }],
    notice: "Educational information only. This page does not establish a provider's authorization or eligibility to use its services, and it makes no promise of returns.",
    sources: [sbp, secp], ui: enUi,
  },
  {
    country: "pakistan", language: "ur", locale: "ur-PK", countryName: "پاکستان", languageName: "اردو",
    title: "پاکستان میں فاریکس کے خطرات اور پلیٹ فارم کی جانچ | BDFX",
    description: "فاریکس، مارجن اور CFD کی اصطلاحات سمجھیں، غیر مجاز پلیٹ فارم کی نشانیاں پہچانیں اور SBP و SECP کی رہنمائی پڑھیں۔ BDFX کی تعلیمی معلومات۔",
    heading: "پاکستان کے قارئین کے لیے فاریکس کے خطرات اور پلیٹ فارم کی جانچ",
    intro: "ٹریڈنگ ایپ کو سمجھنا اور اسے چلانے والے ادارے کی حیثیت جانچنا الگ باتیں ہیں۔ یہ رہنما اصطلاحات، عام خطرے کی نشانیوں اور پاکستان کے قارئین کے لیے سرکاری معلومات پر توجہ دیتا ہے۔",
    sections: [
      { title: "دعووں کو غور سے پڑھیں", text: "یقینی منافع، فوری رقم بھیجنے کا دباؤ اور بغیر درخواست کے ملنے والی سرمایہ کاری کی پیشکشوں کی جانچ ضروری ہے۔ اسکرین شاٹس اور تعریفی بیانات ریگولیٹری اجازت کا ثبوت نہیں۔ کسی معروف سافٹ ویئر کا نام بھی اسے استعمال کرنے والے ادارے کی قانونی حیثیت ثابت نہیں کرتا۔" },
      { title: "مشق اور حقیقی نتائج میں فرق سمجھیں", text: "فاریکس، مارجن اور CFD مصنوعات کی خصوصیات اور خطرات مختلف ہیں۔ ڈیمو بیلنس مشق کے لیے دکھائی جانے والی رقم ہے، ممکنہ حقیقی منافع کا ثبوت نہیں۔ پلیٹ فارم کی اسکرین پڑھنے سے پہلے لیوریج، اسپریڈ اور غیر حاصل شدہ نفع یا نقصان کو سمجھیں۔" },
      { title: "پاکستان کے سرکاری انتباہات پڑھیں", text: "SBP کی مئی 2022 کی ہدایت کے مطابق، رہائشیوں کے لیے آف شور فاریکس، مارجن اور CFD پلیٹ فارمز کی متعلقہ مصنوعات اور خدمات خریدنا ممنوع ہے، اور ان کو رقم بھیجنے سے بھی خبردار کیا گیا ہے۔ SECP بھی غیر مجاز آن لائن سرمایہ کاری پلیٹ فارمز سے خبردار کرتا ہے۔ یہ رہنما رہائشیوں کو آف شور اکاؤنٹ میں رقم جمع کرانے کی دعوت نہیں دیتا۔" },
    ],
    terms: [{ term: "CFD", meaning: "قیمت کے فرق کا معاہدہ؛ اس سے بنیادی اثاثے کی ملکیت حاصل نہیں ہوتی۔" }, { term: "غیر حاصل شدہ نفع یا نقصان", meaning: "کھلی پوزیشن کی بدلتی قیمت، جو بند سودے کے نتیجے یا نکلوائی گئی رقم سے الگ ہے۔" }, { term: "ریگولیٹری اجازت", meaning: "متعلقہ ادارے کی طرف سے فراہم کنندہ اور سرگرمی کی اجازت؛ تعریفی بیانات اس کا ثبوت نہیں۔" }],
    notice: "یہ صرف تعلیمی معلومات ہیں۔ یہ کسی ادارے کی اجازت یا اس کی خدمات استعمال کرنے کی اہلیت کی تصدیق نہیں کرتا، اور کسی منافع کا وعدہ نہیں کیا جاتا۔",
    sources: [{ ...sbp, label: "SBP: آف شور فاریکس اور CFD پلیٹ فارم کی ہدایت (18 مئی 2022)" }, { ...secp, label: "SECP: غیر قانونی آف شور پلیٹ فارم کا انتباہ (9 اپریل 2025)" }],
    ui: { home: "ملک کے لحاظ سے تعلیمی رہنما", languages: "زبان منتخب کریں", glossary: "تین اہم اصطلاحات", sources: "سرکاری ذرائع", education: "تعلیمی مرکز دیکھیں", help: "اس رہنما کو سمجھنے میں مدد", risk: "خطرات کی تفصیل پڑھیں", sourceDate: "رہنما کی تازہ کاری: 4 نومبر 2026۔ موجودہ رہنمائی کے لیے متعلقہ سرکاری ادارے سے رجوع کریں۔" },
  },
  {
    country: "vietnam", language: "en", locale: "en-VN", countryName: "Vietnam", languageName: "English",
    title: "Forex & MT5 Learning Resources in Vietnam | BDFX",
    description: "Learn Forex, CFD and MT5 terminology, read platform information carefully and find official Vietnamese guidance. An education resource from Billion Dollar FX.",
    heading: "Forex terminology and official guidance for Vietnam",
    intro: "Product names can obscure the differences between software, a financial product and the organization providing it. This guide helps readers in Vietnam distinguish those concepts and locate official guidance.",
    sections: [
      { title: "Build a clear glossary", text: "Forex concerns foreign exchange, CFD means contract for difference, and MT5 is software. These terms do not establish that a provider is authorized in Vietnam. A displayed reference exchange rate is also different from an executable quote." },
      { title: "Understand the platform information", text: "Check how a provider describes quotations, charges, contract size and account information. The balance of an account and its equity can differ while positions are open. Keep educational examples and practice results separate from claims about real outcomes." },
      { title: "Use official guidance for eligibility questions", text: "A July 2026 government-portal response refers questions about a Vietnamese resident opening and trading through an offshore forex account to the State Bank of Vietnam. It is not an authorization for a particular platform or a statement that an account is eligible." },
    ],
    terms: [{ term: "Reference rate", meaning: "An informational exchange rate, distinct from a price at which a transaction can actually execute." }, { term: "Equity", meaning: "An account value that can reflect open-position results; it is not identical to balance." }, { term: "Contract size", meaning: "The amount represented by a unit or lot, which must be checked for the actual symbol." }],
    notice: "This page explains concepts. It does not establish permission to trade, a provider's authorization or local service availability. Practice results do not guarantee future outcomes.",
    sources: [vietnam], ui: enUi,
  },
  {
    country: "vietnam", language: "vi", locale: "vi-VN", countryName: "Việt Nam", languageName: "Tiếng Việt",
    title: "Kiến thức Forex, MT5 và rủi ro tại Việt Nam | BDFX",
    description: "Tìm hiểu thuật ngữ Forex, CFD, MT5, cách đọc thông tin nền tảng và nguồn hướng dẫn chính thức tại Việt Nam. Tài liệu giáo dục từ Billion Dollar FX.",
    heading: "Thuật ngữ Forex và hướng dẫn chính thức cho người đọc tại Việt Nam",
    intro: "Tên sản phẩm có thể khiến người đọc nhầm lẫn giữa phần mềm, sản phẩm tài chính và tổ chức cung cấp dịch vụ. Hướng dẫn này giúp phân biệt các khái niệm đó và tìm nguồn thông tin chính thức.",
    sections: [
      { title: "Hiểu đúng thuật ngữ", text: "Forex liên quan đến ngoại hối, CFD là hợp đồng chênh lệch và MT5 là phần mềm. Những thuật ngữ này không xác nhận rằng nhà cung cấp được cấp phép tại Việt Nam. Tỷ giá tham khảo cũng khác với báo giá có thể thực hiện giao dịch." },
      { title: "Đọc kỹ thông tin nền tảng", text: "Tìm hiểu cách nhà cung cấp mô tả báo giá, các khoản phí, quy mô hợp đồng và thông tin tài khoản. Số dư và giá trị tài khoản có thể khác nhau khi còn vị thế mở. Phân biệt ví dụ phục vụ học tập với tuyên bố về kết quả thực tế." },
      { title: "Tham khảo cơ quan có thẩm quyền", text: "Phản hồi trên Báo Điện tử Chính phủ tháng 7/2026 hướng dẫn người hỏi liên hệ Ngân hàng Nhà nước để được giải đáp về việc cá nhân cư trú tại Việt Nam mở tài khoản và giao dịch Forex trên sàn nước ngoài. Nội dung đó không cấp phép cho một nền tảng cụ thể và không xác nhận một tài khoản đủ điều kiện." },
    ],
    terms: [{ term: "Tỷ giá tham khảo", meaning: "Tỷ giá phục vụ thông tin, khác với mức giá có thể thực hiện giao dịch." }, { term: "Giá trị tài khoản", meaning: "Giá trị có thể phản ánh kết quả của các vị thế mở; không đồng nghĩa với số dư." }, { term: "Quy mô hợp đồng", meaning: "Số lượng được thể hiện bởi một đơn vị hoặc lot; cần kiểm tra theo đúng mã sản phẩm." }],
    notice: "Trang này giải thích kiến thức. Nội dung không xác nhận quyền giao dịch, giấy phép của nhà cung cấp hay việc dịch vụ được cung cấp tại Việt Nam. Kết quả thực hành không bảo đảm kết quả tương lai.",
    sources: [{ ...vietnam, label: "Báo Điện tử Chính phủ: câu hỏi về tài khoản Forex ở nước ngoài (10/7/2026)" }],
    ui: { home: "Hướng dẫn theo quốc gia", languages: "Đọc bằng", glossary: "Ba thuật ngữ cần hiểu", sources: "Nguồn thông tin chính thức", education: "Khám phá trung tâm kiến thức", help: "Hỗ trợ tìm hiểu hướng dẫn", risk: "Đọc thông tin về rủi ro", sourceDate: "Cập nhật hướng dẫn: 4/11/2026. Tham khảo cơ quan có thẩm quyền để có hướng dẫn hiện hành." },
  },
];

export const countryOptions = [
  { key: "india", name: "India", native: "भारत", code: "IN", summary: "Forex basics, MT5 specifications and RBI information.", languages: ["en", "hi"] },
  { key: "pakistan", name: "Pakistan", native: "پاکستان", code: "PK", summary: "Product terminology, platform checks and SBP/SECP warnings.", languages: ["en", "ur"] },
  { key: "vietnam", name: "Vietnam", native: "Việt Nam", code: "VN", summary: "Forex vocabulary, account concepts and official Vietnamese guidance.", languages: ["en", "vi"] },
] as const;
export const guidePath = (guide: Pick<Guide, "country" | "language">) => `/learn/${guide.country}/${guide.language}`;
export const guideUrl = (guide: Pick<Guide, "country" | "language">) => `${SITE_ORIGIN}${guidePath(guide)}`;
export const getCountryGuide = (country: string, language: string) => countryGuides.find(g => g.country === country && g.language === language);
export function guideAlternates(country: string): Record<string, string> {
  const guides = countryGuides.filter(g => g.country === country);
  const english = guides.find(g => g.language === "en");
  return Object.fromEntries([...guides.map(g => [g.locale, guideUrl(g)]), ...(english ? [["x-default", guideUrl(english)]] : [])]);
}
