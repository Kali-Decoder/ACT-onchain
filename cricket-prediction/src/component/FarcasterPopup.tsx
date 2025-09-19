"use client";
import React from "react";

export default function FarcasterPopup() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#000618] px-6">
      <a
        href="https://farcaster.xyz/miniapps/burznRnlq6uJ/cricket-mania"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all text-center cursor-pointer max-w-2xl w-full"
      >
        <h1 className="text-white text-2xl font-bold mb-6">
          Click here to open in Farcaster App
        </h1>
        <p className="text-gray-200">
          This app works best on mobile. Click above to continue.
        </p>
      </a>
    </div>
  );
}
