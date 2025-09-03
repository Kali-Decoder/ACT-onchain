"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";

import { useDataContext } from "@/context/DataContext";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import JoinModal from "./JoinModal";

const PoolDetail = ({ singlePoolDetail }) => {
  const { address } = useAccount();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { setResultFunction, isOwner, getSinglePool } = useDataContext();

  const handleResolvePool = async (poolId) => {
    try {
      await setResultFunction(poolId);
    } catch (error) {
      console.log("Error in resolving pool", error);
    }
  };

  const refreshPage = async (poolId) => {
    await getSinglePool(poolId);
  };

  return (
    <>
      {" "}
      <div className="w-1/3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-6 py-3">
        <div className="flex justify-between items-baseline mb-6">
          <button className="retro cursor-pointer rbtn-small text-sm ">
            <a href="/">👈</a>
          </button>

          <h2 className="text-md text-black font-extrabold text-center">
            💰 Pool Details
          </h2>
        </div>

        {address ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-gray-800 border border-gray-300 rounded-lg overflow-hidden">
                <tbody className="bg-white divide-y divide-gray-300">
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Liquidity Pool:
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.totalamount.toFixed(2)} MON
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Connected Account:
                    </td>
                    <td className="py-3 px-4">
                      {address?.slice(0, 6) + "..." + address?.slice(-4)}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Number of Players:
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.totalplayers}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Players Space Left:
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.playersLeft}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Pool Status:
                    </td>
                    <td className="py-3 px-4">
                      {!singlePoolDetail?.[0]?.poolEnded ? (
                        <span className="text-green-600 font-bold">
                          OnGoing
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold">Ended</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Base Amount:
                    </td>
                    <td className="py-3 px-4">
                      {(singlePoolDetail?.[0]?.baseamount / 1e18).toFixed(2)}{" "}
                      MON
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      End Time:
                    </td>
                    <td className="py-3 px-4">
                      {new Date(
                        singlePoolDetail?.[0]?.endtime * 1000
                      ).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Result:
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.result
                        ? singlePoolDetail?.[0]?.result
                        : "Not Declared"}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Bet Status
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.bets.find(
                        (bet) =>
                          bet.user.toLowerCase() === address?.toLowerCase()
                      )?.user ? (
                        <button
                          disabled={true}
                          className="retro cursor-pointer rbtn-small text-sm "
                        >
                          Already Betted
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowJoinModal(true)}
                          className="retro rbtn-small text-sm"
                        >
                          Join Pool
                        </button>
                      )}
                    </td>
                  </tr>

                  {isOwner && !singlePoolDetail?.[0]?.poolEnded ? (
                    <tr className="bg-transparent">
                      <td className="py-1 px-2">
                        <button
                          onClick={() => {
                            handleResolvePool(singlePoolDetail?.[0]?.poolId);
                          }}
                          className="retro whitespace-nowrap cursor-pointer rbtn-small text-sm "
                        >
                          Resolve Pool
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            refreshPage(singlePoolDetail?.[0]?.poolId);
                          }}
                          className="retro cursor-pointer rbtn-small text-sm "
                        >
                          ⮑
                        </button>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div>
            Connect Your Wallet <ConnectButton />
          </div>
        )}
      </div>
      {showJoinModal && (
        <JoinModal
          setShowJoinModal={setShowJoinModal}
          pool={singlePoolDetail?.[0]}
        />
      )}
    </>
  );
};

export default PoolDetail;
