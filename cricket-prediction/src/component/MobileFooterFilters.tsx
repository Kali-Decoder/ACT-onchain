"use client";
import React from "react";
import { Home, Clock, CheckCircle, List, PlusCircle, XCircle } from "lucide-react";

interface Props {
  status: "all" | "ongoing" | "ended";
  setStatus: (status: "all" | "ongoing" | "ended") => void;
}

export default function MobileFooterFilters({ status, setStatus }: Props) {
  return (
    <>
      {/* Main Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0a0f23] border-t border-gray-700 flex justify-around items-center py-3 sm:hidden z-50">
        <button
          onClick={() => setStatus("all")}
          className={`flex flex-col items-center text-xs ${
            status === "all" ? "text-purple-500" : "text-gray-400"
          }`}
        >
          <Home className="w-8 h-8 mb-1" />
          All
        </button>

        <button
          onClick={() => setStatus("ongoing")}
          className={`flex flex-col items-center text-xs ${
            status === "ongoing" ? "text-purple-500" : "text-gray-400"
          }`}
        >
          <Clock className="w-8 h-8 mb-1" />
          Ongoing
        </button>

        <button
          onClick={() => setStatus("ended")}
          className={`flex flex-col items-center text-xs ${
            status === "ended" ? "text-purple-500" : "text-gray-400"
          }`}
        >
          <CheckCircle className="w-8 h-8 mb-1" />
          Ended
        </button>

        <a
          href="/leaderboard"
          className="flex flex-col items-center text-xs text-gray-400"
        >
          <List className="w-8 h-8 mb-1" />
          Leaderboard
        </a>
      </div>

      {/* Floating Right Side Icons (UI only) */}
      <div className="fixed bottom-22 right-8 flex flex-col gap-4 sm:hidden z-50">
        <div className="w-16 h-16 bg-[#0a0f23] border border-gray-700 rounded-2xl flex items-center justify-center shadow-sm">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="w-16 h-16 bg-[#0a0f23] border border-gray-700 rounded-2xl flex items-center justify-center shadow-sm">
          <PlusCircle className="w-8 h-8 text-green-400" />
        </div>
      </div>
    </>
  );
}
