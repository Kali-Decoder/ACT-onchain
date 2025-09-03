import Link from "next/link";
import React from "react";

const PoolModal = ({ setShowModal, pool }) => {
  if (!pool) return null;

  const poolEnded = Number(pool?.lockTime) < Math.floor(Date.now() / 1000);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-900 text-white rounded-2xl p-6 max-w-lg w-full shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-4 cursor-pointer text-gray-400 hover:text-white text-2xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-2">{pool?.name}</h2>
        <p className="text-sm text-gray-400 text-center mb-6">{pool?.description}</p>

        {/* Pool Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm border border-gray-700 rounded-lg p-4 mb-6">
          <span className="font-medium">Pool ID:</span>
          <span>{pool?.id}</span>

          <span className="font-medium">Entry Fee:</span>
          <span className="text-blue-400">{Number(pool?.entryFee) / 1e18} MON</span>

          <span className="font-medium">Start Time:</span>
          <span>{new Date(Number(pool?.startTime) * 1000).toLocaleString()}</span>

          <span className="font-medium">Lock Time:</span>
          <span>{new Date(Number(pool?.lockTime) * 1000).toLocaleString()}</span>

          <span className="font-medium">Platform Fee:</span>
          <span>{pool?.platformFeeBps / 100}%</span>

          <span className="font-medium">Resolved:</span>
          <span>{pool?.resolved ? "✅ Yes" : "❌ No"}</span>

          <span className="font-medium">Winners Count:</span>
          <span>{pool?.winnersCount.toString()}</span>
        </div>

        {/* Options to Bet */}
        {!poolEnded ? (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Choose Your Option:</h3>
            <div className="flex flex-wrap gap-2">
              {pool?.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Selected option:", opt, "for pool:", pool.id);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <p className="text-red-500 font-medium">⚠️ This pool has ended</p>
            <p className="text-sm text-gray-400">Winning Option: {pool?.winnersCount?.toString()}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          {poolEnded ? (
            <button
              disabled
              className="retro rbtn-small text-sm opacity-50 cursor-not-allowed"
            >
              Pool Ended
            </button>
          ) : (
            <Link href={`/play?poolId=${pool?.id}`}>
              <button className="retro rbtn-small text-sm">Place Bet</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoolModal;
