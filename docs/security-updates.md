# Website security update — 22 October 2026

The initial dependency audit had 29 vulnerable package entries, including two critical entries. Next.js is updated within major 16 to 16.4.2, React/React DOM within major 19 to 19.3.1, and Axios to 1.20.0; compatible dependencies are refreshed in the lockfile. ESLint configuration uses the matching Next.js flat configuration. A scoped PostCSS selector-parser 7.1.6+ override removes the typography build dependency advisory and is exercised by the successful production build. Stylesheet byte equality across builds was not established.

The resulting production dependency audit has zero known findings. The complete audit retains five high-severity development-only entries in the same unpatched lint/globbing dependency chain: eslint-config-next, @next/eslint-plugin-next, fast-glob, micromatch and braces. All five lockfile nodes are marked dev-only. The underlying reviewed advisory GHSA-vfj7-8cjw-p6xm reports no patched braces release. These entries are not claimed as fixed, hidden through fake package versions or downgraded to an obsolete Next.js lint configuration. They must be revisited when an upstream fix exists.

CI checks production dependencies at moderate severity and above, and rejects critical advisories anywhere in the complete graph. The known high lint warnings remain visible in the full audit output. It also runs the existing frontend tests and production build on Node 22 using pinned GitHub Actions. No visitor/customer information is sent by these checks.

Local verification uses Node 22.23.3: 30 frontend tests and the production build/TypeScript pass. The matching backend has 198 passing tests and a completely clean dependency audit. Report runtime deployment/CI results separately from local validation; a successful local build is not proof of a completed Vercel deployment.

The Google report connection and zero-active-user parsing fix were completed earlier in this session and the owner confirmed the live Website Analytics dashboard. Production database backup/restore is still blocked on the actual existing MongoDB project access; the connected Project 0 has no clusters. See backend docs/security-and-recovery.md.

Upstream reference: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
