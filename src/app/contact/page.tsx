"use client";

import { div } from "framer-motion/client";
import { useState } from "react";
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country: "",
    message: "",
    consent: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked // ✅ cast safely
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(formData);
  };

  return (
    <div>
      <Navbar />
      <div className="bg-[#0a0f1c] text-white px-4 pb-16 pt-28 md:px-12 lg:px-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Connect with Billion Dollar FX: Unleash Your Trading Potential
          </h2>
          <p className="text-gray-300 mb-6">
            Embark on a journey to success with Billion Dollar FX, where your
            questions and feedback become the compass guiding our commitment to
            excellence.
          </p>

          {/* Social Icons */}
          <div className="flex justify-center space-x-6 text-lg mb-10">
            <a href="#">
              <FaFacebook />
            </a>
            <a href="#">
              <FaInstagram />
            </a>
            <a href="#">
              <FaLinkedin />
            </a>
            <a href="#">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl mx-auto bg-transparent"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              name="name"
              placeholder="Enter your full name here.."
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md bg-transparent border border-gray-500 px-4 py-3 focus:outline-none"
            />
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-md bg-transparent border border-gray-500 px-4 py-3 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Enter your email here.."
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md bg-transparent border border-gray-500 px-4 py-3 focus:outline-none"
            />
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full rounded-md bg-transparent border border-gray-500 px-4 py-3 focus:outline-none"
            >
              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="UAE">UAE</option>
              <option value="USA">USA</option>
            </select>
          </div>

          <textarea
            name="message"
            placeholder="Enter your message here.."
            value={formData.message}
            onChange={handleChange}
            className="w-full rounded-md bg-transparent border border-gray-500 px-4 py-3 mb-4 focus:outline-none"
            rows={4}
          ></textarea>

          <div className="flex items-start space-x-2 mb-6 text-sm text-gray-400">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              className="mt-1"
            />
            <p>
              Here at Billion Dollar FX we take your privacy seriously and will
              only use your personal information to administer your account and
              to provide the products and services you have requested from us.
              However, from time to time we would like to contact you with
              details of other products, offers and services we provide. If you
              consent to us contacting you for this purpose please tick to say
              you would like us to contact you. I have read and agree to the
              terms & conditions and privacy & cookies policy.
            </p>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-medium"
          >
            Submit
          </button>
        </form>

        {/* Contact Info */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center mt-12 text-gray-300">
          <div>whatsapp</div>
          <div>support@Billion Dollar FX.com</div>
          <div>+971 4 447 1894</div>
          <div>P.O Box 838 Castries, Saint Lucia.</div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 max-w-3xl mx-auto">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">
            Embark on a transformative trading journey with us — where trading
            isn&apos;t just an action, it&apos;s a difference. Trade with us, be
            the difference.
          </h3>
          <p className="text-gray-300 mb-6">
            Dive into a world where every trade creates a ripple of impact. Join
            us in shaping a unique trading experience that not only sets you
            apart but also makes a positive difference. Trade with purpose,
            trade with us.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-medium">
            Start your Journey today
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
