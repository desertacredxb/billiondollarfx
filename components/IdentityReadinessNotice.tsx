export default function IdentityReadinessNotice() {
  return (
    <aside aria-label="Physical ID required" className="mb-5 rounded-xl border border-[#c6a15b]/50 bg-[#c6a15b]/10 p-4 text-left">
      <h2 className="font-semibold text-[#e7c985]">Before you register: keep your original physical ID ready</h2>
      <p className="mt-2 text-sm leading-6 text-gray-200">You will need your original physical government-issued photo ID to complete identity verification for your BDFX account. Enter your details as they appear on your ID.</p>
      <p className="mt-2 text-sm leading-6 text-gray-300">Have the document with you for the camera check and selfie. A photo, screenshot or photocopy is not a replacement for the original physical document. If your ID is not available, please return when you have it ready.</p>
    </aside>
  );
}
