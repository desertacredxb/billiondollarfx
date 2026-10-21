# BDFX multilingual support flow

Owner request: match the useful support-flow behavior observed on WinproFX, check the automation depth and support multiple languages. This is an original BDFX guide, not a claim to have copied or accessed WinproFX's private chatbot configuration.

## WinproFX observations — 21 October 2026, Dubai time

Public browser interaction at https://winprofx.com/ showed a LiveChat/Text widget with a welcome message, an agent display name and a Let's chat button. That opened a required pre-chat form: name, email, contact number, country and an enquiry category; MT5 account number was optional. The five categories were Deposit, Withdraw, KYC Verification, Trade Execution and Prime & Liquidity Request. No personal details or messages were entered, no fake lead was submitted and no live chat with an agent was started.

The website language selector exposed ten choices: English, Hindi, Indonesian, Vietnamese, Bengali, Malay, Chinese, Japanese, Spanish and Portuguese. Selecting Hindi changed the public page to https://winprofx.com/hi while the LiveChat welcome/form stayed English. This verifies website translation, not multilingual chatbot replies. Automation beyond the welcome/pre-chat stages cannot be certified without submitting the required real details. Do not describe the agent's display name or an automated greeting as proof of a full AI/bot backend.

## Implemented BDFX behavior

Four guided stages: language -> main topic -> subtopic/question -> automatic answer and relevant next action. English, Hindi, Bengali, Thai, Vietnamese and Indonesian have complete local UI/questions/answers. A visitor can switch languages at any stage; the chosen answer updates in that language. Seven topics and fourteen answers cover registration, email/WhatsApp codes, identity/country eligibility, deposits, withdrawals, MT5 tools, IB partners and support. FAQ search is local and does not send typed text to a backend. Unmatched text does not produce an invented answer.

The guide uses current BDFX public instructions, not the other broker's pricing, timings, campaigns or country policy. UAE nationality/residence/document restrictions remain explicit. Withdrawals retain the qualified 1–4-hour typical USDT window; the guide cannot approve a transaction, change KYC or inspect an account. Account-specific requests use existing signed-in support or the contact form; opening the widget does not create a lead/ticket or claim that a live agent is connected.

The floating BDFX Help control occupies the bottom right. The existing WhatsApp chat link remains available on the bottom left. The small nonmodal panel has labelled language/search controls, keyboard navigation, Escape/close behavior and a viewport-bounded scroll area. It loads no third-party chat script, makes no external AI request and stores no conversation or personal details. The existing legacy AI chat component remains disabled.

Frontend PR 9 is live on main `e7c76cf7a56c59c81eecb96a967c96a58219ed9d`, Vercel `39QqahiW8WUDuoGRoPjgVG4xFPvK` succeeded. The live browser completed the Hindi withdrawal flow and switched the same answer to Bengali and back. The full six-language/14-question branch checks and production build pass. Public screenshot: bdfx-multilingual-chat-live-20261021.jpg. Exact deployment details are in CONTINUE_BDFX.md. The dedicated flow tests cover every translated branch, resource paths, search/fallback behavior, eligibility, timing qualifications and secure support boundaries. They do not verify a WhatsApp business-provider account or WinproFX's private automation.
