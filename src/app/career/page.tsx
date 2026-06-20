import React from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const Career = () => {
  return (
    <div className="bg-[var(--bg)] text-white font-raleway">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-[70vh] flex items-center justify-center px-6 text-center relative">
        <div className="max-w-5xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight text-[var(--primary)]">
            Join Our Team
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Are you passionate about financial markets and innovation? At
            <span className="text-white font-semibold"> BillionDollarFX</span>,
            we’re redefining how the world approaches Forex. We’re a dynamic
            team looking for like-minded individuals to grow with us. We believe
            in nurturing talent, encouraging innovation, and rewarding bold
            moves. If you’re ready to join a team that plays hard, works smart,
            and never stops evolving — let’s talk.
          </p>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[var(--primary)] mb-4">
          Why Work With Us?
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto text-base leading-relaxed">
          At <span className="text-white font-medium">BillionDollarFX</span>,
          innovation meets precision in the world of Forex. We&#39;re driven by
          results and focused on breaking new ground. We don&#39;t follow trends
          — we set them. Join a team that thrives on bold thinking, fast
          execution, and a culture built for winners.
        </p>
      </section>

      {/* Global Culture */}
      <section className="py-16 px-6 bg-[#111827]">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-semibold text-[var(--primary)] mb-4">
            Global Vibes, Local Impact
          </h3>
          <p className="text-gray-400 max-w-3xl mx-auto text-base leading-relaxed">
            Work with Forex professionals from across the globe. You&#39;ll be
            part of a connected, diverse culture that shares knowledge, wins
            together, and grows together. If market trends excite you and
            candlesticks feel like art, you&#39;re in the right place.
          </p>
        </div>
      </section>

      {/* Make Your Mark */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center">
        <h3 className="text-2xl font-semibold text-[var(--primary)] mb-4">
          Make Your Mark
        </h3>
        <p className="text-gray-400 max-w-3xl mx-auto text-base leading-relaxed">
          Think fast, move smart, and grow with a team that plays to win. At
          <span className="text-white font-medium"> BillionDollarFX</span>,
          we’re all about bold moves, sharp minds, and turning ambition into
          action. We’re always looking for analysts, devs, and creative
          thinkers. If you&#39;re hungry to disrupt Forex with smart work and
          sharp insights — end the wait!
        </p>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Career;
