# Preserve approved behavior

Keep owner-approved flows unchanged during unrelated fixes. Check affected UI paths and regression tests before publishing. Change the agreed behavior only when the owner explicitly asks for that change.

Read `docs/approved-behavior.md` before changing an existing feature. Check dependent client/admin journeys, not just the edited component. Existing tests and CI protect expected behavior; do not claim a permanent repository write lock or enforced branch protection without verifying that configuration.

## Client identity corrections (owner confirmed 22 October 2026)

- Keep **Edit name & resubmit → Save details → Resubmit verification** on the client verification page. Provider review and failed attempts, including `501`, must keep both name correction and fresh resubmission when the backend permits them. Document/ID instructions stay visible for all unapproved results, even when support is required.
- Remove only the address editing option. Do not reintroduce address fields or remove name editing/resubmission. Other identity changes use support.
- Respect backend permissions. Saving a name starts a fresh verification requirement; retain the Resubmit label after refreshing the page.
- Keep approval synchronization, IB verification, the failure reason and WhatsApp support flows working.
- Run `node --test test/*.test.cjs` (including `verificationActions.test.cjs`) and TypeScript/build validation before publishing changes to this flow.
