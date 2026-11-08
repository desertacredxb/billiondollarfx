const baseline = {
  "revision": "9564fcb6ef6fecd4d1621b87c3353024259d3e28",
  "files": {
    "components/settings/IdentityNameCorrection.tsx": "cf89e2578ae11c4e10f6d474683c53752a1fd100169f1d1e7005064a695fcc8f",
    "components/settings/IdentityVerificationGuidance.tsx": "3c0fc72fc39015a7ac782ef9176d874bf1dcbb058e8bd9c60433e45b649d0543",
    "components/settings/VeriffVerification.tsx": "241ffa590e7b2ac5959e81eeea727506a42153856a4c88d6ea4197df787e63f9",
    "lib/verificationActions.ts": "61911cd5884dfcf1468919bafeeb4edd9b0687e6f5a982d8c20fb79f2d2b15ed",
    "src/app/verify-identity/page.tsx": "6ffa8dccc9e8b20635cbcde9e5f57b3391217986bd7a25f289d0793d6e18ab5c"
  },
  "sections": [
    {
      "path": "src/app/(admin)/users/page.tsx",
      "start": "  isKycVerified?: boolean;",
      "end": "  profileImage?: string;",
      "hash": "9b303e4bcd848a45289fc41e906fd17aa24ba571ae1c922efc0213f13394a93e"
    },
    {
      "path": "src/app/(admin)/users/page.tsx",
      "start": "  const adminSession = useAdminSession();",
      "end": "  const [verifying,",
      "hash": "2b76876e00ca38d4e7a32d7fece78e66a2b33726aab0f67a352147e473d803c3"
    },
    {
      "path": "src/app/(admin)/users/page.tsx",
      "start": "              {selectedUser.kycProvider === \"veriff\" && <section",
      "end": "              {/* Documents */}",
      "hash": "57e678208a8d5b82584de0651e7918b6805d934a2b0886b3089ef2101f0ab5fc"
    }
  ],
  "lines": [
    {
      "path": "src/app/(admin)/users/page.tsx",
      "line": "  hasSubmittedDocuments?:boolean;"
    }
  ]
};

const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");

const changed = new Set();
const digest = value => createHash("sha256").update(value).digest("hex");

function read(path) {
  try {
    return readFileSync(path);
  } catch {
    changed.add(path);
    return null;
  }
}

for (const [path, expected] of Object.entries(baseline.files)) {
  const content = read(path);
  if (content && digest(content) !== expected) changed.add(path);
}
for (const { path, start, end, hash } of baseline.sections) {
  const content = read(path)?.toString("utf8");
  if (content === undefined) continue;
  const from = content.indexOf(start);
  const to = content.indexOf(end, from + start.length);
  if (from < 0 || to <= from || content.indexOf(start, from + start.length) !== -1 ||
      digest(content.slice(from, to)) !== hash) changed.add(path);
}
for (const { path, line } of baseline.lines) {
  const content = read(path)?.toString("utf8");
  if (content !== undefined && content.split("\n").filter(value => value === line).length !== 1) changed.add(path);
}

if (changed.size) {
  console.error(`BDFX KYC is locked to ${baseline.revision}. Owner authorization is required to unlock:`);
  for (const path of [...changed].sort()) console.error(`  ${path}`);
  process.exitCode = 1;
} else {
  console.log(`BDFX KYC lock verified against ${baseline.revision}.`);
}
