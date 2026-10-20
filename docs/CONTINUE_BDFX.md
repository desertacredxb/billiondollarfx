# Continue BDFX improvements

Checkpoint: 21 October 2026, Dubai time. Work on branch `codex/bdfx-improvements-2026-10-21`. Preserve the working live Veriff registration, UAE/document restrictions, owner/manager access and production changes. Never print credentials, OTPs or provider secrets.

## Current review and deployment state

- Frontend repository: `desertacredxb/billiondollarfx`.
- Frontend implementation commit: `1d29fe8acd407b16ee6bfeb381b5041761747054`.
- Frontend draft PR: https://github.com/desertacredxb/billiondollarfx/pull/4.
- Vercel reported a successful preview build for that implementation commit. Preview: https://billiondollarfx-git-codex-bdfx-improvements-b2ad28-mondusgroup.vercel.app.
- Preview browser navigation redirects to Vercel sign-in/access request. UI verification is not complete. The Vercel connector returned 403 for team `mondusgroup`; no local CLI credential or development OIDC token was available. Do not disable deployment protection or request secrets in chat.
- Frontend production main remains `43046cc22132cbbfa639ad03e26b346357eed6bb`.
- Backend repository: `desertacredxb/Billion_Doller_Backend`.
- Backend implementation commit: `1cd8b9b8aab146a3003f5e7a21ec8268df6602f3`.
- Backend branch uses the same improvement branch name. Draft PR: https://github.com/desertacredxb/Billion_Doller_Backend/pull/4.
- Backend production main remains `015c31726c8005b2def61409534cd72e184a9f60`; Render deploy `dep-dbbv0fjncjis73fe5fag` remains live.
- **Production publication is blocked pending explicit approval.** Automatic approval review rejected advancing backend main because the user's current request specified a feature branch and did not clearly authorize replacing production/default refs. Do not retry production ref updates, merge PRs or trigger an equivalent production deployment to work around that rejection. The next user approval should explicitly cover merging both PRs to main and their Render/Vercel production deployments. Continue read-only checks and feature-branch corrections as needed.

## Implemented in the pending release

The candidate adds the Help Centre, payment-delay escalation guide, account onboarding checklist, input-based Forex calculator, daily currency reference proxy/converter, TradingView calendar, original market information cards, useful Education/News pages and homepage claims cleanup. It removes unverified rankings/counts, guaranteed rewards language and misleading always-instant claims from the updated homepage sections.

Registration and contact forms prevent repeated submissions and show inline confirmation/error feedback. The support page adds field validation, ticket references, keyboard-accessible conversations, original descriptions, reply refresh, retained text after failures and loading states. Backend ticket/reply request IDs have partial unique indexes; retries reuse saved records rather than re-creating them. New replies to closed tickets are rejected and authenticated account-based rate limits protect writes. Existing ownership and staff permission middleware remains in place.

New ticket notifications persist queue state and retry team email up to three times. The shared mailer verifies TLS, bounds connection timeouts, defaults From to the authenticated mailbox and supports explicit SMTP configuration. These changes do not prove inbox placement. Email retries are at-least-once; an interrupted send can duplicate a notification. Existing old tickets without queue state are not retroactively emailed.

GA4 is prepared but disabled pending verified property configuration. Optional analytics requires explicit visitor consent; manual public pageviews use fixed allowlisted paths. Lead and signup events occur after successful server confirmation and do not carry form values or private URLs. Existing Meta Pixel behavior was preserved, not certified.

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
- Frontend: `node --test test/*.test.cjs` — 18/18 pass, including calculation math, reference API failures, form validation and consent/no-private-data events.
- Backend: `npm test` — 88/88 pass, including Veriff/UAE restrictions, scoped staff access, duplicate-index recovery, session-derived reply sender, closed tickets and safe mail failures.
- Local production-server HTTP checks returned 200 for Help Centre, Forex calculator, Education, News and both optimized MP4s. Same-currency conversion returned rate 1; the external USD/INR request returned the explicit unavailable 503 response. Browser UI verification remains separate and incomplete.
- Candidate Git trees exactly match tested local indexes: frontend `f8dc06296d095aa31db064331802c0afef84c125`; backend `1d052b757fd624542755c8700e8624b38aae7d62`.
- Live `/admin` resolves to `/admin-login`; live `/health` returns 200 with database connected. Anonymous `/api/staff`, `/api/operations/report` and `/api/tickets/admin` return 401.
- No real OTP, ticket, enquiry, customer email, financial account, deposit, withdrawal or trade was created by tests. No global customer list was retrieved.
- A sandbox request to Frankfurter returned 403; the proxy's explicit unavailable state is covered by tests. Do not claim live currency conversion until the deployed proxy returns a valid provider-dated rate.
- Provider WebTrader sandbox request returned 503. This does not establish a global outage; the configured URL remains https://webterminal.ascendsmarkets.com/terminal.

## Remaining provider/configuration dependencies

1. **SMTP/inbox placement:** inspect actual received mail headers and verified domain/provider settings before changing SPF/DKIM/DMARC or claiming spam resolution. See `docs/operations-readiness.md` for SMTP configuration.
2. **GA4/Search Console:** obtain access to the existing BDFX properties, verify the actual measurement ID and disable enhanced automatic measurement before enabling the manual integration. Existing Google meta verification is not ownership/indexing proof. Do not invent IDs or rankings.
3. **WhatsApp automation:** verify the real BDFX business provider, approved templates and consent/opt-out setup. Current chat links are not transactional automation. No WATI plugin was found in the directory search.
4. **Backups/alerts:** the user installed MongoDB Atlas during this turn. The connected account returned no projects and no clusters. Access to the existing BDFX Atlas project is still needed; do not create a replacement database. Render service `srv-d39uut0dl3ps73aiomjg`, workspace `tea-cvptm7adbo4c7396cigg`, has empty HTTP healthCheckPath and default notifyOnFail. Backup/restore and actual alert delivery are unverified. No Render CLI credentials are present.
5. **Provider WebTrader:** verify availability with the actual provider. Keep official desktop/mobile MT5 alternatives; do not substitute another terminal or create a real financial account for testing.
6. **Payment callbacks:** source review found no visible provider-signature verification before state mutation in the inspected Cregis/Truepay9 handlers. Ramee/crypto encryption must not be assumed to authenticate every callback. No forged callback was sent and payment code was not changed. Provider specs and a mocked/sandbox financial reconciliation review are required. See `docs/operations-readiness.md`.
7. **Country eligibility:** preserve legacy rules, including the existing Pakistan restriction, until business review. Do not add UAE marketing pages or invent country-specific legal availability.

## Next actions after production approval and access

Re-read current main refs before release; preserve any intervening live work. Review/merge the backend PR first, monitor its Render deployment until live, then release the frontend and wait for Vercel success. Avoid redundant deploy triggers when auto-deploy is already running. Verify public Help Centre, calculator, converter success/error states, media, registration entry and anonymous API protection. Test signed-in support/onboarding only in an authorized non-production test session without contacting real clients or moving money.

For publication, Git CLI read access works but CLI push credentials are unavailable. Use Git Data tools: create blobs/tree, require tree equality with `git write-tree`, create commit, and use `update_ref` with the observed expected SHA. For a new branch, use `create_branch`; `update_ref` cannot create a missing ref in this integration.

## Working locations

- Frontend: `/workspace/scratch/3d0754b3c2e6/billiondollarfx`
- Backend: `/workspace/scratch/3d0754b3c2e6/Billion_Doller_Backend`

Use CUA for browser interaction. Browser localhost cannot reach the executor's isolated network. Never enter authentication credentials or OTPs through ordinary browser APIs; use the secure handoff if needed. If these workspaces expire, clone the repositories and check out the improvement branch.
