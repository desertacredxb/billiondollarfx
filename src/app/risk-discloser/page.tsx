"use client";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const riskDisclosureData = {
  title: "Risk Disclosure",
  sections: [
    {
      heading: "1. We Do Not Offer Personalized Investment Guidance",
      content:
        "If you are unsure about whether this type of trading would be suitable for your financial situation, then it is recommended that you take a certified financial advisor for a consultation. BillionDollarFX, apart from not making any specific recommendations, is also not allowed to give investment advice. We could, however, briefly and upon your request, provide you with a few trade insights, market updates, or transactional data, but these would be always objective and only for informational purposes. They must not be treated as a supporting guidance or advice set directly linked to your case. When dealing, you must at all times exercise caution and it would also be wise to seek the services of a financial expert to help you make financial decisions that are in line with your aims and risk tolerance.",
    },
    {
      heading: "2. Trade Responsibly – Know the Risks",
      content:
        "This Risk Warning is intended to assist you in understanding the risks associated with our products and services, but it is not able to fully explain all of the dangers. It can only act as a broad overview of the risks associated with trading our products and utilizing our services; you are responsible for assessing whether or not the risks are suitable for your investment strategy and risk tolerance.\n\nDerivative financial product trading carries significant risk. CFDs and spread bets are complicated financial tools that carry a significant risk of losing money quickly because of leverage. Prices could quickly shift against you, especially under erratic market conditions. Products that are more volatile than others may be even more vulnerable to abrupt price changes. CFD margin trading is not something you should do unless you are completely aware of the hazards.",
      subSections: [
        {
          title: "Trading CFDs May Not Suit Everyone",
          text: "Before you can open an account to trade a CFD or spread bet product, BillionDollarFX will assess whether the product or services you have selected are suitable for you. If any of the products or services are not suitable based on the information you have given us, we will notify you. It is entirely up to you whether or not to create an account and make use of our goods and services. It is your duty to be aware of the dangers associated with our goods and services.A questionnaire that focuses on prior experience, product knowledge, and the risks associated with trading complicated instruments may be part of our assessment process throughout the application process. You are responsible for determining if your financial resources are sufficient for your financial transactions with us and your tolerance for risk in the goods and services you utilize.",
        },
        {
          title: "We Provide Information, Not Advice",
          text: "We offer our services on an execution-only basis. Regarding CFDs and spread bets, we don't offer investing advice. We occasionally offer research advice or factual information about a market, transaction processes, possible dangers, and ways to reduce such risks. Any information we give you, including information from our client services team, is factual only and does not consider your unique situation. You are the one who decides whether or not to use our products or services. You are in charge of handling your legal and tax matters, which includes adhering to all applicable rules and regulations and filing and paying any required paperwork. We don't offer any legal, tax, or regulatory advice. You should get independent guidance if you have any questions about the tax treatment or obligations of the financial products that are offered via your spread betting or CFD account.",
        },
        {
          title: "Off-Exchange (OTC) Trading",
          text: "You will be engaging in a non-transferable off-exchange (commonly referred to as an over-the-counter, or OTC) derivative when you trade with us. This implies that you will transact with us directly and that you must close those transactions with us. Selling or transferring your trades to other people will not be an option. Because your capacity to open and conclude transactions with us depends on our ability to accept and execute your orders, this may entail a higher level of risk than investing in a transferable financial instrument or dealing in an exchange-traded derivative.",
        },
        {
          title: "Margin",
          text: "Leverage, sometimes referred to as gearing or margining, is a component of CFD margin trades. This means that even minor price changes can have a significant impact on the value of your positions, both in terms of gains and losses. The higher the leverage rate, the higher the risk. On a deal, you could lose quickly. Your account will be debited for any market losses that surpass the margin. You might be asked to quickly deposit more margin in order to keep your trade going. Every trading day, we will continuously revalue your open trades, and any profit or loss will be promptly recorded in your account. If you experience a loss, you might need to contribute more money to your account right away to keep your transactions open. As a result, you should keep a careful eye on your CFD margin trades and the amount of leverage you're using. Your CFD margin transactions and account could be significantly impacted by a slight change in price, which could lead to an instant account closure.",
        },
        {
          title: " Stop Loss Limits Are Not Guaranteed",
          text: "You can restrict your loss by placing a stop loss order, but this is not a given. In certain situations, your loss could be more significant. Slippage, commonly referred to as gapping, happens when the market surpasses the price at which your stop loss order was placed. This might happen as a result of the underlying market's particularly high volatility. When trading in that underlying market reopens, we would close your open trade at the next available price, or as soon as possible. The underlying market may also become volatile, which can make markets very active. As a result, in a fast declining underlying market, your stop loss order can be executed at a price lower than your stop loss order price.",
        },
        {
          title: "Past Performance",
          text: "It is not advisable to presume that past performance is indicative of future performance. Regarding the future success of any underlying market or trades you make, there can be no assurance. It is impossible to predict future performance.",
        },
        {
          title: "Currency",
          text: "Your gains and losses could be impacted by currency exchange movements if you trade in a market that is valued in a different currency than your base currency.",
        },
        {
          title: "Volatility",
          text: "The price of underlying markets can fluctuate a lot. This will directly affect your earnings and losses. Understanding the underlying market's volatility can assist you decide where to put any stops. It should be mentioned that volatility is not always predictable..",
        },
        {
          title: "Trading in Out-of-Hours Markets",
          text: "Our quotes during the index market after-hours sessions represent our personal opinions on the market's outlook. This can entail looking at price changes in other open, pertinent markets. Additionally, our quotes may be impacted by the business conducted by other clients. Right now, there might not be anything to compare our quotation to. Trading can occasionally become riskier due to market conditions and the way specific markets' regulations operate (for example, suspending trades because of volatility, a lack of liquidity in the underlying, and other factors). In severe circumstances, this could result in a modification of the contract settlement. If trading is halted on a particular day, we have the right to alter the settlement for contracts that expire on that day.",
        },
        {
          title: "Risks of Trading with Leverage",
          text: "You can enter into trades using leverage or gearing with a little deposit (also known as margin) based on the total contract value. However, this implies that your trade may be disproportionately affected by a slight change in the underlying market. You could lose all of your margin money if the underlying market moves even a little. As a result, you should only gamble with funds that you can afford to lose.",
        },
        {
          title: "Contingent Liability and Margin Risks",
          text: "​​Instead of paying the full purchase price at once, we need you to make a series of payments against the purchase price when a deal is margined. A trade may nonetheless entail an obligation to make further payments under specific conditions, above and above the sum paid at the time of contract entry, even if it is not margin. You may be exposed to much higher risks in contingent liability transactions that are not traded on or in accordance with the regulations of a recognized or registered investment exchange.",
        },
        {
          title: "Spreads, Commissions And Costs",
          text: "You should get information about any commissions and other fees that you will be responsible for before you start trading with us. You should have a clear explanation of what charges that aren't mentioned in money terms (such a bid-offer spread) are likely to entail in particular money terms. When commission is charged as a percentage in futures, it is typically expressed as a percentage of the entire contract value rather than just the percentage of your initial payment.We might ask you to cover financing expenses, depending on the kind of trade you make and how long it lasts. Furthermore, we can ask you to convert any foreign currencies you trade in to your base currency if they differ from it. The total of your foreign exchange and finance expenses may outweigh any trade earnings or raise any trade losses you may incur.",
        },
        {
          title: "Insolvency",
          text: "Positions may be liquidated or closed out without your agreement if any other brokers participating in your transaction become insolvent or default. In some cases, you might not receive the actual assets you invested, and you could have to take any cash payments that are made.",
        },
        {
          title: "Legal and Regulatory Risk",
          text: "the possibility that a change in rules and regulations may have a significant effect on investments and securities in a market or industry. An investment's potential for profit may be altered by changes to laws or rules enacted by the government or a regulatory body that raise operating costs, lower investment appeal, or alter the competitive environment. ",
        },
        {
          title: "Tax Risk",
          text: "You assume the risk that your transactions and any resulting gains could be taxed. Except for trading duty, we make no guarantees or representations that there will be no taxes or stamp duties due. All taxes and stamp duties related to your trades will be your responsibility. You are in charge of your own tax matters, and BillionDollarFX does not offer any tax advice.",
        },
        {
          title: "Your Funds",
          text: "We will hold your money in trust in a segregated client money bank account separate from our money if you have been classified as a retail client or if we have otherwise agreed to treat you as a professional client. However, this may not offer total protection (for instance, in the event that our bank becomes insolvent). Additionally, the 'Your Money' portion of our Customer Terms and Conditions is brought to your attention",
        },
        {
          title: "System Failure",
          text: "Every CFD transaction with BillionDollarFX on your device carries some operational risk. Delays in the execution and settlement of a transaction may result from interruptions in BillionDollarFX's operational procedures, including phone systems, IT systems, networks, or outside events. The features that let you use our Platform through mobile applications are not the same as those that let you use our Platform through a desktop computer. This could restrict the amount of information you can view at any given moment, which would negatively impact your ability to respond quickly and reliably on our platform and reduce associated risks. Except in cases where it results from fraud or dishonesty on the part of BillionDollarFX, BillionDollarFX accepts or bears all liability with regard to its operational procedures.",
        },
      ],
    },
  ],
  contact:
    "You can reach us at info@billiondollarfx.com for additional information",
};

export default function RiskDisclosurePage() {
  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 md:px-8 lg:px-20 pt-36 pb-16 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {riskDisclosureData.title}
        </h1>
        <p className="max-w-3xl mx-auto text-gray-400 text-base md:text-lg">
          Please read this disclosure carefully before participating in trading
          activities.
        </p>
      </section>

      {/* Content */}
      <section className="w-11/12 md:w-4/5 mx-auto pb-20 space-y-12">
        {riskDisclosureData.sections.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
              {section.heading}
            </h2>

            {section.content && (
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-justify">
                {section.content}
              </p>
            )}

            {section.subSections && (
              <div className="space-y-6">
                {section.subSections.map((sub, subIdx) => (
                  <div
                    key={subIdx}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <h3 className="text-lg font-medium text-white mb-2">
                      {sub.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-justify">
                      {sub.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <p className="mt-10 text-gray-400 italic">
          {riskDisclosureData.contact}
        </p>
      </section>

      <Footer />
    </div>
  );
}
