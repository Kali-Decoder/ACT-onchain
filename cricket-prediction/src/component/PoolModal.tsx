import { useHasJoined, useJoinPool } from "@/hooks/useCricketPools";
import React, { useState } from "react";
import toast from "react-hot-toast";

const PoolModal = ({ setShowModal, pool }) => {
  const { joinPool, isPending, isConfirming, isSuccess } = useJoinPool();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { hasJoined, isLoading } = useHasJoined(pool.id);
  if (!pool) return null;

  const poolEnded = Number(pool?.lockTime) < Math.floor(Date.now() / 1000);

  const handleJoin = async () => {
    if (selectedOption === null) return;
    if (hasJoined) {
      toast.success("Already Betted !!!");
    }
    console.log(pool.id, selectedOption,pool?.entryFee);
    joinPool(pool.id, selectedOption,pool?.entryFee);
    if(!isLoading){
      setShowModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-white rounded-xl p-6 max-w-lg w-full shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-white text-2xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-2">{pool?.name}</h2>
        <p className="text-sm text-gray-400 text-center mb-6">{pool?.desc}</p>

        {/* Pool Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Pool ID", value: pool?.id },
            { label: "Entry Fee", value: `${Number(pool?.entryFee) / 1e18} MON` },
            { label: "Start Time", value: new Date(Number(pool?.startTime) * 1000).toLocaleString() },
            { label: "Lock Time", value: new Date(Number(pool?.lockTime) * 1000).toLocaleString() },
            { label: "Platform Fee", value: `${pool?.platformFeeBps / 100}%` },
            { label: "Resolved", value: pool?.resolved ? "✅ Yes" : "❌ No" },
            { label: "Total Entries", value: pool?.totalEntries.toString() },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-3 rounded-xl flex flex-col justify-center items-start"
            >
              <span className="text-gray-400 text-xs">{item.label}</span>
              <span className="font-semibold text-white mt-1 text-xs">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Options to Bet */}
        {!poolEnded ? (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Choose Your Option:</h3>
            <div className="flex flex-wrap gap-3">
              {pool?.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOption(idx);
                  }}
                  className={`px-5 py-2 cursor-pointer rounded-xl text-sm font-medium transition-all duration-300 ${selectedOption === idx
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <p className="text-red-500 font-semibold text-lg mb-2">⚠️ This pool has ended</p>
            <p className="text-green-400 font-bold text-xl">
              Winning Option: {pool?.winnersCount?.toString()}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center mt-4">
          <button
            onClick={handleJoin}
            disabled={poolEnded || selectedOption === null || isPending || isConfirming || hasJoined}
            className={`retro rbtn-small text-sm ${poolEnded || selectedOption === null || isPending || isConfirming || hasJoined
              ? "opacity-50 cursor-not-allowed"
              : ""
              }`}
          >
            {hasJoined
              ? "Already Joined ✅"
              : isPending || isConfirming
                ? "Joining..."
                : isSuccess
                  ? "Joined ✅"
                  : "Place Bet"}
          </button>
        </div>

        {/* Has Joined Message */}
        {isLoading ? (
          <p className="text-gray-400 text-center mt-2">Checking participation...</p>
        ) : hasJoined ? (
          <p className="text-yellow-400 text-center mt-2 font-semibold">
            You have already joined this pool.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default PoolModal;
