"use client";
import {
  BarChart2,
  Mail,
  Search,
  Calculator,
  Calendar,
  Activity,
  BookOpen,
  BarChart,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    label: "Technical Analysis",
    icon: <BarChart size={18} />,
    key: "technical",
  },
  { label: "Messaging & Alerts", icon: <Mail size={18} />, key: "messaging" },
  { label: "MT4/5 LaunchPad", icon: <Search size={18} />, key: "mt4" },
  { label: "Risk Calculator", icon: <Calculator size={18} />, key: "risk" },
  { label: "Calendar", icon: <Calendar size={18} />, key: "calendar" },
  { label: "News Sentiment", icon: <Activity size={18} />, key: "sentiment" },
  {
    label: "Performance Statistics",
    icon: <BarChart2 size={18} />,
    key: "performance",
  },
  { label: "Education", icon: <BookOpen size={18} />, key: "education" },
];

const TechnicalAnalysis = () => {
  const [activeTab, setActiveTab] = useState("technical");

  const renderContent = () => {
    switch (activeTab) {
      case "technical":
        return (
          <p className="text-sm text-orange-200">
            Below are technical trade setups that Autochartist has automatically
            identified using Technical Analysis and Statistical Analysis.
            Autochartist identifies Technical Chart Patterns, Fibonacci
            Patterns, Horizontal Support & Resistance levels, and extreme market
            movements. Use this information to identify market trends and
            reversals.
          </p>
        );
      case "messaging":
        return (
          <p className="text-sm text-white">
            Timely alerts & trade notifications.
          </p>
        );
      case "mt4":
        return (
          <p className="text-sm text-white">Launch MT4/MT5 terminals easily.</p>
        );
      case "risk":
        return (
          <p className="text-sm text-white">Calculate risk before trading.</p>
        );
      case "calendar":
        return (
          <p className="text-sm text-white">Upcoming economic events here.</p>
        );
      case "sentiment":
        return (
          <p className="text-sm text-white">View market sentiment insights.</p>
        );
      case "performance":
        return <p className="text-sm text-white">Trade performance metrics.</p>;
      case "education":
        return (
          <p className="text-sm text-white">
            Sharpen skills with educational resources.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-black text-white px-0 md:px-6 py-6 rounded-md font-raleway">
      <h2 className="text-2xl font-bold mb-4">Technical Analysis</h2>

      <div className=" flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            title={tab.label}
            className={`flex flex-col items-center justify-center gap-1 py-3 flex-1 min-w-0 text-center text-[11px] font-medium transition-all duration-200 ease-in-out rounded-t-2xl border border-gray-800
      ${
        activeTab === tab.key
          ? "text-white font-bold border-b-4 border-b-[#927948] bg-[#1f1f1f]"
          : "hover:bg-[#222] text-gray-300"
      }`}
          >
            {tab.icon}
            <span className="hidden sm:inline break-words leading-tight text-[11px] px-1">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#1a1a1a] mt-4 p-4 rounded-lg">{renderContent()}</div>
    </div>
  );
};

export default TechnicalAnalysis;
