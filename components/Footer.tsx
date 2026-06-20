import Image from "next/image";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPhoneAlt,
} from "react-icons/fa";
import logo from "../assets/bdfx.gif";
import Link from "next/link";

const marketLinks = [
  { label: "Forex", href: "/forex" },
  { label: "Indices", href: "/indices" },
  { label: "Crypto", href: "/crypto" },
  { label: "Metals", href: "/metals" },
  { label: "Commodities", href: "/commodities" },
  { label: "Oil", href: "/oil" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "About Us", href: "/about" },
  { label: "Our IB", href: "/ib-broker" },
  { label: "Education", href: "/education" },
  { label: "News & Insights", href: "/news" }, // or use "/insights" if that's your route
  { label: "Join Our Team", href: "/career" },
  { label: "Contact Us", href: "/contact" },
];
const footerLinks = [
  { label: "Privacy Policy", path: "/Privacy-Policy" },
  { label: "Terms & Conditions", path: "/Terms&Conditions" },
  { label: "AML Policy", path: "/aml-policy" },
  { label: "Deposit & Withdrawal Policy", path: "/Deposit&Withdrawal" },
  { label: "Restricted Countries", path: "/Restricted-Countries" },
  { label: "Risk Disclosure", path: "/risk-discloser" },
  // { label: "Client Services Agreement", path: "/client-services-agreement" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A1A25] text-white text-sm font-montserrat px-6 py-10 md:px-16 lg:px-24">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 justify-center gap-10">
        {/* Logo and intro */}
        <div>
          <Image
            src={logo}
            alt="Billio Dollar FX"
            width={240}
            className="mb-4"
          />

          <p className="text-gray-300">
            Engage in trading with Billion Dollar FX – a single platform
            offering multiple opportunities.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="font-bold text-white mb-2">Explore</h3>
          <ul className="text-gray-400 space-y-1">
            {navLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="hover:text-white cursor-pointer transition-colors text-center"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Markets */}
        <div>
          <h3 className="font-bold text-white mb-2">Markets</h3>
          <ul className="text-gray-400 space-y-1">
            {marketLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-bold text-white mb-2">Contact Info</h3>
          <ul className="text-gray-400 space-y-2">
            <li className="flex items-center gap-2">
              <FaWhatsapp className="text-green-400" /> whatsapp
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-blue-400" /> info@billiondollarfx.com
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-cyan-400" /> +971 509818742
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-cyan-400" />
              +91 8140431207
            </li>
          </ul>
          <div className="flex gap-3 mt-4 text-gray-400">
            {[FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube].map(
              (Icon, idx) => (
                <Icon key={idx} className="hover:text-white cursor-pointer" />
              )
            )}
          </div>
        </div>

        {/* Address */}
        {/* <div>
          <h3 className="font-bold text-white mb-2">Address</h3>
          <p className="text-gray-300 text-sm">
            <span className="block font-medium text-white mb-1">
              📌 Registered Address:
            </span>
            Ground Floor, The Sotheby Building, Rodney Bay, Gros-Islet, SAINT
            Lucia P.O Box 838, Castries, Saint Lucia.
          </p>
          <p className="text-sm mt-2 text-gray-300">
            <span className="block font-medium text-white">
              Registration Number:
            </span>{" "}
            2023-00197
          </p>
          <p className="text-sm mt-1 text-gray-300">
            <span className="block font-medium text-white">
              Professional License Number:
            </span>{" "}
            1423678
          </p>
        </div> */}
      </div>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-2">Risk Warning</h4>
          <p className="text-gray-400 text-sm">
            Please note that forex trading and trading in other leveraged
            products involves a significant level of risk and is not suitable
            for all investors. Trading in financial instruments may result in
            losses as well as profits and your losses can be greater than your
            initial invested capital. Before undertaking any such transactions,
            you should ensure that you fully understand the risks involved and
            seek independent advice if necessary.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-2">Restricted Regions</h4>
          <p className="text-gray-400 text-sm">
            Billion Dollar FX Limited does not provide services for
            citizens/residents of the USA, Cuba, Iraq, Myanmar, North Korea,
            Sudan. The services of Billion Dollar FX Limited are not intended
            for distribution to, or use by, any person in any country or
            jurisdiction where such distribution or use would be contrary to
            local law or regulation.
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400 text-xs flex flex-col md:flex-row md:justify-between items-center gap-2">
        <p>© 2025 All Rights Reserved By Billion Dollar FX</p>
        <div className="flex flex-wrap justify-center gap-4">
          {footerLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.path}
              className="hover:text-white cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
