"use client";

import ConnectButton from "@/providers/wallet-connect";
import Link from "next/link";
import React from "react";
import { useAccount, useBalance } from "wagmi";
import CreatePoolModal from "./CreatePoolModal";
import deployments from "../../../onchain-contracts/deployments/CricketPredictionPools.json";
import { useIsOwner } from "@/hooks/useCricketPools";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const { address } = useAccount();
  const { isOwner,isLoading } = useIsOwner();
  const { data: balanceData } = useBalance({
    address: deployments.address,
    watch: true,
  });

  return (
    <>
      <nav className="fixed top-4 w-full flex justify-center z-50">
        <div className="relative w-full max-w-7xl px-4 sm:px-6 md:px-8 mx-auto">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 shadow-lg">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                🏏 Cricket Mania
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 ml-auto">


              {address && isOwner && (
                <>
                  <button
                    onClick={() => setShowCreatePoolModal(true)}
                    className="retro rbtn-small text-xs sm:text-sm"
                  >
                    Create Pool
                  </button>
                  <button
                   // onClick={async()=>{
                  //   await withdrawlContractBalance();
                  // }}
                  
                  className="retro rbtn-small text-xs sm:text-sm">
                      Contract Balance {"💰 " + balanceData?.formatted + balanceData?.symbol}
                  </button>
                </>
              )}

              <div className="flex items-center gap-2">
                {address && (
                  <span className="retro rbtn-small text-xs sm:text-sm">
 🟢 {address.slice(0, 4) + "..." + address.slice(-3)}                  </span>
                )}
                <ConnectButton />
              </div>             
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden ml-auto text-gray-900 dark:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute top-full left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] md:w-[80%] px-4 bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-xl py-4 flex flex-col items-center space-y-4 border border-white/20 mt-2 z-50"
              >
                
                {address && isOwner && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => {
                        setShowCreatePoolModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="retro rbtn-small text-xs"
                    >
                      Create Pool
                    </button>
                    <button
                        // onClick={async()=>{
                  //   await withdrawlContractBalance();
                  // }}
                   className="retro rbtn-small text-xs">
                  Balance {"💰 " + balanceData?.formatted}
                    </button>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {showCreatePoolModal && (
        <CreatePoolModal setShowCreatePoolModal={setShowCreatePoolModal} />
      )}
    </>
  );
};

export default Navbar;
