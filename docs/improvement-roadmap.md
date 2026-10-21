# BDFX improvement roadmap

Requested implementation order: complete and verify each item before continuing to the next.

| Item | Work | Status |
| --- | --- | --- |
| 1 | Client/account access and administrator authentication | Live; canonical email/mobile duplicate protection and atomic unique indexes deployed, with build/access/concurrency checks passed |
| 2 | Public Open Account actions | Live; browser navigation to registration verified |
| 3 | Contact enquiries and CRM visibility | Live with persisted records, reference IDs, team notes and retrying email notifications; validation/access checks passed without sending a live test email |
| 4 | MT5 downloads, WebTrader and setup instructions | Complete: official links and setup guide live; owner confirmed the trading platform is working on 21 October 2026. Earlier sandbox connection failures are not a live-platform defect |
| 5 | Consistent account offering and pricing | Live with supplied Liquid/$50/up to 1:500/commission-free/swap-free terms |
| 6 | Unified IB application and referral journey | Live: public entry, post-verification IB navigation, secured limited referrals and input-based earnings estimate |
| 7 | OTP email delivery | Mailer hardening/sender fallback live; canonical duplicate blocking deployed; email-to-WhatsApp OTP flow prepared, with actual WhatsApp sender/template unconfigured and enforcement off; domain inbox placement also remains open |
| 8 | UAE restriction content | Public eligibility and footer updated; other existing country restrictions need business review |
| 9 | Withdrawal information and support escalation | Live: USDT 1–4 hour information and escalation guide; public help page and runtime checks passed |
| 10 | Blog, sitemap and page SEO | Live: backend blog storage, scheduled visibility, published SSR, unique metadata/canonicals, sitemap and private noindex rules |
| 11 | GA4/Search Console and conversion tracking | Search Console verified/sitemap processed; BDFX GA4 account/property/web stream created with verified ID G-M6FW1X3X75, UAE account country, optional sharing off and enhanced measurement off. Public production configuration and consent/origin guards pass 28 tests/build; live publication and event receipt are being verified |
| 12 | Mobile media performance and expired promotions | Live: expired offers archived; optimized videos/posters with reduced-motion/data-saver playback; media HTTP 200 and optimized lengths verified |
| 13 | Calculators and calendar tools | IB/Forex calculators, daily reference converter and economic calendar implemented; calculation/error tests pass; live proxy and browser conversion verified with provider date |
| 14 | Client onboarding checklist | Backend/checklist live; first deposit derives from own successful orders; isolated signed-in HTTP journey verified, with production browser-session testing still qualified |
| 15 | Transactional notifications and consented WhatsApp updates | Support team email queue/retries live; existing transactional emails retained; consented WhatsApp automation requires verified provider/templates |
| 16 | Support ticket experience | Live: validation, references, accessible conversations and retry-safe writes; isolated signed-in HTTP journey covers ticket/reply retries, ownership and closed conversations without real tickets |
| 17 | Help centre | Live; account/verification/MT5/payment/IB Help Centre opened and answer expansion verified |
| 18 | Administrator two-factor sign-in and audit history | Live: owner/manager logins, per-address OTP, scoped permissions, immediate revocation and owner-only activity history |
| 19 | Failure alerts, database backups and restore verification | Hourly GitHub monitor active; Render HTTP /health now configured and live, with existing Only failure notifications inherited. Actual production database access/backup restore and real alert delivery remain unverified; the currently accessible Atlas project is empty |
| 20 | Form validation, errors and confirmations | Live: support/server validation, duplicate-submit handling and registration/contact inline confirmations; no real form submission generated |
| 21 | Consistent BDFX branding and original assets | Live: homepage claim cleanup, original market information cards and Education/News content; public content checks passed |
| 22 | Daily business report | Live admin report with Dubai dates, registration/account counts, payment-status counts and work queues; excludes mixed-currency monetary totals |
| 23 | Auto SEO with blogs | Live: first guide published at 06:03 Dubai on 21 October; five original guides queued as private drafts, weekly durable queue, administrator pause/resume/history, automatic missing SEO fields, contextual links/Article markup and sitemap updates; existing content and manually entered metadata preserved |
| 24 | Multilingual guided support chatbot | Six languages, four guided stages, seven topics/fourteen automatic answers, local search and support handoff. Owner follow-up adds optional saved-session/contact capture and protected Chat Reports with session/activity counts, Dubai filters, question history and team notes; deployment evidence is in the latest continuation checkpoint. WinproFX comparison remains limited to observed public behavior. |

Point 23 extends point 10's existing blog/SEO foundation. The first eligible article publishes on the initial successful run, followed by at most one every seven days. Six original evergreen guides provide the starter queue; administrators can enqueue more drafts. No external AI provider or new paid service is used. Search Console discovery does not guarantee indexing or ranking. Backend runbook: docs/automatic-blogs.md.

Deploy client authentication headers before enabling backend route enforcement. Verify the frontend's Vercel build and the backend's Render deploy, then perform anonymous access smoke checks without retrieving customer records or creating trades, deposits, or withdrawals.

Continuation details and unresolved setup dependencies: see [CONTINUE_BDFX.md](CONTINUE_BDFX.md).

Current provider/configuration dependencies and the scoped payment follow-up: [operations-readiness.md](operations-readiness.md). User approved both merges; Render backend and Vercel frontend releases are verified live. Actual provider delivery, a signed-in production browser session and unresolved setup remain qualified above. Isolated signed-in HTTP journey checks pass without real customers or transactions.

Earlier automatic-blog release: frontend `2af2d0b` (Vercel `5NVvLTaREycx5GvxCwFZXBbFZ7M8` succeeded), backend `800b6cb` (Render `dep-dbc1qduq1p3s73bgsk5g` live). First article, loaded cover and sitemap inclusion are verified; current XML has 29 page URLs and one image. See the completion checkpoint in CONTINUE_BDFX.md. Search Console verification and the 28-page sitemap succeeded. Retain only RameePay INR, RameePay Crypto and Cregis Crypto; DigiPay/TrustPay24 are closed. Shared duplicate-credit guard deployed; 113 backend and 21 frontend tests passed. The Search Console tag release also passed the production build and TypeScript.


Latest chat/reporting application release: frontend `a905ae6` (Vercel `GwwaBMMqkvcpmj4qsic3AHjPqAbe` succeeded), backend `1751e7e`. The later Render configuration deploy `dep-dbcar9gn74is73fuidm0` is live with the same backend code and HTTP health path /health. Registration identity/support-chat storage preflights passed at 16:19 Dubai on 21 October. Existing validation is 137 backend tests, 27 frontend tests and the production build/TypeScript. WhatsApp OTP delivery is **not activated**: startup reports unconfigured/disabled. Public options confirm email signup remains available. The separate floating WhatsApp icon remains removed. See the latest CONTINUE_BDFX.md checkpoint and backend docs/mobile-registration.md.

Four roadmap items remain partly open: #7, #11, #15 and #19. These cover domain email/inbox placement, actual WhatsApp OTP activation, transactional WhatsApp updates, GA4 live publication/event/consent verification and production backups/restore/alert delivery. Render health configuration and correct Google/Render authentication are now complete. Production signed-in browser verification and country-policy review remain final qualifications. The owner confirmed Google's final creation/Terms step and BDFX account/stream now exist. Actual BDFX domain/mailbox and production database access are still needed; Render payment is owner-confirmed completed.
