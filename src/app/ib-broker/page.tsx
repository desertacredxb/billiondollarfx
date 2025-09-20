"use client";
import { useState } from "react";
import Button from "../../../components/Button";
import Image from "next/image";
import Navbar from "../../../components/Navbar";
import ib from "../../../assets/IB-Reward-Program-Promo.svg";
import Footer from "../../../components/Footer";
import img1 from "../../../assets/icons1/ib-icon-02.png";
import img2 from "../../../assets/icons1/ib-icon-03.png";
import img3 from "../../../assets/icons1/ib-icon-04.png";
import img4 from "../../../assets/icons1/ib-icon-05.png";
import img5 from "../../../assets/icons1/Icons-10.png";
import img6 from "../../../assets/icons1/Icons-11.png";
import img7 from "../../../assets/icons1/Icons-12.png";
import img8 from "../../../assets/icons1/Icons-13.png";
import img9 from "../../../assets/icons1/Icons-14.png";
import cashback from "../../../assets/cashback.webp";
import reward from "../../../assets/rewards-image-2.webp";
import icon1 from "../../../assets/icons1/ib-icon-08.png";
import icon2 from "../../../assets/icons1/ib-icon-09.png";
import icon3 from "../../../assets/icons1/ib-icon-10.png";
import RegistrationForm from "../../../components/RegistrationForm";
import BrokerPopup from "../../../components/BrokerPopup";
import { useRouter } from "next/navigation";

function IbBroker() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [clients, setClients] = useState(0);
  const [isPopupOpen, setPopupOpen] = useState(false);

  const router = useRouter();
  const handleClick = () => {
    router.push("/register");
  };

  const getReward = (clients: number) => {
    if (clients < 5) return 1;
    if (clients < 10) return 3;
    if (clients < 20) return 5;
    return 7;
  };

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />
      <section className="w-11/12 md:w-4/5 mx-auto pt-36 pb-20 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-4">
            <span className="text-[var(--primary)]">
              {" "}
              Team Up With Billion Dollar FX As A Partner(IB){" "}
            </span>
            & Win a Luxury Fully Sponsored Trip to Dubai!
          </h2>

          <p className=" text-gray-400 mt-6 italic">
            Promotion Timeline: February 1 to Apirl 30, 2025
          </p>
          <p className=" text-gray-400 mb-6 italic">*T&C Apply</p>

          {/* Primary CTA */}

          <button
            className="mt-6 relative overflow-hidden px-6 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-full group text-sm font-medium"
            onClick={() => setPopupOpen(true)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              Become a Partner
            </span>
            <span className="absolute inset-0 bg-[var(--primary)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></span>
          </button>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <Image src={ib} alt="Rewards Image" />
        </div>
      </section>

      <hr className="border-gray-700 w-11/12 md:w-4/5 mx-auto" />
      <section className="w-11/12 md:w-4/5 mx-auto text-center py-12  text-white">
        {/* Heading */}
        <h2 className="text-2xl max-w-3xl mx-auto mb-6  font-bold leading-snug ">
          <span className="text-[var(--primary)]">Partnering Perks:</span>{" "}
          Commission Riches, Award-Winning Trust, Market Evolution and Daily Win
          Rewards!
        </h2>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            {
              img: img1,
              text: (
                <>
                  Up to 90% <br />
                  profit share from spreads
                </>
              ),
            },
            {
              img: img2,
              text: (
                <>
                  Reputable Broker With <br />
                  40+ Industry awards
                </>
              ),
            },
            {
              img: img3,
              text: (
                <>
                  Evolving everyday in the <br />
                  market
                </>
              ),
            },
            {
              img: img4,
              text: (
                <>
                  Trade and Win <br />
                  Rewards Everyday
                </>
              ),
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#1B2B39] p-6 rounded-xl flex flex-col items-center justify-between text-sm font-medium shadow-md transition"
            >
              <Image
                src={item.img}
                alt="perk"
                className="w-14 h-14 object-contain mb-4"
              />
              <p className="text-white">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Separator Heading */}
        <h2 className="text-2xl  font-bold leading-snug text-start mb-5">
          What Sets Us Apart: <br />
          <span className="text-[var(--primary)]">
            Reasons for Client Preference
          </span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-white">
          {[
            { number: "1.", title: "Fastest", subtitle: "Withdrawal" },
            { number: "2.", title: "No", subtitle: "Swap" },
            { number: "3.", title: "No", subtitle: "Commission" },
            { number: "4.", title: "Low", subtitle: "Spread" },
          ].map((item, i) => (
            <div key={i} className=" flex items-center">
              <div className="flex items-start gap-3">
                {/* Number */}
                <div className="text-3xl md:text-5xl font-bold text-[var(--primary)]">
                  {item.number}
                </div>

                {/* Text */}
                <div className="text-left">
                  <p className="text-sm md:text-base text-gray-200">
                    {item.title}
                  </p>
                  <p className="text-sm md:text-base text-gray-200">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-700 w-11/12 md:w-4/5 mx-auto" />

      <section className="w-11/12 md:w-4/5 mx-auto py-16 text-white text-center space-y-10">
        {/* Heading & Intro */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Benefits Of Becoming{" "}
            <span className="text-[var(--primary)]">Introducing Broker</span>{" "}
            With Billion Dollar FX
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-sm md:text-base">
            Unlock a world of advantages by becoming an Introducing Broker with
            Billion Dollar FX. Enjoy generous commission structures, industry
            recognition, continuous market evolution, and the opportunity to
            empower traders with everyday rewards.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Join us in reshaping the future of trading partnerships with the
            Best Broker Trading Platform.
          </p>
        </div>

        {/* Flip Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-8">
          {[
            {
              img: img5, // replace with actual image imports
              title: "Multi-tier up to 5 levels",
              desc: "As an IB you could have up to 5 sub levels of referral traders.",
            },
            {
              img: img6,
              title: "Easy to get started",
              desc: "No mountains of paperwork to sign or difficult IT implementation required.",
            },
            {
              img: img7,
              title: "Personalized service",
              desc: "A personal IB account manager would be assigned to support you.",
            },
            {
              img: img8,
              title: "Promotion support",
              desc: "Frequent promotional events for IB to attract and convert clients.",
            },
            {
              img: img9,
              title: "Fast payout settlement",
              desc: "As an IB the payment should be fast.",
            },
          ].map((item, i) => (
            <div key={i} className="group perspective">
              <div className="relative w-full h-[120px] transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180 md:group-hover:rotate-y-180">
                {/* Front Side */}
                <div className="absolute inset-0 bg-[#1B2B39] rounded-xl p-4 flex flex-col items-center justify-center backface-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    className="w-12 h-12 mb-3 object-contain"
                  />
                  <h4 className="text-sm md:text-base font-semibold">
                    {item.title}
                  </h4>
                </div>

                {/* Back Side (Hidden on mobile) */}
                <div className="absolute inset-0 bg-[#132735] rounded-xl p-4 text-sm text-gray-300 items-center justify-center rotate-y-180 backface-hidden hidden md:flex">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-700 w-11/12 md:w-4/5 mx-auto" />

      <section className="w-11/12 md:w-4/5 mx-auto py-12 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-4">
            Switch to Billion Dollar FX & Earn
            <span className="text-[var(--primary)]"> 2.5% CASHBACK*</span>
          </h2>
          <h3>Minimum Deposit: 10,000$</h3>
          <p className=" text-gray-400 mt-3 mb-6 italic">
            Limited Time Offer | *T&C Apply
          </p>

          {/* Primary CTA */}
          <Button text="Create Account" onClick={handleClick} />
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <Image src={cashback} alt="Rewards Image" priority />
        </div>
      </section>

      <section className="w-11/12 md:w-4/5 mx-auto py-16 text-white text-center space-y-6">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold">
          <span className="text-[var(--primary)]">
            IB Loyalty Reward Program
          </span>
        </h2>

        {/* Subheading */}
        <h3 className="text-lg md:text-xl font-semibold text-white">
          Earn More with{" "}
          <span className="text-[var(--primary)]">Billion Dollar FX!</span>
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
          Win exciting rewards for achieving your targets in addition to your
          rebates and commissions.
        </p>

        {/* T&C */}
        <p className="text-xs italic text-gray-500">*T&C Apply</p>

        {/* Image */}
        <div className="flex justify-center mt-4">
          <Image
            src={reward} // Replace with actual reward image
            alt="IB Loyalty Rewards"
            className="rounded-xl shadow-lg max-w-full md:max-w-3xl"
          />
        </div>
        <p className="text-xs">
          *This is a year long program and the rewards cannot be combined with
          anyother promotions
        </p>
      </section>

      <RegistrationForm />

      <section className="w-11/12 md:w-4/5 mx-auto py-12 text-white space-y-10">
        {/* Heading */}
        {/* <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">
            How Much You Can Earn?{" "}
            <span className="text-[var(--primary)]">Calculate your profit</span>
          </h2>
          <p className="text-sm md:text-base text-gray-300 max-w-3xl mx-auto">
            This advanced commission calculator operates on the basis of
            Introducing Brokers’ client count and their trading volume in lots,
            providing an accurate reflection of earned commissions.
          </p>
        </div> */}

        {/* Slider */}
        {/* <div className=" p-6 md:p-10">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-cyan-900 px-5 py-1 rounded-full text-white text-sm font-semibold">
              {clients} Clients
            </span>
            <div className="text-right">
              <p className="text-sm font-medium text-white">Rewards</p>
              <p className="text-[var(--primary)] font-bold text-xl">
                ${getReward(clients)}
              </p>
              <p className="text-xs text-[var(--primary)]">Per lot</p>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="39"
            value={clients}
            onChange={(e) => setClients(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
        </div> */}

        {/* CTA Box */}
        <div className="bg-gradient-to-br from-[#132435] to-[#0F1C2A] rounded-xl p-6 md:p-10 text-center space-y-6">
          <h3 className="text-lg md:text-2xl font-bold">
            Become A{" "}
            <span className="text-[var(--primary)]">
              Billion Dollar FX Partner
            </span>{" "}
            & Start Earning Today
          </h3>
          <p className="text-gray-300 text-sm md:text-base max-w-3xl mx-auto">
            Embark on a lucrative journey by becoming a Billion Dollar FX
            Partner and kickstart your earnings today. Join our dynamic network,
            harness rewarding opportunities, and pave the way for financial
            success together.
          </p>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-white mt-6">
            <div className="space-y-2">
              <div className="flex justify-center">
                <Image src={icon1} alt="" width={48} />
              </div>
              <p className="font-medium">
                Apply to become an <br />{" "}
                <span className="text-[var(--primary)]">
                  Introducing Broker
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Image src={icon2} alt="" width={48} />
              </div>
              <p className="font-medium">
                Attract clients by <br /> sharing your{" "}
                <span className="text-[var(--primary)]">Referral Link</span>
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Image src={icon3} alt="" width={48} />
              </div>
              <p className="font-medium">
                Receive Daily <br />{" "}
                <span className="text-[var(--primary)]">
                  Commission Payouts
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BrokerPopup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}

export default IbBroker;
