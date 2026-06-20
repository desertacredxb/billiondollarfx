"use client";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function AMLPolicy() {
  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 md:px-8 lg:px-20 pt-36 pb-16 text-center">
        {/* <div className="text-sm text-gray-400 mb-4">
          <span className="text-white font-medium">Home</span> / AML Policy
        </div> */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          KYC / AML <span className="text-[var(--primary)]">Policy</span>
        </h1>
        <p className="max-w-4xl mx-auto text-gray-400 text-base md:text-lg">
          BillionDollarFX is committed to the highest standards of compliance
          with anti-money laundering (AML) and counter-terrorism financing (ATF)
          regulations. This policy explains the procedures we follow to protect
          our platform from unlawful use.
        </p>
      </section>

      {/* Content Section */}
      <section className="w-11/12 md:w-4/5 mx-auto pb-20 space-y-10">
        {/* 1. Commitment to Compliance */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            1. Commitment to Compliance
          </h2>
          <p className="text-gray-300 leading-relaxed">
            In the fight against terrorism funding (ATF) and money laundering
            (AML), BillionDollarFX is dedicated to the highest standards. This
            policy&#39;s objective is to aggressively prevent and reduce the
            dangers associated with certain behaviors. All financial
            institutions are required by law to collect, confirm, and keep
            records of information identifying each individual or organization
            that opens an account. BillionDollarFX is required to notify the
            appropriate authorities of any suspected behavior pertaining to
            money laundering or the funding of terrorism.
          </p>
        </div>

        {/* 2. Money Laundering Overview */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            2. Money Laundering Overview
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Converting the proceeds of illicit actions (such fraud, corruption,
            or terrorism) into monies that appear legitimate in order to conceal
            their true source is known as money laundering. Three steps
            typically comprise the process:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 pl-2">
            <li>
              <strong className="text-white">Placement:</strong> First, money is
              put into the customer&#39;s account. Withdrawals can only be made
              to another account in the client&#39;s name or to the same bank
              account that made the deposit. Usually taking two to seven
              business days, withdrawal timings vary based on the currency, bank
              location, and internal banking processes.
            </li>
            <li>
              <strong className="text-white">Layering:</strong> To hide the
              source of funds, they are moved between accounts or transformed
              into other financial instruments.
            </li>
            <li>
              <strong className="text-white">Integration:</strong> It is the
              process of reintroducing money into the economy as valid means of
              paying for goods and services.
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            BillionDollarFX makes sure that its services are not used to finance
            terrorists or launder illicit cash by closely adhering to AML
            guidelines. The business maintains the right to suspend accounts
            suspected of engaging in unlawful behavior, and cash transactions
            are not allowed.
          </p>
        </div>

        {/* 3. Client Verification and KYC Procedures */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            3. Client Verification and KYC Procedures
          </h2>
          <p className="text-gray-300 leading-relaxed">
            BillionDollarFX follows rigorous Know Your Customer (KYC) and due
            diligence procedures to verify client identities before providing
            services.
          </p>
          <h3 className="text-lg font-semibold text-white mt-4">
            Individual Clients:
          </h3>
          <p className="text-gray-300 leading-relaxed">
            During registration, clients must provide: full name, date of birth,
            country of origin, and residential address. Verification requires
            submission of:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 pl-2">
            <li>Valid passport (photo and signature visible), or</li>
            <li>Driver’s license with photograph, or</li>
            <li>National identity card (front and back), and</li>
            <li>
              Proof of address (utility bill, bank statement, etc., not older
              than 3 months).
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6">
            Corporate Clients:
          </h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2 pl-2">
            <li>Certificate of incorporation or national equivalent</li>
            <li>Memorandum and Articles of Association</li>
            <li>Certificate of good standing or proof of registered address</li>
            <li>Board resolution authorizing account operations</li>
            <li>
              Identification documents of directors and ultimate beneficial
              owners
            </li>
          </ul>
        </div>

        {/* 4. Monitoring Customer Activity */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            4. Monitoring Customer Activity
          </h2>
          <p className="text-gray-300 leading-relaxed">
            In addition to gathering KYC data, BillionDollarFX keeps an eye on
            customer transactions to spot questionable activities. Transactions
            that don&#39;t fit the client&#39;s known profile or line of work
            are marked for examination. To stop abuse, the platform employs both
            automatic processes and human verification where needed.
          </p>
        </div>

        {/* 5. Maintaining Documents */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            5. Maintaining Documents
          </h2>
          <p className="text-gray-300 leading-relaxed">
            After an account is closed, all identification documents,
            transaction records, and AML-related files are kept for at least
            seven years.
          </p>
        </div>

        {/* 6. Actions to Prevent Suspicious Behavior */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            6. Actions to Prevent Suspicious Behavior
          </h2>
          <p className="text-gray-300 leading-relaxed">
            In the case that money laundering is suspected or that the account
            is used for illegal activities, BillionDollarFX has the power to
            block or suspend such accounts. The guidelines are always adhered to
            in these cases, and the authorities are informed of any illegal
            activities that come to light.
          </p>
        </div>

        {/* 7. Contact Details */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            7. Contact Details
          </h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions or concerns about our KYC, AML, or
            BillionDollarFX policies, please send an email to{" "}
            <span className="text-[var(--primary)] font-semibold">
              info@billiondollarfx.com
            </span>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
