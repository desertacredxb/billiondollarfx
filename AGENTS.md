# Preserve approved behavior

Keep owner-approved flows unchanged during unrelated fixes. Check affected UI paths and regression tests before publishing. Change the agreed behavior only when the owner explicitly asks for that change.

## Client identity corrections (owner confirmed 22 October 2026)

- Keep **Edit name & resubmit → Save details → Resubmit verification** on the client verification page. Ordinary unapproved review must not hide the name correction action when the backend permits it.
- Remove only the address editing option. Do not reintroduce address fields or remove name editing/resubmission. Other identity changes use support.
- Respect backend permissions. Saving a name starts a fresh verification requirement; retain the Resubmit label after refreshing the page.
- Keep approval synchronization, IB verification, the failure reason and WhatsApp support flows working.
- Run `node --test test/*.test.cjs` (including `verificationActions.test.cjs`) and TypeScript/build validation before publishing changes to this flow.
