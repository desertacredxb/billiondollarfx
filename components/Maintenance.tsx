// src/pages/Maintenance.tsx

import React from "react";

export default function Maintenance() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="text-center p-8 rounded-2xl shadow-lg bg-gray-900/70 backdrop-blur-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🚧 Website Under Maintenance
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          We’re currently performing some updates to improve your experience.
          Please check back soon.
        </p>
        <div className="animate-pulse text-yellow-400 text-2xl">⚡</div>
      </div>
    </div>
  );
}
