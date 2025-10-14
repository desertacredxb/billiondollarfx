"use client";

import Digipay from "../../../../components/deposits/Digipay";
import RameePay from "../../../../components/deposits/Rameepay";

function Deposit() {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full rounded-md overflow-hidden shadow-md">
        <video
          src="/BILLION$ FX WEBSITE DEPOSITS.mp4" // 👈 place your video in public/banner/
          className="w-full object-cover rounded-md"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      <div className="h-screen md:h-[80vh] bg-gradient-to-br from-[#0a0f1d] to-[#0f172a] px-6 md:px-12 py-10 text-white">
        <h1 className="text-2xl font-bold mb-8">Payment Methods</h1>
        <div className="flex flex-wrap justify-center gap-6">
          <RameePay />
          <Digipay />
        </div>
      </div>
    </div>
  );
}

export default Deposit;
