"use client";
import { useEffect, useState } from "react";
import PoolModal from "@/component/PoolModal";
import Navbar from "@/component/Navbar";
import { PageTransition } from "@/component/PageTransition";
import { usePools } from "@/hooks/useCricketPools";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectPoolId, setSelectPoolId] = useState(0);
  const { pools, isLoading } = usePools();
  const [filteredPools, setFilteredPools] = useState([]);

  // 🔹 Sync filteredPools with pools by default
  useEffect(() => {
    if (pools?.length > 0) {
      setFilteredPools(pools);
    }
  }, [pools]);

  const filterPools = (status: "all" | "ongoing" | "ended") => {
    if (status === "all") {
      setFilteredPools(pools);
      return;
    }

    const now = Math.floor(Date.now() / 1000); // current time in seconds

    const filtered = pools.filter((pool) => {
      const isEnded = Number(pool.lockTime) < now;
      if (status === "ongoing") return !isEnded;
      if (status === "ended") return isEnded;
      return true;
    });

    setFilteredPools(filtered);
  };

  return (
    <>
      <PageTransition>
        <Navbar />
        <div className=" w-[80%] mt-28 flex-col mx-auto bg-[#000618] ">
          <header>
            <h1 className="uppercase mb-4">
              {isLoading ? "Loading Pools ..." : "Cricket Mania Pools"}
            </h1>
          </header>
          <div className="flex">
            <div className="flex items-center">
              <button
                onClick={() => filterPools("all")}
                className="retro rbtn-small text-xs mr-4 focus:bg-purple-500 active:bg-blue-500 "
              >
                All
              </button>
              <button
                onClick={() => filterPools("ongoing")}
                className="retro rbtn-small text-xs mr-4 focus:bg-purple-500"
              >
                On Going Pools
              </button>
              <button
                onClick={() => filterPools("ended")}
                className="retro rbtn-small text-xs mr-4 focus:bg-purple-500"
              >
                Ended Pools
              </button>
            </div>
          </div>

          <main className="mt-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPools.length === 0 && !isLoading && (
                <h1 className="uppercase whitespace-nowrap">No Pools Available</h1>
              )}

              {filteredPools.length > 0 &&
                filteredPools.map((pool) => {
                  const poolEnded = Number(pool?.lockTime) < Math.floor(Date.now() / 1000);

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
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {pool?.id || "P"}
                        </div>
                        <h2 className="text-md font-semibold uppercase text-white">{pool?.name}</h2>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-4">{pool?.description}</p>

                      {/* Options */}
                      {pool?.options?.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-xs font-semibold text-gray-300 mb-2">Options:</h3>
                          <div className="flex flex-wrap gap-2">
                            {pool.options.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Selected option:", opt, "in Pool:", pool.id);
                                }}
                                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Entry Fee */}
                      <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Starting Bet</span>
                        <span className="text-blue-400 text-xs font-medium">
                          {Number(pool?.entryFee) / 1e18} MON
                        </span>
                      </div>
                    </div>
                  );
                })}
            </section>
          </main>
        </div>
        {showModal && (
          <PoolModal
            setShowModal={setShowModal}
            pool={pools.find((p) => p.id === selectPoolId)}
          />
        )}

      </PageTransition>
    </>
  );
}


