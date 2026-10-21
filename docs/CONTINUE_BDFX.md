# Continue BDFX improvements

Checkpoint: 21 October 2026, Dubai time. Work on branch `codex/bdfx-improvements-2026-10-21`. Preserve the working live Veriff registration, UAE/document restrictions, owner/manager access and production changes. Never print credentials, OTPs or provider secrets.

## Latest owner instruction — keep only the chatbot floating control

The owner explicitly requested: remove the WhatsApp sign because the chatbot is enough. The root layout no longer imports or mounts the separate floating WhatsApp button. Keep BDFX Help as the floating support control. This UI request does not enable or cancel the pending WhatsApp mobile OTP/provider setup, or change payment, trading, registration or contact data.

Frontend PR 10 https://github.com/desertacredxb/billiondollarfx/pull/10 is merged to main `81434de341c2364d6af7925c0d2a17fdff5152fd`, tree `1a619c3e903a101025cfe1435daddb497deff9b7`; Vercel production `AygQb6Xy6puf8tSPUq1HfrdA3bH6` succeeded. The tree equals the tested local index. All 24 existing frontend tests and the Next.js production build including TypeScript passed; the initial Google Fonts TLS fetch failure was resolved by enabling system TLS certificates for the local build only. On the reloaded production homepage, the browser found zero `Chat on WhatsApp` links and verified the BDFX Help launcher and opened six-language guide. Public proof: bdfx-chatbot-only-1792576317559.jpg. The deployed application change is only the two-line import/mount removal; the other changes are continuation documentation.

## Latest completion checkpoint — mobile identity and multilingual chatbot

The owner asked for mobile OTP in addition to the existing email OTP and to prevent a second client login with the same email OR phone, then explicitly selected **WhatsApp**. The owner also requested a WinproFX-style multilingual chatbot and repeated that request while implementation was underway. Preserve both goals; neither cancels the other. No new login/approval prompt is authorized or required for the code work.

Implementation now includes canonical new email/phone identities, legacy format matching, partial unique indexes for race protection, server-bound email -> WhatsApp -> client activation -> existing Veriff, hashed codes/tokens, expiry/attempt/resend limits, consent and a compatible email-only rollout. The existing Teleobi adapter is hardened and requires the actual BDFX authentication template in configuration; an old hard-coded ID is not proof of approval. **Do not claim live WhatsApp delivery until the provider is actually configured and a permitted verification succeeds.** The feature flag stays off until that dependency is satisfied, preserving email signup. Backend runbook: docs/mobile-registration.md.

The public WinproFX widget showed a LiveChat greeting and required enquiry form with five categories. Its site offers ten languages, but choosing Hindi left the chat form in English. No contact details or messages were sent. Deeper automation and chatbot language support are not verified. BDFX now has an original four-stage guided flow with six complete languages, seven topics and fourteen answers; it uses existing contact/ticket links and does not pretend a live agent is connected. See docs/chatbot-flow.md. The roadmap now has 24 points.

Verified release: **125 backend tests, 24 frontend tests and the production build including TypeScript pass**. Frontend PR 9 https://github.com/desertacredxb/billiondollarfx/pull/9 merged to main `e7c76cf7a56c59c81eecb96a967c96a58219ed9d`, tree `a794d9d6a6648211c09889755b81f5ffb4abc1d1`; Vercel production `39QqahiW8WUDuoGRoPjgVG4xFPvK` succeeded. Backend PR 9 https://github.com/desertacredxb/Billion_Doller_Backend/pull/9 merged to main `e0546db9343a7bfbb2520215511d7e0833c7efcd`, tree `08dd0c2aad75be314c400c7762edd830298ff121`; Render `dep-dbc33fbm8hqs73bd74ag` is live. Both deployed Git trees equal the tested local indexes. Tests use synthetic stores/provider mocks and send no real OTP, WhatsApp message or email. Existing Veriff/UAE/document restrictions, country rules, retained payment configuration and working platform are preserved. No existing customer merge, deletion or identity backfill is performed. The pending-registration TTL is extended only for unverified drafts to allow both OTP stages; verified users are excluded.

Production startup reported **Registration identity storage preflight passed** at 07:31 Dubai. It also reported **Registration WhatsApp OTP: unconfigured; enforcement disabled**. The public options endpoint returns HTTP 200, mobileOtpRequired:false, mobileOtpChannel:whatsapp and registrationAvailable:true. Health is 200/database connected; empty registration/mobile-verification requests return 400 before account creation and anonymous client lists return 401. Do not claim a real mobile has been verified or enable mandatory WhatsApp delivery with missing provider settings. Email signup remains enabled. The actual WhatsApp provider token, sending number and approved authentication template are still required; do not paste secrets in chat or repeat declined provider logins.

The initial live browser check exercised English menu -> Hindi -> withdrawal subtopic -> automatic USDT timing answer, then changed that same answer to Bengali and back to Hindi. The answer, guide link, consent/privacy boundary and six language choices rendered correctly. The original screenshot also shows a WhatsApp chat link on the left; the owner subsequently requested removal of that separate floating icon. Public proof of the initial flow: bdfx-multilingual-chat-live-20261021.jpg. This is a guided automatic support bot, not an assertion that a live human agent or a WhatsApp business automation account is connected. WinproFX's deeper automation remains unverified behind its required real-details form.

Identity normalization also handles country-appropriate leading-zero variants via libphonenumber-js. Ambiguous old local numbers without a country code are reserved for support review rather than allowing a potentially duplicate client; an unrelated international number with the same local digits can consequently need support. No existing customer identity is migrated, merged or deleted. The duplicate rule concerns client logins; existing MT5-account and IB behavior is retained.

## Current production state — verified 21 October 2026

The owner's payment instruction is to retain exactly RameePay INR, RameePay Crypto and Cregis Crypto, close TrustPay24 and keep DigiPay closed. The payment change is scoped to preventing duplicate credits while preserving retained gateway configuration and calculations.

- Frontend main: `81434de341c2364d6af7925c0d2a17fdff5152fd`; PR 10 removes the separate floating WhatsApp icon and keeps BDFX Help. Vercel `AygQb6Xy6puf8tSPUq1HfrdA3bH6` succeeded and the live browser verified the result. Earlier multilingual registration/chat, automatic-blog and cover/sitemap releases remain included.
- Frontend PR https://github.com/desertacredxb/billiondollarfx/pull/6 merged the owner's Search Console verification alongside the existing tag. Vercel production deployment `37rARNFDuWqtkGVDScd1GTQsmKEr` reported success; both tags are present on the live HTTP 200 homepage.
- Search Console ownership is verified for `https://www.billiondollarfx.com/` using the new HTML tag. The sitemap was submitted and Google reported **Sitemap processed successfully**, with 28 discovered pages and 0 discovered videos on 21 October 2026. An initial Couldn't fetch state resolved during the same verification session; do not duplicate the submission. Discovered does not mean all 28 pages are indexed.
- Frontend PR https://github.com/desertacredxb/billiondollarfx/pull/5 merged. Vercel production deployment `2hUyGi9uxDmZZgHjuFGJoRTvEqFT` reported success.
- Backend main: `e0546db9343a7bfbb2520215511d7e0833c7efcd`; registration identity/WhatsApp OTP PR 9 is merged.
- Backend PR https://github.com/desertacredxb/Billion_Doller_Backend/pull/5 merged, followed by startup fix PR https://github.com/desertacredxb/Billion_Doller_Backend/pull/6.
- Render deployment `dep-dbc33fbm8hqs73bd74ag` is live. The registration storage preflight passed; WhatsApp OTP is unconfigured/disabled and email registration is available. Existing payment and Veriff startup checks remain in place. The first blog remains public; its earlier automatic-publication proof is recorded below.
- The first backend rollout `dep-dbc0ele8bjmc73d2bhf0` failed because Model.init retained a pre-connection auto-create error with buffering disabled. The fix directly inspects the connected collection, following the existing Veriff pattern. The previous production instance stayed healthy while the fix was deployed. This failure is resolved; do not redeploy the failed intermediate main commit.
- Backend tests: **125/125 pass**. Frontend tests: **24/24 pass**. Next.js production build and TypeScript pass. Payment, database-failure and retry scenarios used mocked financial services; no live payment/account/deposit/withdrawal/refund/callback/email was created for tests.
- Active frontend payment components are exactly RameePay, CryptoPay and Cregis. TrustPay24 was removed. DigiPay/TrustPay24 deposit and callback handlers and the unused TruePay9 callback return HTTP 410. Closed-provider records are retained and automatic reconciliation skips them.
- Both main merges triggered automatic deployments. No redundant deployment was triggered.
- Hourly health workflow is on backend main. Its first push-triggered run succeeded: https://github.com/desertacredxb/Billion_Doller_Backend/actions/runs/39521595904. Actual outage notification delivery was not forced/tested.
- Live site: https://www.billiondollarfx.com. Backend: https://billion-doller-backend.onrender.com.

The earlier 22-point release remains in place, including Veriff/UAE restrictions, owner/manager access, Help Centre, calculations, reference rates and support changes. Isolated signed-in HTTP journeys now pass with synthetic stores; a signed-in production browser session remains unexercised. The protected Vercel preview/team API access limitation remains; do not disable protection or request secrets in chat.

## Implemented in the live release

The release adds the Help Centre, payment-delay escalation guide, account onboarding checklist, input-based Forex calculator, daily currency reference proxy/converter, TradingView calendar, original market information cards, useful Education/News pages and homepage claims cleanup. It removes unverified rankings/counts, guaranteed rewards language and misleading always-instant claims from the updated homepage sections.

Registration and contact forms prevent repeated submissions and show inline confirmation/error feedback. The support page adds field validation, ticket references, keyboard-accessible conversations, original descriptions, reply refresh, retained text after failures and loading states. Backend ticket/reply request IDs have partial unique indexes; retries reuse saved records rather than re-creating them. New replies to closed tickets are rejected and authenticated account-based rate limits protect writes. Existing ownership and staff permission middleware remains in place.

New ticket notifications persist queue state and retry team email up to three times. The shared mailer verifies TLS, bounds connection timeouts, defaults From to the authenticated mailbox and supports explicit SMTP configuration. These changes do not prove inbox placement. Email retries are at-least-once; an interrupted send can duplicate a notification. Existing old tickets without queue state are not retroactively emailed.

GA4 is prepared but disabled pending verified property configuration. Optional analytics requires explicit visitor consent; manual public pageviews use fixed allowlisted paths. Lead and signup events occur after successful server confirmation and do not carry form values or private URLs. Existing Meta Pixel behavior was preserved, not certified.

## Pending-point follow-up — 21 October 2026

The user requested pending work, installed Gmail and clarified the final payment scope: keep **RameePay INR, RameePay Crypto and Cregis Crypto**; DigiPay remains closed and TrustPay24 must be closed. Preserve the retained gateways' existing configuration and calculations. Payment security work is limited to preventing double credits.

- Follow-up code adds a persistent shared deposit claim around the three retained callback paths and reconciliation. Majority/journaled writes and verification of the existing full unique orderid index protect the claim. Repeated/concurrent calls and successful legacy orders cannot submit another automatic credit. Ambiguous MT5 replies/save failures remain locked for manual reconciliation; claims must never be cleared based only on age.
- The frontend shows exactly the three retained options. DigiPay/TrustPay24 deposit/callback handlers and the unused TruePay9 callback return HTTP 410. Reconciliation skips closed providers and retains their historic records for owner review.
- Active provider configuration, URLs, keys, payload/encryption formats, conversions, minimums, charges and Cregis partial/top-up business logic are preserved. The abandoned broader Cregis re-query/signature redesign is not part of this change. Do not claim all provider authentication was certified.
- Full frontend build and 21 frontend tests pass. **113 backend tests pass**. Publication/deployment outcome is recorded in the current production state above. Every payment call in tests is mocked; no live financial transaction or callback was sent.
- An hourly GitHub Actions health monitor is published on main and its first run succeeded. It checks backend/database readiness and the public website, creates/updates one bot alert issue on failure and closes it on recovery. Actual outage notification/email delivery remains unverified; no test outage or issue was generated.
- Gmail metadata evidence: two recent administrator OTP messages are currently in Trash; three older client/broker OTPs, a welcome email and an IB approval email are in Spam. These examples pass SPF/DKIM/DMARC for Gmail. Headers show Gmail rewrote the requested domain From to the authenticated Gmail sender. Receipt/authentication is confirmed for these examples, not inbox placement or domain authentication for billiondollarfx.com. No codes/bodies were copied, no email was generated and mailbox state was not changed. Consumer Gmail sender fallback is implemented; a verified domain sender still requires the real provider configuration.
- GitHub repository access works. A separate Render dashboard secure login reached GitHub authentication and was declined; do not repeat it unless the user asks. The Render health-path setting remains blocked by dashboard/API access.
- Scoped MongoDB discovery found Project 0 (`6ad7f5e9d7869265e2a7db73`), but cluster listing said it is a Cloud Manager group rather than an Atlas group. Production database backup access is still unverified. No replacement cluster, paid upgrade or restore was created.

Backend details: docs/payment-callback-security.md and docs/production-monitoring.md in desertacredxb/Billion_Doller_Backend. Actual backup restore, verified domain email/inbox placement, BDFX GA4 property configuration, WhatsApp templates/consent, production signed-in browser sessions and country-policy decisions remain dependencies. Search Console succeeded and the owner confirmed WebTrader works.

## Required media are now committed

All four files are included in the implementation commit, and GitHub blob SHAs match the local files:

| Asset | Git blob SHA |
| --- | --- |
| public/media/signup.mp4 | e5325cd07bd5bf041a3a8c64ab6611fe86796741 |
| public/media/dashboard-banner.mp4 | 619506447d8ee1b6fe633c2415293e4d4b75c2ad |
| public/media/signup-poster.jpg | 535f3f9eee21b70d13cc0b9e4ffa87c3c1b8ecd4 |
| public/media/dashboard-poster.jpg | fb834e3cecb4b06a9621f1a88285813aa06de3b3 |

Signup MP4: 1,369,314 bytes (original about 20.5 MB). Dashboard MP4: 2,364,378 bytes (original about 32.3 MB). Original versioned videos are preserved. An unrelated untracked partial download remains at `public/.signup.mp4.hGxGXv`; never stage it.

## Verification already completed

- `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build` passes.
- `npx tsc --noEmit` passes.
- Frontend: `node --test test/*.test.cjs` — 24/24 pass, including calculation math, reference API failures, form validation, consent/no-private-data events, Dubai schedule conversion and blog SEO links/bylines.
- Backend: `npm test` — 125/125 pass, including Veriff/UAE restrictions, scoped staff access, duplicate-index recovery, session-derived reply sender, closed tickets, safe mail failures, automatic publishing recovery and the isolated signed-in HTTP journey. The release-dependency check traverses server requires against staged Git files.
- Live HTTP checks returned 200 for homepage, Help Centre, calculator, Education, News, sitemap and optimized media. The new Help Centre is in the sitemap; inspected unverified homepage claims are absent. Media Content-Length matches the optimized asset sizes.
- Browser checks: Help Centre answer expands; a 0.2-lot sell example produces 20,000 units, margin 220, pip value 2 and estimated loss -200. Leverage 501 displays validation instead of a result. TradingView iframe displays scheduled events. These calculator values are test examples, not trading recommendations.
- Implementation Git trees exactly matched tested local indexes. Current deployed trees: frontend `a794d9d6a6648211c09889755b81f5ffb4abc1d1`; backend `08dd0c2aad75be314c400c7762edd830298ff121`. The later continuation-only branch checkpoint is not a new production release.
- Live `/admin` resolves to `/admin-login`; live `/health` returns 200 with database connected. Anonymous `/api/staff`, `/api/operations/report` and `/api/tickets/admin` return 401.
- No real OTP, ticket, enquiry, customer email, financial account, deposit, withdrawal or trade was created by tests. No global customer list was retrieved.
- Production reference proxy returned HTTP 200 for USD/INR and 165 currencies. Browser conversion displayed 100 USD = 9,484 INR with provider reference date 2026-10-20. These are dated reference rates, not broker execution quotes. Sandbox direct upstream requests still return 403; proxy failure states are covered by mocks.
- Earlier Provider WebTrader sandbox/cloud connection failures were limited environment observations. The owner subsequently confirmed the platform works, closing point 4. The configured URL remains https://webterminal.ascendsmarkets.com/terminal. No financial account or login was created for checks.

## Remaining provider/configuration dependencies

1. **SMTP/inbox placement:** inspect actual received mail headers and verified domain/provider settings before changing SPF/DKIM/DMARC or claiming spam resolution. See `docs/operations-readiness.md` for SMTP configuration.
2. **GA4:** the accessible Analytics account contains CFT's two unrelated properties. A separate BDFX account/property setup reached the required business-details form, with optional data sharing disabled, Dubai reporting time and USD selected. No new Analytics account/property was created, terms accepted or measurement ID issued. The real business size and any required terms acceptance remain owner steps; do not invent a size or reuse CFT's ID. Keep the website integration disabled until the real BDFX measurement ID is verified and enhanced automatic measurement is disabled. **Search Console is complete:** ownership verified and the sitemap processed successfully with 28 discovered pages. Indexing/ranking is not guaranteed.
3. **WhatsApp automation:** verify the real BDFX business provider, approved templates and consent/opt-out setup. Current chat links are not transactional automation. No WATI plugin was found in the directory search.
4. **Backups/alerts:** scoped discovery found Project 0, but cluster listing identified it as a Cloud Manager group rather than an accessible Atlas project. Access to the existing production project and backup operations is still needed; do not create a replacement database. The hourly GitHub health monitor is now active on backend main; its first run passed. Render service `srv-d39uut0dl3ps73aiomjg`, workspace `tea-cvptm7adbo4c7396cigg`, has empty HTTP healthCheckPath and default notifyOnFail. Backup/restore and actual alert delivery are unverified. No Render CLI credentials are present.
5. **Provider WebTrader — closed:** the owner confirmed the trading platform is working on 21 October 2026. Keep the configured terminal and official MT5 alternatives. Earlier sandbox/cloud connection failures are not evidence of a live defect. Do not change the platform or keep probing it as pending.
6. **Payment callbacks:** the owner narrowed this to duplicate-credit protection for RameePay INR/Crypto and Cregis Crypto. The shared atomic claim is implemented and mocked tests exercise all three callbacks. Broader provider authentication remains unverified and must not be silently redesigned. DigiPay and TrustPay24 remain closed. See backend docs/payment-callback-security.md.
7. **Country eligibility:** preserve legacy rules, including the existing Pakistan restriction, until business review. Do not add UAE marketing pages or invent country-specific legal availability.

## Next actions for remaining setup

### New owner request — point 23: Auto SEO with blogs

The owner requested **Auto SEO with blogs** as point 23 on 21 October 2026 (Dubai time), then authorized completing this and other possible pending work without new logins/approvals. The roadmap has 23 points. Implementation extends point 10's live blog system and is now deployed. The first original guide is publicly listed and its article renders in the production browser; title, description, canonical, BlogPosting Organization author and contextual links are verified. The five remaining starter guides stay queued as drafts. The next slot is no earlier than 28 October 2026, 06:03 Dubai, subject to the worker check.

The backend bundles six original evergreen guides and runs a durable queue in the existing Standard Render web service. The first eligible post publishes on the initial successful run; later posts are at least seven days apart. Fixed slugs, insert-only seeds, majority/journaled writes, a persistent lease and a reserved article protect retries/restarts without rewriting manually edited/archived posts. Future queue items remain Draft and are not public. Admins can pause/resume, inspect recent outcomes and enqueue additional drafts. The finite starter library is not unlimited AI/news generation; no external AI provider, subscription or new credential is used.

Missing SEO fields are filled on save, with a preview/check control that preserves existing text. Public articles use publisher Organization markup for the BDFX byline, contextual public links and the existing sitemap. Dubai date inputs are now converted explicitly to/from UTC, including cross-midnight dates. The worker's five-minute check means a publication slot is approximate, not guaranteed to the minute. Blog listing fetches and the sitemap follow-up use a 60-second cache with background revalidation; a stale response can precede the refresh. See backend docs/automatic-blogs.md. Keep rankings/indexing qualified.

The initial automatic-blog backend rollout `dep-dbc1nge7bikc73fi7t20` failed because the locally tested worker was omitted from the staged release. The previous instance remained healthy. PR 8 included the file and a staged-dependency regression check; replacement deployment `dep-dbc1qduq1p3s73bgsk5g` is live and published the article. Do not redeploy incomplete main `0368c36` or describe this resolved packaging failure as a current outage.

An isolated signed-in HTTP journey now verifies onboarding, ticket/reply retries, sender identity, foreign-client denial, closed tickets, owner/manager permission boundaries and immediate revocation. It uses real JWT/middleware/controller code with synthetic local stores. No real client, OTP, email, ticket, financial account or payment was created by those tests. A signed-in production browser session is still unexercised; do not equate these automated checks with that session.

The owner explicitly confirmed that the trading platform works, so point 4 is closed. Preserve all existing gateway, Veriff/UAE/document and country policy settings. Domain mail/inbox placement, the real BDFX GA4 setup, approved WhatsApp provider/templates/consent, production backup/restore and remaining provider settings cannot be certified from absent access; do not fabricate their completion or request more authentication while the owner is away.

### Earlier auto-blog completion checkpoint — 21 October 2026, Dubai time

The feasible code work authorized without new login/approval is complete and published. Frontend PR 8 fixed the starter cover-image optimizer allowlist using the exact HTTPS BDFX social-card path and changed sitemap caching from one hour to 60 seconds. The production build including TypeScript passed. Vercel `5NVvLTaREycx5GvxCwFZXBbFZ7M8` succeeded for main `2af2d0b`; the production browser loaded the cover (natural width 860) and the optimized image endpoint returned HTTP 200. The live sitemap now contains 29 page URLs and one image URL, including the first guide and excluding the future guide. This is the site's current XML, not a claim that Google has indexed 29 pages or rescanned the earlier submission.

The published article is https://www.billiondollarfx.com/blogs/forex-pips-points-and-pip-value. Browser proof: `bdfx-auto-blogs-verified-20261021.jpg`. No extra article was published by verification. One guide is public and five starter guides remain in the weekly draft queue; administrators can add original drafts and pause/resume. No new paid service, AI provider, credential, customer data request, account, ticket, OTP, email or financial transaction was created for tests. Existing live gateway, registration, country and Veriff/document settings were preserved.

Backend tests are 113/113 and frontend tests 21/21, with a successful production build. The initial missing-worker packaging failure is resolved, as is the cover image issue discovered during visual verification. The continuation-only branch documentation checkpoint must not trigger another production deployment.

External setup still requires the real BDFX GA4 business/property details and any required terms acceptance, verified domain mailbox/DNS/SMTP, an approved WhatsApp provider/templates/consent, the production database backup/restore access, Render HTTP health-path/alert settings and a permitted signed-in production test session. Country eligibility still needs the owner's business review. Do not request these approvals/logins while the owner is away, and do not mark them verified from code or synthetic tests. Point 4 is closed by the owner's working-platform confirmation.

### Search Console and mail setup continuation — 21 October 2026

The owner's signed-in Search Console account verified the URL-prefix property `https://www.billiondollarfx.com/` after the new HTML meta tag was deployed alongside the existing tag; preserve both. Google successfully processed the submitted sitemap with 28 discovered pages and 0 videos. Public checks confirm XML HTTP 200, the expected sitemap namespace and an unblocked robots.txt reference to the same URL. The accessible Analytics picker lists only the CFT account with Close Friends Traders and Trade Circle properties; do not connect either unrelated property to BDFX. The new BDFX account/property form is prepared through reporting settings, but no account/property was created or terms accepted because the required business size is not verified. BDFX still needs its own verified property/measurement ID.

Public DNS checks establish Hostinger MX/SPF/nameservers and DMARC `p=none`. Hostinger's three documented default DKIM CNAME selectors return NXDOMAIN. This does not establish that all custom selectors are absent. The received application email authenticates a Gmail sender, so domain mailbox/provider verification is required before switching SMTP. A secure Hostinger sign-in request was declined. Do not repeat Hostinger or Render authentication unless the owner explicitly asks. No DNS, mailbox credentials or sender configuration was changed. See operations-readiness.md for the exact non-secret observations.

Latest owner instruction: do all work possible with available access and do not ask for further approvals. Do not issue more account sign-in/approval prompts or fabricate missing provider settings, business facts, successful restore drills or delivery results. Continue independent work, preserve completed releases and state actual access/configuration blockers plainly.

Continue the provider/configuration dependencies above. Re-read current main refs before any code changes and preserve intervening live work. Do not repeat completed merges or deployments. Test signed-in support/onboarding only in an authorized non-production test session without contacting real clients or moving money. Any future publication must be scoped to the next requested change; the current release is already live.

For publication, Git CLI read access works but CLI push credentials are unavailable. Use Git Data tools: create blobs/tree, require tree equality with `git write-tree`, create commit, and use `update_ref` with the observed expected SHA. For a new branch, use `create_branch`; `update_ref` cannot create a missing ref in this integration.

## Working locations

- Frontend: `/workspace/scratch/3d0754b3c2e6/billiondollarfx`
- Backend: `/workspace/scratch/3d0754b3c2e6/Billion_Doller_Backend`

Use CUA for browser interaction. Browser localhost cannot reach the executor's isolated network. Never enter authentication credentials or OTPs through ordinary browser APIs; use the secure handoff if needed. If these workspaces expire, clone the repositories and check out the improvement branch.

Owner instruction: keep only RameePay INR, RameePay Crypto and Cregis Crypto. DigiPay and TrustPay24 are closed; do not reactivate them.
