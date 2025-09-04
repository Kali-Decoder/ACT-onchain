import { useHasJoined, useJoinPool, useResolvePool } from "@/hooks/useCricketPools";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const PoolModal = ({ setShowModal, pool, currentUser }) => {
  const { joinPool, isPending, isConfirming, isSuccess } = useJoinPool();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { hasJoined, isLoading } = useHasJoined(pool.id);
  const { resolvePool, isPending: resolvePending, isConfirming: resolveConfirming } = useResolvePool();

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!pool) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(pool.lockTime - now, 0);
      setTimeLeft(diff);
    };

    updateTimer(); // initial call

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pool]);

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d > 0 ? d + "d " : ""}${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!pool) return null;

  const poolEnded = Number(pool?.lockTime) < Math.floor(Date.now() / 1000);
  const isOwner = currentUser?.toLowerCase() === pool?.owner?.toLowerCase();

  const handleJoin = () => {
    if (selectedOption === null) return;
    if (hasJoined) {
      toast.success("Already joined!");
      return;
    }
    joinPool(pool.id, selectedOption, pool?.entryFee, {
      onSuccess: () => {
        toast.success("Joined pool!");
        setShowModal(false);
      },
      onError: (err) => {
        console.error(err);
        toast.error("Failed to join pool");
      },
    });
  };

  const handleResolve = (optionIndex: number) => {
    resolvePool(pool.id, optionIndex, {
      onSuccess: () => toast.success("Pool resolved!"),
      onError: (err) => {
        console.error(err);
        toast.error("Failed to resolve pool");
      },
    });
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
            { label: "Lock Time", value: poolEnded ? "Ended" : formatTime(timeLeft) },
            { label: "Platform Fee", value: `${pool?.platformFeeBps / 100}%` },
            { label: "Resolved", value: pool?.resolved ? "✅ Yes" : "❌ No" },
            { label: "Total Entries", value: pool?.totalEntries.toString() },
            ...(pool?.resolved
              ? [
                {
                  label: "Winning Option",
                  value: `${pool?.winningOption}: ${pool?.options?.[pool?.winningOption] || "N/A"}`
                }
              ]
              : []),
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
        {!poolEnded && !pool?.resolved && (
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
        )}

        {/* Action Buttons */}
        <div className="text-center mt-4 flex flex-col gap-2">
          <button
            onClick={handleJoin}
            disabled={poolEnded || selectedOption === null || isPending || isConfirming || hasJoined}
            className={`retro rbtn-small whitespace-nowrap text-sm w-2/3 text-center ${poolEnded || selectedOption === null || isPending || isConfirming || hasJoined
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

          {/* Resolve button only for owner & not resolved */}
          {isOwner && !pool?.resolved && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Resolve Pool:</p>
              {pool?.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResolve(idx)}
                  disabled={resolvePending || resolveConfirming}
                  className={`px-4 py-2 m-1 whitespace-nowrap  rounded-lg cursor-pointer text-xs font-semibold ${resolvePending || resolveConfirming
                    ? "opacity-50 cursor-not-allowed bg-gray-600"
                    : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                >
                  {resolvePending || resolveConfirming ? "Resolving..." : opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Has Joined Message */}
        {isLoading ? (
          <p className="text-gray-400 text-center mt-2">Checking participation...</p>
        ) : hasJoined ? (
          <p className="text-yellow-400 text-center mt-4 text-xs font-semibold">
            You have already joined this pool.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default PoolModal;
