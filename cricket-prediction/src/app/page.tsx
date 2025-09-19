"use client";
import { useState, useMemo, useEffect } from "react";
import PoolModal from "@/component/PoolModal";
import { PageTransition } from "@/component/PageTransition";
import { usePools } from "@/hooks/useCricketPools";
import { useAccount } from "wagmi";
import Navbar from "@/component/Navbar";
import FarcasterPopup from "@/component/FarcasterPopup";
import MobileFooterFilters from "@/component/MobileFooterFilters";
import Image from "next/image";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectPoolId, setSelectPoolId] = useState<number | null>(null);
  const { pools, isLoading } = usePools();
  const [status, setStatus] = useState<"all" | "ongoing" | "ended">("all");
  const { address } = useAccount();
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop/tablet based on window width
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640); // md breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter pools based on status
  const filteredPools = useMemo(() => {
    if (!pools?.length) return [];
    if (status === "all") return pools;
    const now = Math.floor(Date.now() / 1000);
    return pools.filter((pool) => {
      const isEnded = Number(pool.lockTime) < now;
      if (status === "ongoing") return !isEnded;
      if (status === "ended") return isEnded;
      return true;
    });
  }, [pools, status]);

  // Desktop/tablet → show only Farcaster popup
  if (isDesktop) return <FarcasterPopup />;

  // Mobile → show full pools page
  return (
    <PageTransition>
      <Navbar />

      {/* Background image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/hero-bg.jpg"
          alt="Abstract blockchain background"
          fill
          className="object-cover scale-100"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="w-full sm:w-[90%] lg:w-[80%] mt-32 sm:mt-28 flex-col mx-auto px-4 sm:px-0">
        {/* Header */}
        <header className="px-2">
          <h1 className="uppercase py-4">
            {isLoading ? "Loading Pools ..." : "Cricket Mania Pools"}
          </h1>
        </header>

        {/* Pool cards */}
        <main className="mt-8">
          <section className="grid px-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPools.length === 0 && !isLoading && (
              <h1 className="uppercase">No Pools Available</h1>
            )}

            {filteredPools.map((pool) => {
              const entryFee = Number(pool?.entryFee) / 1e18;
              const totalPot = Number(pool?.totalPot) / 1e18;
              const totalEntries = Number(pool?.totalEntries);

              return (
                <div
                  key={pool?.id}
                  onClick={() => {
                    setShowModal(true);
                    setSelectPoolId(pool?.id);
                  }}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow hover:shadow-lg cursor-pointer transition-all"
                >
                  {/* Logo + Name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="min-w-10 min-h-10 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {pool?.id || "P"}
                    </div>

                    <div className="flex flex-col">
                      <h2 className="text-sm font-semibold uppercase text-white flex items-center gap-2">
                        {pool?.name} ?
                      </h2>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                        {pool?.desc}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  {pool?.options?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-gray-300 mb-2">
                        Options:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {pool.options.map((opt, idx) => {
                          const isWinningOption =
                            pool.resolved && idx === pool.winningOption;
                          return (
                            <button
                              key={idx}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-3 py-1 text-xs rounded-md text-gray-200 ${
                                isWinningOption
                                  ? "bg-blue-500 hover:bg-blue-600"
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-xs">Starting Bet</span>
                      <span className="text-blue-400 text-xs font-medium">
                        {entryFee} MON
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-xs">Total Pot</span>
                      <span className="text-blue-400 text-xs font-medium">
                        {totalPot} MON
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-xs">Total Entries</span>
                      <span className="text-blue-400 text-xs font-medium">
                        {totalEntries}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-xs">Status</span>
                      <span className="text-blue-400 text-xs font-medium">
                        {Number(pool?.lockTime) < Math.floor(Date.now() / 1000) ? (
                          <span className="text-red-500 text-xs font-normal">
                            Ended
                          </span>
                        ) : (
                          <span className="text-green-500 text-xs font-normal">
                            Live
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </main>
      </div>

      {/* Pool modal */}
      {showModal && selectPoolId && (
        <PoolModal
          setShowModal={setShowModal}
          pool={pools.find((p) => p.id === selectPoolId)}
          currentUser={address}
        />
      )}

      {/* Mobile footer filters */}
      <MobileFooterFilters status={status} setStatus={setStatus} />
    </PageTransition>
  );
}
