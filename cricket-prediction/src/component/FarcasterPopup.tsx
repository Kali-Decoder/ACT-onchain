"use client";
import React from "react";
import Image from "next/image";

export default function FarcasterPopup() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#000618] px-6 gap-8">
      {/* Desktop Banner */}
    

      {/* Glassmorphic Farcaster link */}
      <a
        href="https://farcaster.xyz/miniapps/burznRnlq6uJ/cricket-mania"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all text-center cursor-pointer md:max-w-4xl lg:max-w-7xl w-full"
      >
          <Image
          src="/desktopBanner.png"
          alt="Desktop Banner"
          width={1200}
          height={400}
          className="rounded-2xl object-cover shadow-lg"
          priority
        />
        <h1 className="text-white pt-6 text-2xl font-bold mb-6">
          Click here to open in Farcaster App
        </h1>
        <p className="text-gray-200">
          This app works best on mobile. Click above to continue.
        </p>
      </a>
    </div>
  );
}
