import Image from "next/image";

export default function InsightsSection() {
  return (
    <section className="bg-[#121E2C] text-white py-16 px-4 text-center">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl  font-semibold leading-tight mb-4">
        Need help with your
        <span className="text-[var(--primary)]"> BDFX account?</span>
      </h2>

      {/* Paragraph */}
      <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto mb-8">
        Find setup guides in the help centre or contact support about identity verification, MT5 access, payments or your IB account.
      </p>

      {/* WhatsApp Button  */}
      <a
        href="https://wa.me/+447999283366"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#1DA851] hover:bg-[#52956a] text-white px-6 py-2.5 rounded-full text-base font-medium shadow-md border border-[#1DA851] transition"
      >
        <img
          src="https://www.svgrepo.com/show/475692/whatsapp-color.svg"
          alt="WhatsApp"
          className="w-5 h-5"
        />
        WhatsApp
      </a>
    </section>
  );
}
