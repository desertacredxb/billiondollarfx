# Veriff registration flow

Deploy together with the backend `codex/veriff-registration-auto-approval` branch in `desertacredxb/Billion_Doller_Backend`. Keep the public flag unset or false until both sides and the Veriff integration are configured.

```text
NEXT_PUBLIC_VERIFF_ENABLED=false
```

When enabled at build time, registration collects nationality and country of residence separately. After successful email OTP, a server-provided `kycRequired` flag sends the authenticated client to `/verify-identity`. They continue to the hosted Veriff flow. The return page polls authenticated backend status for up to two minutes and offers a manual refresh; it never uses URL parameters or a browser-reported outcome as an approval.

The login screen sends a Veriff-managed, unapproved client back to verification. The Settings KYC tab shows Veriff for clients whose backend profile has `kycProvider=veriff`. Existing manual accounts keep their current document-upload path. The profile form now includes its bearer token to match the backend's ownership checks.

No Veriff API key or shared secret belongs in a `NEXT_PUBLIC_` variable. Configure those only in the backend. The expected production callback is `https://billiondollarfx.com/verify-identity`. Test staging with its own test integration, environment settings, and URLs before switching production to live verification.

This branch adds no independent identity-document support promise, verification-time guarantee, MT5 provisioning, IB business approval, bank approval, or WhatsApp OTP. Document choices and selfie requirements are controlled by the selected Veriff product. API failures leave the client unapproved and show a retry/support action.
