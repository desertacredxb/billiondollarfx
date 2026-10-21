# BDFX improvement roadmap

Requested implementation order: complete and verify each item before continuing to the next.

| Item | Work | Status |
| --- | --- | --- |
| 1 | Client/account access and administrator authentication | Live; build, automated checks and anonymous access checks passed |
| 2 | Public Open Account actions | Live; browser navigation to registration verified |
| 3 | Contact enquiries and CRM visibility | Live with persisted records, reference IDs, team notes and retrying email notifications; validation/access checks passed without sending a live test email |
| 4 | MT5 downloads, WebTrader and setup instructions | Official mobile/store/download links and setup guide implemented; provider WebTrader availability remains unverified (sandbox HTTP 503) |
| 5 | Consistent account offering and pricing | Live with supplied Liquid/$50/up to 1:500/commission-free/swap-free terms |
| 6 | Unified IB application and referral journey | Live: public entry, post-verification IB navigation, secured limited referrals and input-based earnings estimate |
| 7 | OTP email delivery | Mailer hardening and sender fallback implemented; received Gmail headers inspected; older OTPs are in Spam, so inbox placement/domain sending setup remain open |
| 8 | UAE restriction content | Public eligibility and footer updated; other existing country restrictions need business review |
| 9 | Withdrawal information and support escalation | Live: USDT 1–4 hour information and escalation guide; public help page and runtime checks passed |
| 10 | Blog, sitemap and page SEO | Live: backend blog storage, scheduled visibility, published SSR, unique metadata/canonicals, sitemap and private noindex rules |
| 11 | GA4/Search Console and conversion tracking | Consent-based GA4 integration and success-only events implemented, disabled pending a verified property; Search Console access remains unverified |
| 12 | Mobile media performance and expired promotions | Live: expired offers archived; optimized videos/posters with reduced-motion/data-saver playback; media HTTP 200 and optimized lengths verified |
| 13 | Calculators and calendar tools | IB/Forex calculators, daily reference converter and economic calendar implemented; calculation/error tests pass; live proxy and browser conversion verified with provider date |
| 14 | Client onboarding checklist | Backend and checklist UI live; first deposit derives from own successful orders; signed-in client journey not exercised |
| 15 | Transactional notifications and consented WhatsApp updates | Support team email queue/retries live; existing transactional emails retained; consented WhatsApp automation requires verified provider/templates |
| 16 | Support ticket experience | Live: inline validation, references, accessible conversation dialog, reply refresh and retry-safe writes; tests pass; real tickets not generated |
| 17 | Help centre | Live; account/verification/MT5/payment/IB Help Centre opened and answer expansion verified |
| 18 | Administrator two-factor sign-in and audit history | Live: owner/manager logins, per-address OTP, scoped permissions, immediate revocation and owner-only activity history |
| 19 | Failure alerts, database backups and restore verification | Hourly GitHub health monitor active; first workflow run passed; Render HTTP health path unset; discovered project is a Cloud Manager group, not verified production Atlas access; backup/restore and alert delivery remain open |
| 20 | Form validation, errors and confirmations | Live: support/server validation, duplicate-submit handling and registration/contact inline confirmations; no real form submission generated |
| 21 | Consistent BDFX branding and original assets | Live: homepage claim cleanup, original market information cards and Education/News content; public content checks passed |
| 22 | Daily business report | Live admin report with Dubai dates, registration/account counts, payment-status counts and work queues; excludes mixed-currency monetary totals |

Deploy client authentication headers before enabling backend route enforcement. Verify the frontend's Vercel build and the backend's Render deploy, then perform anonymous access smoke checks without retrieving customer records or creating trades, deposits, or withdrawals.

Continuation details and unresolved setup dependencies: see [CONTINUE_BDFX.md](CONTINUE_BDFX.md).

Current provider/configuration dependencies and unresolved payment callback review: [operations-readiness.md](operations-readiness.md). User approved both merges; Render backend and Vercel frontend releases are verified live. Actual provider delivery, signed-in customer journeys and unresolved setup remain qualified above.

Latest production: frontend `aa57af0` (Vercel succeeded), backend `d54c397` (Render `dep-dbc0gglg1s2s7389oqm0` live). Retain only RameePay INR, RameePay Crypto and Cregis Crypto; DigiPay/TrustPay24 are closed. Shared duplicate-credit guard deployed; 103 backend and 18 frontend tests passed.
