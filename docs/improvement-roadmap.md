# BDFX improvement roadmap

Requested implementation order: complete and verify each item before continuing to the next.

| Item | Work | Status |
| --- | --- | --- |
| 1 | Client/account access and administrator authentication | Live; build, automated checks and anonymous access checks passed |
| 2 | Public Open Account actions | Live; browser navigation to registration verified |
| 3 | Contact enquiries and CRM visibility | Live with persisted records, reference IDs, team notes and retrying email notifications; validation/access checks passed without sending a live test email |
| 4 | MT5 downloads, WebTrader and setup instructions | Official mobile/store/download links and connection guide implemented; existing provider WebTrader URL needs availability confirmation |
| 5 | Consistent account offering and pricing | Live with supplied Liquid/$50/up to 1:500/commission-free/swap-free terms |
| 6 | Unified IB application and referral journey | Live: public entry, post-verification IB navigation, secured limited referrals and input-based earnings estimate |
| 7 | OTP email delivery | Pending; SMTP/domain alignment needs verification |
| 8 | UAE restriction content | Public eligibility and footer updated; other existing country restrictions need business review |
| 9 | Withdrawal information and support escalation | Supplied USDT 1–4 hour timing aligned in public summaries; help/escalation content prepared in checkpoint; publication pending |
| 10 | Blog, sitemap and page SEO | Live: backend blog storage, scheduled visibility, published SSR, unique metadata/canonicals, sitemap and private noindex rules |
| 11 | GA4/Search Console and conversion tracking | Pending; account/property access must be verified |
| 12 | Mobile media performance and expired promotions | Expired 2025 trading/IB offers archived; optimized media and reduced-motion component prepared in checkpoint; binary publication pending |
| 13 | Calculators and calendar tools | IB earnings estimate implemented using the client's agreed inputs; Forex calculator, reference converter and calendar prepared in checkpoint; live upstream/build checks pending |
| 14 | Client onboarding checklist | Backend live; UI prepared in checkpoint; first deposit derives from own successful orders |
| 15 | Transactional notifications and consented WhatsApp updates | Pending; provider setup must be verified |
| 16 | Support ticket experience | Access secured; usability review pending |
| 17 | Help centre | Prepared in checkpoint; final build and release pending |
| 18 | Administrator two-factor sign-in and audit history | Live: owner/manager logins, per-address OTP, scoped permissions, immediate revocation and owner-only activity history |
| 19 | Failure alerts, database backups and restore verification | Pending; infrastructure access must be verified |
| 20 | Form validation, errors and confirmations | Pending |
| 21 | Consistent BDFX branding and original assets | Public platform/IB releases cleaned up; homepage and market-card cleanup prepared in checkpoint |
| 22 | Daily business report | Live admin report with Dubai dates, registration/account counts, payment-status counts and work queues; excludes mixed-currency monetary totals |

Deploy client authentication headers before enabling backend route enforcement. Verify the frontend's Vercel build and the backend's Render deploy, then perform anonymous access smoke checks without retrieving customer records or creating trades, deposits, or withdrawals.

Continuation details and unresolved setup dependencies: see [CONTINUE_BDFX.md](CONTINUE_BDFX.md).
