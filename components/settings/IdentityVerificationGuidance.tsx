import IdentityReadinessNotice from "../IdentityReadinessNotice";

export default function IdentityVerificationGuidance({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <div className="space-y-3">
    <IdentityReadinessNotice />
    <p className="text-sm leading-6 text-gray-400">Veriff checks your supported government-issued photo ID and selfie. Enter your full name exactly as shown on your ID. Each new verification must pass Veriff and BDFX eligibility checks before approval.</p>
    <p className="text-sm text-gray-400">BDFX does not accept UAE clients or UAE-issued identity documents.</p>
  </div>;
}
