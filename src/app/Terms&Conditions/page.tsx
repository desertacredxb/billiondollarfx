"use client";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function TermsConditions() {
  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 md:px-8 lg:px-20 pt-36 pb-16 text-center">
        {/* <div className="text-sm text-gray-400 mb-4">
          <span className="text-white font-medium">Home</span> / Terms &
          Conditions
        </div> */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Terms & <span className="text-[var(--primary)]">Conditions</span>
        </h1>
        <p className="max-w-4xl mx-auto text-gray-400 text-base md:text-lg">
          Please read these Terms & Conditions carefully before using the
          services of BillionDollarFX. By accessing or using our platform, you
          agree to be bound by these terms.
        </p>
      </section>

      {/* Content Section */}
      <section className="w-11/12 md:w-4/5 mx-auto pb-20 space-y-10">
        {/* 1. Acceptance of the Terms */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            1. Acceptance of the Terms
          </h2>
          <p className="text-gray-300 leading-relaxed">
            1.1 You accept and agree to abide by the terms stated in this
            Trading Platform Agreement by using any of BillionDollarFX&#39;s
            goods or services. Please do not use BillionDollarFX&#39;s services
            or products if you disagree with these terms.
          </p>
          <p className="text-gray-300 leading-relaxed">
            1.2 This agreement is applicable to all BillionDollarFX users,
            whether they are registered users or visitors. Acceptance of this
            agreement is indicated by your use of the platform.
          </p>
        </div>

        {/* 2. Legally Binding Contract */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            2. Legally Binding Contract
          </h2>
          <p className="text-gray-300 leading-relaxed">
            2.1 You sign a legally binding contract with BillionDollarFX by
            using its services.
          </p>
          <p className="text-gray-300 leading-relaxed">
            2.2 You agree to this agreement and any associated contractual
            instruments, including our General Terms and Conditions, by
            continuing to use our platform.
          </p>
        </div>

        {/* 3. Age Requirements */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            3. Age Requirements
          </h2>
          <p className="text-gray-300 leading-relaxed">
            3.1 In case of wanting to use the BillionDollarFX services, the
            users must be over 18 years of age and have the legal capacity to
            enter into a legally binding contract in their territory, i.e. of
            legal age of consent.
          </p>
          <p className="text-gray-300 leading-relaxed">
            3.2 Falsifying your age for the purpose of accessing BillionDollarFX
            services is prohibited and shall be considered a breach of this
            agreement.
          </p>
        </div>

        {/* 4. Termination of Access */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            4. Termination of Access
          </h2>
          <p className="text-gray-300 leading-relaxed">
            4.1 Users who breach these terms may have their access to
            BillionDollarFX suspended or terminated.
          </p>
          <p className="text-gray-300 leading-relaxed">
            4.2 Users are required to promptly cease using all BillionDollarFX
            services and products upon termination.
          </p>
        </div>

        {/* 5. Modifications to the Contract */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            5. Modifications to the Contract
          </h2>
          <p className="text-gray-300 leading-relaxed">
            5.1 BillionDollarFX is allowed to amend or change this agreement at
            any time. A user who wants to be informed of any changes must
            periodically read the agreement.
          </p>
          <p className="text-gray-300 leading-relaxed">
            5.2 Your ongoing use of BillionDollarFX after any changes shall
            constitute your acceptance of the amended terms.
          </p>
        </div>

        {/* 6. Contact Details */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            6. Contact Details
          </h2>
          <p className="text-gray-300 leading-relaxed">
            6.1 Please email us at{" "}
            <span className="text-[var(--primary)] font-semibold">
              <a href="mailto: info@billiondollarfx.com">
                {" "}
                info@billiondollarfx.com
              </a>
            </span>{" "}
            with any queries or worries about this agreement or other
            BillionDollarFX services.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
