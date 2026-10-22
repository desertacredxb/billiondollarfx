# Veriff registration flow

Deploy together with the Veriff backend in `desertacredxb/Billion_Doller_Backend`. Registration collects Veriff-required identity/residency details by default. Actual Veriff enrollment and approval remain controlled by the backend flags; browser configuration never grants approval. Set the public flag explicitly to false only when a release needs the older registration form, and keep backend enrollment disabled for that release.

```text
NEXT_PUBLIC_VERIFF_ENABLED=false
```

Unless explicitly disabled at build time, registration collects nationality and country of residence separately. After successful email OTP, a server-provided `kycRequired` flag sends the authenticated client to `/verify-identity`. They continue to the hosted Veriff flow. The return page polls authenticated backend status for up to two minutes and offers a manual refresh; it never uses URL parameters or a browser-reported outcome as an approval.

The login screen sends a Veriff-managed, unapproved client back to verification. The Settings KYC tab shows Veriff for clients whose backend profile has `kycProvider=veriff`. Existing manual accounts keep their current document-upload path. The profile form now includes its bearer token to match the backend's ownership checks.

No Veriff API key or shared secret belongs in a `NEXT_PUBLIC_` variable. Configure those only in the backend. The expected production callback is `https://billiondollarfx.com/verify-identity`. Test staging with its own test integration, environment settings, and URLs before switching production to live verification.

IB applications send their bearer token and follow the backend's `verificationRequired` result. If needed they continue to `/verify-identity?returnTo=ib`, then return to their IB application after verification. An already live-Veriff-verified client can receive automatic IB approval on application submission. An existing manual-verified client can explicitly start a new Veriff identity check for their IB application; the page explains the pending identity state before they continue.

Automatic IB activation requires backend `VERIFF_IB_AUTO_APPROVAL=true` and an eligible live verification. The identity page distinguishes verified identity from an IB role that is still processing. It never grants a role or referral code in browser storage.

Document choices and selfie requirements are controlled by the selected Veriff product. API failures leave the application pending and show a retry/support action. Verification-time guarantees, MT5 provisioning, bank approval, and WhatsApp OTP are separate from this change.

Owner clarification, 22 October 2026: provider failures/review, including reason `501`, retain **Edit name & resubmit**, **Save details** and **Resubmit verification** when allowed by the backend. A client can also resubmit without changing the name. Only address editing was removed; no address input is restored. ID/document and selfie instructions remain visible independently of the action permissions. A fresh attempt still requires a fresh signed Veriff approval and the existing BDFX eligibility checks. Explicit owner/policy holds remain enforced.
