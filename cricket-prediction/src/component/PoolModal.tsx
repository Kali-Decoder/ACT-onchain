import Link from "next/link";
import React from "react";

const PoolModal = ({ setShowModal, pool }) => {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black text-black bg-opacity-60 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-3 right-4 cursor-pointer text-gray-500 hover:text-black text-xl"
          >
            &times;
          </button>

          <h2 className="text-md font-semibold mb-4 text-center">
            🎲 Pool # {pool?.poolId}
          </h2>

          <table className="w-full text-xs text-left text-gray-700 border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium whitespace-nowrap">
                  👥 Players Joined
                </td>
                <td className="px-4 py-2 text-right">
                  <span className="text-green-600 font-semibold">
                    {pool?.totalplayers - pool?.playersLeft}
                  </span>
                  /{pool?.totalplayers}
                </td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="px-4 py-2 font-medium whitespace-nowrap">
                  💰 Total Liquidity
                </td>
                <td className="px-4 py-2 text-right">
                  {pool?.totalamount} MON
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">🎯 Base Entry</td>
                <td className="px-4 py-2 text-right">
                  {" "}
                  {(pool?.baseamount / 1e18).toFixed(2)} MON
                </td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="px-4 py-2 font-medium">⏱️ Pool Ends</td>
                <td className="px-4 py-2 text-right">
                  {" "}
                  {new Date(pool?.endtime * 1000).toLocaleString()}
                </td>
              </tr>

              {pool?.poolEnded && (
                <tr className="border-b bg-gray-50">
                  <td className="px-4 py-2 font-medium">Outcome</td>
                  <td className="px-4 py-2 text-right"> {pool?.result}</td>
                </tr>
              )}

              <tr>
                <td className="px-4 py-2 font-medium">🚦 Status</td>
                <td className="px-4 py-2 text-right">
                  {pool?.poolEnded ? (
                    <span className="text-red-600 font-semibold">Ended</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Open</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 text-center">
            {pool?.poolEnded ? (
              <>
                <button className="retro rbtn-small text-sm">
                  <Link href={`/play?poolId=${pool?.poolId}`}>Pool Ended</Link>
                </button>
              </>
            ) : (
              <button className="retro cursor-pointer rbtn-small text-sm ">
                <Link href={`/play?poolId=${pool?.poolId}`}>Play Now</Link>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolModal;
