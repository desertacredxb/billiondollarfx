"use client";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function DepositWithdrawalPolicy() {
  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 md:px-8 lg:px-20 pt-36 pb-16 text-center">
        {/* <div className="text-sm text-gray-400 mb-4">
          <span className="text-white font-medium">Home</span> / Deposit &
          Withdrawal Policy
        </div> */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Deposit & Withdrawal{" "}
          <span className="text-[var(--primary)]">Policy</span>
        </h1>
        <p className="max-w-4xl mx-auto text-gray-400 text-base md:text-lg">
          BillionDollarFX provides secure and transparent methods for deposits,
          withdrawals, and refunds. This policy outlines the rules and
          procedures you must follow to ensure safe financial transactions.
        </p>
      </section>

      {/* Content Section */}
      <section className="w-11/12 md:w-4/5 mx-auto pb-20 space-y-10">
        {/* 1. Bank Wire Transfer */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            1. Bank Wire Transfer
          </h2>
          <h3 className="text-lg font-semibold text-white">Deposit</h3>
          <p className="text-gray-300 leading-relaxed">
            You must use a bank account that is registered in your name and is
            the same name as your BillionDollarFX trading account in order to
            make deposits via bank transfer. You might have to provide a wire
            transfer receipt or SWIFT confirmation proving the monies&#39;
            origin upon request. If this isn&#39;t provided, the deposit might
            be refunded.
          </p>

          <h3 className="text-lg font-semibold text-white">Withdrawals</h3>
          <p className="text-gray-300 leading-relaxed">
            The same bank account that is used for deposits or another account
            in the client&#39;s name must be used for withdrawals. Processing
            periods, which normally range from two to seven business days,
            depend on the bank&#39;s location, currency, and internal policies.
          </p>
        </div>

        {/* 2. Credit and Debit Card Transactions */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            2. Credit and Debit Card Transactions
          </h2>
          <h3 className="text-lg font-semibold text-white">Deposit</h3>
          <p className="text-gray-300 leading-relaxed">
            Subject to the rules set forth by the card issuer and any further
            verification requirements, deposits made with credit and debit cards
            are processed quickly.
          </p>

          <h3 className="text-lg font-semibold text-white">Withdrawals</h3>
          <p className="text-gray-300 leading-relaxed">
            The same card that was used to make the deposit will be credited
            with the withdrawal. Withdrawals to another card cannot be processed
            by BillionDollarFX. It&#39;s possible that you&#39;ll be requested
            to submit scanned copies of your card that only display the first
            and last four numbers while hiding the CVV code. Additional proof of
            ownership may be needed for cards lacking a cardholder name.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Please be aware that some card programs might not permit withdrawals
            in excess of the amount deposited. Withdrawals in these situations
            ought to be made through bank transfer.
          </p>
        </div>

        {/* 3. Electronic Payment Methods */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            3. Electronic Payment Methods
          </h2>
          <p className="text-gray-300 leading-relaxed">
            When using electronic payment methods for deposits, the supplier
            stipulations in detail, including any fees and usage limitations,
            are the standard that must be followed. In general, to provide
            security and reliability in transactions, withdrawals should be
            carried out through the same electronic channel as the initial
            deposit.
          </p>
          <p className="text-gray-300 leading-relaxed">
            It is highly recommended that clients research and understand the
            transfer restrictions, processing times, fees, and other relevant
            policies for their chosen payment method before they commence any
            transactions. Gaining knowledge of such details makes electronic
            payments a viable and reliable way of managing one’s finances, as it
            prevents the occurrence of delays or unexpected fees.
          </p>
        </div>

        {/* 4. General Withdrawal Guidelines */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            4. General Withdrawal Guidelines
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2 pl-2">
            <li>
              Requests for withdrawals are handled from 9:00 AM to 6:00 PM
              Labuan time, Monday through Friday. After these hours, requests
              will be handled the following working day.
            </li>
            <li>
              Funds can only be deposited and withdrawn by verified clients with
              verified contact information. Identification and proof of address
              must be submitted for verification.
            </li>
            <li>
              If verification is not finished within 15 days of the first
              deposit, deposits made to unverified accounts will be refunded.
            </li>
            <li>
              In accordance with card issuer rules, electronic payment
              providers, and Anti-Money Laundering (AML) legislation, more
              evidence can be asked.
            </li>
            <li>
              Withdrawal restrictions and fees are subject to change at
              BillionDollarFX&#39;s discretion. Positions must be ended before
              profits can be taken out; withdrawals from open trading positions
              are prohibited.
            </li>
            <li>
              Withdrawals by third parties are absolutely forbidden. To avoid
              fraud and money laundering, funds are only refunded to the
              original deposit source.
            </li>
            <li>
              The original deposit&#39;s currency is used to handle withdrawals.
              BillionDollarFX will convert the amount at the going rates if one
              is necessary.
            </li>
          </ul>
        </div>

        {/* 5. Refund Policy */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            5. Refund Policy
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Customers who have not engaged in trading, investing, or conversion
            transactions and are unhappy with the services they received can ask
            for a refund. A 100% refund is provided by BillionDollarFX within
            one business day of the initial deposit. We assess requests in five
            business days. Deposits are no longer refundable after one day and
            will be handled like regular withdrawals.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The original payment source must be credited with the refund. Funds
            obtained from trading activities are not eligible for chargebacks or
            refunds. Transactions that break AML guidelines or other laws may be
            canceled or frozen by BillionDollarFX.
          </p>
        </div>

        {/* 6. Handling Issues */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            6. Handling Issues
          </h2>
          <p className="text-gray-300 leading-relaxed">
            BillionDollarFX&#39;s Complaint Handling Policy, which is accessible
            on our website, will be followed in the resolution of any issues
            pertaining to deposit or withdrawal terms. Written complaints should
            be sent to{" "}
            <span className="text-[var(--primary)] font-semibold">
              info@billiondollarfx.com
            </span>
            .
          </p>
          <p className="text-gray-300 leading-relaxed">
            This policy may occasionally be revised to comply with legal
            mandates and anti-money laundering guidelines. The Terms and
            Conditions, as modified at our discretion, govern the usage of
            BillionDollarFX&#39;s services.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
