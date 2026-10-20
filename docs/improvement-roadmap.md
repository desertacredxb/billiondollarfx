# BDFX improvement roadmap

Requested implementation order: complete and verify each item before continuing to the next.

| Item | Work | Status |
| --- | --- | --- |
| 1 | Client/account access and administrator authentication | Live; build, automated checks and anonymous access checks passed |
| 2 | Public Open Account actions | Connected to registration; release verification pending |
| 3 | Contact enquiries and CRM visibility | Implemented with persisted records, reference IDs, team notes and retrying email notifications; release verification pending |
| 4 | MT5 downloads, WebTrader and setup instructions | Official mobile/store/download links and connection guide implemented; existing provider WebTrader URL needs availability confirmation |
| 5 | Consistent account offering and pricing | Pending; use verified business settings |
| 6 | Unified IB application and referral journey | Limited referral report secured; onboarding pending |
| 7 | OTP email delivery | Pending; SMTP/domain alignment needs verification |
| 8 | UAE restriction content | Pending |
| 9 | Withdrawal information and support escalation | Pending |
| 10 | Blog, sitemap and page SEO | Pending |
| 11 | GA4/Search Console and conversion tracking | Pending; account/property access must be verified |
| 12 | Mobile media performance and expired promotions | Pending |
| 13 | Calculators and calendar tools | Pending |
| 14 | Client onboarding checklist | Pending |
| 15 | Transactional notifications and consented WhatsApp updates | Pending; provider setup must be verified |
| 16 | Support ticket experience | Access secured; usability review pending |
| 17 | Help centre | Pending |
| 18 | Administrator two-factor sign-in and audit history | Sign-in implemented; audit history pending |
| 19 | Failure alerts, database backups and restore verification | Pending; infrastructure access must be verified |
| 20 | Form validation, errors and confirmations | Pending |
| 21 | Consistent BDFX branding and original assets | Pending |
| 22 | Daily business report | Pending |

Deploy client authentication headers before enabling backend route enforcement. Verify the frontend's Vercel build and the backend's Render deploy, then perform anonymous access smoke checks without retrieving customer records or creating trades, deposits, or withdrawals.
