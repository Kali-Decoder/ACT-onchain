"use client";

import ConnectButton from "@/providers/wallet-connect";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import CreatePoolModal from "./CreatePoolModal";
import deployments from "../../../onchain-contracts/deployments/CricketPredictionPools.json";
import { useIsOwner } from "@/hooks/useCricketPools";

import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const { isOwner } = useIsOwner();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({
    address: deployments.address,
    watch: true,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-4 w-full flex justify-center z-50">
        <div className="relative w-full max-w-7xl px-4 sm:px-6 md:px-8 mx-auto">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 shadow-lg">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                🏏 Cricket Mania
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="ml-auto text-gray-900 dark:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu with Smooth Toggle */}
          <div
            ref={menuRef}
            className={`overflow-hidden transition-all duration-300 ease-in-out w-full max-w-7xl px-6 bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-xl flex flex-col items-center space-y-4 border border-white/20 mt-2 relative mx-auto ${
              isMobileMenuOpen ? "max-h-[1000px] py-4" : "max-h-0 py-0"
            }`}
          >
            {/* Owner Controls */}
            {address && isOwner && (
              <div className="flex flex-col items-center gap-2 w-full">
                <button
                  onClick={() => {
                    setShowCreatePoolModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="retro rbtn-small text-xs w-full"
                >
                  Create Pool
                </button>
                <button
                  // onClick={async()=>{ await withdrawlContractBalance(); }}
                  className="retro rbtn-small text-xs w-full"
                >
                  Balance {"💰 " + balanceData?.formatted}
                </button>
              </div>
            )}

            {/* Wallet Connect */}
            <div className="flex items-center gap-2 w-full justify-center">
              {address && (
                <span className="retro rbtn-small text-xs">
                  🟢 {address.slice(0, 4) + "..." + address.slice(-3)}
                </span>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Create Pool Modal */}
      {showCreatePoolModal && (
        <CreatePoolModal setShowCreatePoolModal={setShowCreatePoolModal} />
      )}
    </>
  );
};

export default Navbar;
