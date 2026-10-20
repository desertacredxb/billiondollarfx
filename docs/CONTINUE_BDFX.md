# Continue BDFX improvements

Checkpoint: 21 October 2026, Dubai time. Work on branch `codex/bdfx-improvements-2026-10-21`. Preserve the working live Veriff registration, UAE/document restrictions, owner/manager access and production changes. Never print credentials, OTPs or provider secrets.

## Current production state — user-approved release

The user approved merging both prepared PRs and deploying to Render/Vercel on 21 October 2026 (Dubai time). The earlier automatic-review rejection is resolved by that approval; both merges succeeded. No production publication approval is outstanding for this release.

- Frontend repository: `desertacredxb/billiondollarfx`.
- Frontend production main: `24867e80cdfaf51912869183940777216915f479`.
- Frontend PR: https://github.com/desertacredxb/billiondollarfx/pull/4 — merged.
- Vercel production deployment `EtaVKXg6uJeLMYCyZ3iciEuSDJ6V` reported success for that main commit.
- Live site: https://www.billiondollarfx.com.
- Backend repository: `desertacredxb/Billion_Doller_Backend`.
- Backend production main: `a8ee4b725d8ce72a34a39b1fbdeb92d6a199f930`.
- Backend PR: https://github.com/desertacredxb/Billion_Doller_Backend/pull/4 — merged.
- Render deployment `dep-dbbvjv49v7es73a1hpa0` is live for that main commit. Post-release application-error log queries returned no entries in the inspected initial window.
- Both deployments were triggered automatically by their main-branch merges. No redundant deploy was triggered.
- Production public UI verification is complete for Help Centre interaction, calculator calculation/validation, currency conversion and economic calendar loading. Anonymous support redirects to `/login`; no signed-in customer journey was exercised.
- The separate feature preview remains protected by Vercel sign-in. Vercel account API access to team `mondusgroup` remains unavailable through the connected Vercel app, but GitHub commit status and public production verification established the release outcome. Do not disable deployment protection or request secrets in chat.

## Implemented in the live release

The release adds the Help Centre, payment-delay escalation guide, account onboarding checklist, input-based Forex calculator, daily currency reference proxy/converter, TradingView calendar, original market information cards, useful Education/News pages and homepage claims cleanup. It removes unverified rankings/counts, guaranteed rewards language and misleading always-instant claims from the updated homepage sections.

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
- Live HTTP checks returned 200 for homepage, Help Centre, calculator, Education, News, sitemap and optimized media. The new Help Centre is in the sitemap; inspected unverified homepage claims are absent. Media Content-Length matches the optimized asset sizes.
- Browser checks: Help Centre answer expands; a 0.2-lot sell example produces 20,000 units, margin 220, pip value 2 and estimated loss -200. Leverage 501 displays validation instead of a result. TradingView iframe displays scheduled events. These calculator values are test examples, not trading recommendations.
- Implementation Git trees exactly matched tested local indexes. Production trees: frontend `4acd1a3b236274385eea2e913a18a2f914076156` (includes continuation documentation); backend `1d052b757fd624542755c8700e8624b38aae7d62`.
- Live `/admin` resolves to `/admin-login`; live `/health` returns 200 with database connected. Anonymous `/api/staff`, `/api/operations/report` and `/api/tickets/admin` return 401.
- No real OTP, ticket, enquiry, customer email, financial account, deposit, withdrawal or trade was created by tests. No global customer list was retrieved.
- Production reference proxy returned HTTP 200 for USD/INR and 165 currencies. Browser conversion displayed 100 USD = 9,484 INR with provider reference date 2026-10-20. These are dated reference rates, not broker execution quotes. Sandbox direct upstream requests still return 403; proxy failure states are covered by mocks.
- Provider WebTrader sandbox request returned 503. This does not establish a global outage; the configured URL remains https://webterminal.ascendsmarkets.com/terminal.

## Remaining provider/configuration dependencies

1. **SMTP/inbox placement:** inspect actual received mail headers and verified domain/provider settings before changing SPF/DKIM/DMARC or claiming spam resolution. See `docs/operations-readiness.md` for SMTP configuration.
2. **GA4/Search Console:** obtain access to the existing BDFX properties, verify the actual measurement ID and disable enhanced automatic measurement before enabling the manual integration. Existing Google meta verification is not ownership/indexing proof. Do not invent IDs or rankings.
3. **WhatsApp automation:** verify the real BDFX business provider, approved templates and consent/opt-out setup. Current chat links are not transactional automation. No WATI plugin was found in the directory search.
4. **Backups/alerts:** the user installed MongoDB Atlas during this turn. The connected account returned no projects and no clusters. Access to the existing BDFX Atlas project is still needed; do not create a replacement database. Render service `srv-d39uut0dl3ps73aiomjg`, workspace `tea-cvptm7adbo4c7396cigg`, has empty HTTP healthCheckPath and default notifyOnFail. Backup/restore and actual alert delivery are unverified. No Render CLI credentials are present.
5. **Provider WebTrader:** verify availability with the actual provider. Keep official desktop/mobile MT5 alternatives; do not substitute another terminal or create a real financial account for testing.
6. **Payment callbacks:** source review found no visible provider-signature verification before state mutation in the inspected Cregis/Truepay9 handlers. Ramee/crypto encryption must not be assumed to authenticate every callback. No forged callback was sent and payment code was not changed. Provider specs and a mocked/sandbox financial reconciliation review are required. See `docs/operations-readiness.md`.
7. **Country eligibility:** preserve legacy rules, including the existing Pakistan restriction, until business review. Do not add UAE marketing pages or invent country-specific legal availability.

## Next actions for remaining setup

Continue the provider/configuration dependencies above. Re-read current main refs before any code changes and preserve intervening live work. Do not repeat completed merges or deployments. Test signed-in support/onboarding only in an authorized non-production test session without contacting real clients or moving money. Any future publication must be scoped to the next requested change; the current release is already live.

For publication, Git CLI read access works but CLI push credentials are unavailable. Use Git Data tools: create blobs/tree, require tree equality with `git write-tree`, create commit, and use `update_ref` with the observed expected SHA. For a new branch, use `create_branch`; `update_ref` cannot create a missing ref in this integration.

## Working locations

- Frontend: `/workspace/scratch/3d0754b3c2e6/billiondollarfx`
- Backend: `/workspace/scratch/3d0754b3c2e6/Billion_Doller_Backend`

Use CUA for browser interaction. Browser localhost cannot reach the executor's isolated network. Never enter authentication credentials or OTPs through ordinary browser APIs; use the secure handoff if needed. If these workspaces expire, clone the repositories and check out the improvement branch.
