"use client";
import { useState, useMemo } from "react";
import PoolModal from "@/component/PoolModal";
import Navbar from "@/component/Navbar";
import { PageTransition } from "@/component/PageTransition";
import { usePools } from "@/hooks/useCricketPools";
import { useAccount } from "wagmi";


export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectPoolId, setSelectPoolId] = useState<number | null>(null);
  const { pools, isLoading } = usePools();
  const [status, setStatus] = useState<"all" | "ongoing" | "ended">("all");
  const { address } = useAccount();
  // derive filtered pools
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

  return (
    <>
      <PageTransition>
        <Navbar />
        <div className="w-full sm:w-[90%] lg:w-[80%] mt-24 sm:mt-28 flex-col mx-auto bg-[#000618] px-4 sm:px-0">
          <header>
            <h1 className="uppercase mb-4">
              {isLoading ? "Loading Pools ..." : "Cricket Mania Pools"}
            </h1>
          </header>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-0">
            <div className="flex flex-wrap items-center">
              <button
                onClick={() => setStatus("all")}
                className={`retro rbtn-small text-xs mr-2 sm:mr-4 ${status === "all" ? "bg-purple-500" : ""
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setStatus("ongoing")}
                className={`retro rbtn-small text-xs mr-2 sm:mr-4 ${status === "ongoing" ? "bg-purple-500" : ""
                  }`}
              >
                On Going Pools
              </button>
              <button
                onClick={() => setStatus("ended")}
                className={`retro rbtn-small text-xs mr-2 sm:mr-4 ${status === "ended" ? "bg-purple-500" : ""
                  }`}
              >
                Ended Pools
              </button>
            </div>
          </div>

          {/* Pool cards */}
          <main className="mt-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPools.length === 0 && !isLoading && (
                <h1 className="uppercase">No Pools Available</h1>
              )}

              {filteredPools.length > 0 &&
                filteredPools.map((pool) => {
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
                        {/* Pool ID / Avatar */}
                        <div className="min-w-10 min-h-10 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {pool?.id || "P"}
                        </div>

                        {/* Name + Description */}
                        <div className="flex flex-col">
                          <h2 className="text-sm font-semibold uppercase text-white flex items-center gap-2">
                            {pool?.name} ?

                          </h2>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{pool?.desc}</p>
                        </div>
                      </div>

                      {/* Options */}
                      {pool?.options?.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-xs font-semibold text-gray-300 mb-2">Options:</h3>
                          <div className="flex flex-wrap gap-2">
                            {pool.options.map((opt, idx) => {
                              const isWinningOption = pool.resolved && idx === pool.winningOption;
                              return (
                                <button
                                  key={idx}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`px-3 py-1 text-xs rounded-md text-gray-200 ${isWinningOption
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

           
                      <div className="border-t border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-xs">Starting Bet</span>
                          <span className="text-blue-400 text-xs font-medium">{entryFee} MON</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-xs">Total Pot</span>
                          <span className="text-blue-400 text-xs font-medium">{totalPot} MON</span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-xs">Total Entries</span>
                          <span className="text-blue-400 text-xs font-medium">{totalEntries}</span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-xs">Status</span>
                          <span className="text-blue-400 text-xs font-medium"> {Number(pool?.lockTime) < Math.floor(Date.now() / 1000) && (
                            <span className="text-red-500 text-xs font-normal">Ended</span>
                          )}</span>
                        </div>



                        {/* <div className="flex justify-between items-center mb-1 mt-4">
                          <span className="text-gray-400 text-xs">Total Pot</span>
                          <span className="text-green-400 text-xs font-medium">{totalPot} / 100 MON</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div> */}
                      </div>
                    </div>
                  );
                })}

            </section>
          </main>

        </div>

        {/* Modal */}
        {showModal && selectPoolId && (
          <PoolModal
            setShowModal={setShowModal}
            pool={pools.find((p) => p.id === selectPoolId)}
            currentUser={address}
          />
        )}
      </PageTransition>
    </>
  );
}
