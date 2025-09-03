"use client";

import { useDataContext } from "@/context/DataContext";
import { useEffect, useState } from "react";
import PoolModal from "@/component/PoolModal";
import Navbar from "@/component/Navbar";
import { PageTransition } from "@/component/PageTransition";
export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const { totalPools, isPoolsLoading } = useDataContext();
  const [filteredPools, setFilteredPools] = useState(totalPools);
  const [selectPoolId, setSelectPoolId] = useState(0);

  const filterPools = (status) => {
    if (status === "all") {
      setFilteredPools(totalPools);
      return;
    }
    const filtered = totalPools.filter((pool) => {
      if (status === "ongoing") {
        return !pool.poolEnded;
      } else if (status === "ended") {
        return pool.poolEnded;
      }
      return true; // Show all pools by default
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
              {isPoolsLoading ? "Loading Pools ..." : "Dice Mania Pools"}
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
            <section>
              {filteredPools.length === 0 && 
              <>
                <h1 className="uppercase whitespace-nowrap">No Pools Available</h1>
              </>}
              {filteredPools.length > 0 &&
                filteredPools.map((pool) => {
                  return (
                    <>
                      <div className="relative">
                        {pool?.poolEnded ? (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded shadow  z-10">
                            Ended
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded shadow  z-10">
                            On Going
                          </div>
                        )}

                        <article
                          onClick={() => {
                            setShowModal(true);
                            setSelectPoolId(pool.poolId);
                          }}
                          style={{ color: "#b0b6a9" }}
                          className="cursor-pointer"
                        >
                          <figure>
                            {pool?.poolEnded ? (
                              <img src="https://img.pikbest.com/origin/10/42/57/61fpIkbEsTW5T.png!w700wp" />
                            ) : (
                              <img
                                className="w-60 h-60 mt-14"
                                src="https://png.pngtree.com/png-clipart/20240103/original/pngtree-start-game-pixel-text-effect-vector-png-image_14002306.png"
                              />
                            )}

                            <figcaption className="text-sm flex justify-between">
                              <span>Pool: {pool?.poolId}</span>
                              <span>
                                {pool?.poolEnded ? (
                                  <span className="text-red-600">🔴</span>
                                ) : (
                                  <span>🟢</span>
                                )}
                              </span>
                            </figcaption>

                            <figcaption className="flex justify-between">
                              <span className="text-xs">Fee: </span>
                              <span className="text-xs text-blue-400">
                                {pool?.baseamount / 1e18} MON
                              </span>
                            </figcaption>
                          </figure>
                        </article>
                      </div>
                    </>
                  );
                })}
            </section>
          </main>
        </div>

        {showModal && (
          <PoolModal
            setShowModal={setShowModal}
            pool={totalPools[selectPoolId]}
          />
        )}
      </PageTransition>
    </>
  );
}
