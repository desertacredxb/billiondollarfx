"use client";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function RestrictedCountries() {
  const countries = [
    "Afghanistan",
    "Albania",
    "Angola",
    "Bahamas",
    "Barbados",
    "Botswana",
    "Cambodia",
    "Cote d Ivoire (Ivory Coast)",
    "Crimea and Sevastopol",
    "Cuba",
    "Democratic Peoples Republic of Korea (DPRK)",
    "Democratic Republic of Congo",
    "Ghana",
    "Iceland",
    "Iran",
    "Iraq",
    "Jamaica",
    "Liberia",
    "Mauritius",
    "Mongolia",
    "Myanmar",
    "Nicaragua",
    "Pakistan",
    "Panama",
    "Somalia",
    "Sudan",
    "Syria",
    "Trinidad and Tobago",
    "Uganda",
    "United States of America (USA)",
    "Yemen",
    "Zimbabwe",
  ];

  return (
    <div className="bg-[var(--bg)] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 md:px-8 lg:px-20 pt-36 pb-16 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Restricted <span className="text-[var(--primary)]">Countries</span>
        </h1>
        <p className="max-w-4xl mx-auto text-gray-400 text-base md:text-lg">
          BillionDollarFX Limited does not provide services to residents of the
          following countries.
        </p>
      </section>

      {/* Content Section */}
      <section className="w-11/12 md:w-4/5 mx-auto pb-20 space-y-10">
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">
              European Union (EU) Member Countries
            </strong>
          </p>
          <p className="text-gray-300 leading-relaxed">
            We have decided not to provide account facilities to residents of
            sanctioned countries due to the continuous and significant money
            laundering and financing of terrorism (ML/FT) risks and the lack of
            transparency in the international financial system.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary)]">
            Restricted Countries Include:
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-gray-300">
            {countries.map((country, idx) => (
              <li
                key={idx}
                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700 transition"
              >
                {country}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
