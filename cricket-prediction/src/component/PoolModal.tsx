import { useHasJoined, useJoinPool, usePools, useResolvePool, usePlayerInfo, useIsOwner, useOptionEntryCounts, useClaim } from "@/hooks/useCricketPools";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import OptionButton from "./OptionButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useBet } from "@/hooks/apiHooks";

const PoolModal = ({ setShowModal, pool, currentUser }) => {
  const { joinPool, isPending, isConfirming, isSuccess, data: joinPoolHash } = useJoinPool();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { hasJoined, isLoading } = useHasJoined(pool.id);
  const { resolvePool, isPending: resolvePending, isConfirming: resolveConfirming } = useResolvePool();
  const { refetchPools } = usePools();
  const { isOwner } = useIsOwner();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { playerData, isLoading: playerLoading } = usePlayerInfo(pool.id, currentUser);
  const { claim, isPending: claimPending, isConfirming: claimConfirming, isSuccess: claimSuccess } = useClaim();
  const { counts: optionCounts } = useOptionEntryCounts(pool.id, pool?.options?.length || 0);
  const betMutation = useBet();

  useEffect(() => {
    if (!pool) return;
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(pool.lockTime - now, 0);
      setTimeLeft(diff);
    };
    updateTimer();
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

  useEffect(() => {
    if (isSuccess && joinPoolHash) {
      betMutation.mutate({
        address: currentUser,
        transactionHash: joinPoolHash,
      });
      refetchPools();
    }
  }, [isSuccess, joinPoolHash, currentUser, betMutation, refetchPools]);

  const handleJoin = () => {
    if (selectedOption === null) return;
    if (hasJoined) {
      toast.success("Already joined!");
      return;
    }
    joinPool(pool.id, selectedOption, pool?.entryFee);
  };

  const handleClaim = (poolId: number) => {
    claim(poolId);
    toast.success("Winnings claimed! 🎉");
    refetchPools();
  };

  const handleResolve = (optionIndex: number) => {
    resolvePool(pool.id, optionIndex);
    refetchPools();
  };

  return (
    <div className="fixed inset-0 z-50 mb-14 bg-black bg-opacity-70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-8 w-full h-full sm:w-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-white text-2xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-base sm:text-xl text-blue-500 font-bold mb-2 sm:mb-4">{pool?.name}</h2>
        <p className="text-xs sm:text-sm font-medium mb-4 sm:mb-6">{pool?.desc}</p>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Side */}
          <div className="space-y-4">
            {/* Pool Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: "Pool ID", value: pool?.id },
                { label: "Entry Fee", value: `${Number(pool?.entryFee) / 1e18} MON` },
                { label: "Start Time", value: new Date(Number(pool?.startTime) * 1000).toLocaleString() },
                { label: "Lock Time", value: poolEnded ? "Ended" : formatTime(timeLeft) },
                { label: "Platform Fee", value: `${pool?.platformFeeBps / 100}%` },
                { label: "Resolved", value: pool?.resolved ? "✅ Yes" : "❌ No" },
                { label: "Total Entries", value: pool?.totalEntries.toString() },
                { label: "Winners Count", value: pool?.winnersCount?.toString() },
                ...(pool?.resolved
                  ? [
                      {
                        label: "Winning Option",
                        value: `${pool?.winningOption}: ${pool?.options?.[pool?.winningOption] || "N/A"}`,
                      },
                    ]
                  : []),
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 p-2 sm:p-3 rounded-lg flex flex-col justify-center items-start"
                >
                  <span className="text-gray-400 text-[10px] sm:text-xs">{item.label}</span>
                  <span className="font-semibold text-white mt-1 text-[11px] sm:text-xs break-words">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Pot Progress Bar */}
            <div className="p-3 bg-gray-800 rounded-xl">
              <h3 className="text-sm font-semibold mb-2">Total Pot</h3>
              <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className="bg-green-500 h-2 sm:h-3"
                  style={{
                    width: `${Math.min((Number(pool?.netPot) / Number(pool?.totalPot)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] sm:text-xs mt-2 text-gray-400">
                Net Pot: {Number(pool?.netPot) / 1e18} MON / Total Pot: {Number(pool?.totalPot) / 1e18} MON
              </p>
            </div>

            {/* Player Info */}
            {!playerLoading && playerData.hasJoined && (
              <div className="p-3 bg-gray-800 rounded-xl space-y-1">
                <h3 className="text-sm font-semibold mb-1">Your Participation:</h3>
                <p className="text-xs text-gray-400">Joined: ✅</p>
                <p className="text-xs text-gray-400">
                  Picked Option: {pool?.options?.[playerData.pick] || playerData.pick}
                </p>
                <p className="text-xs text-gray-400">Claimed: {playerData.claimed ? "✅" : "❌"}</p>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex flex-col justify-between mt-4 lg:mt-0">
            {/* Chart */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold mb-2 text-center">Option Participation Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={pool?.options?.map((opt: string, idx: number) => ({
                    option: opt,
                    entries: optionCounts[idx] || 0,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="option" tick={{ fill: "#aaa", fontSize: 8 }} />
                  <YAxis tick={{ fill: "#aaa", fontSize: 8 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "black", border: "none", fontSize: "10px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="entries" stroke="#10b981" strokeWidth={1} dot={{ r: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Options */}
            {!poolEnded && !pool?.resolved && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Choose Your Option:</h3>
                <div className="flex flex-wrap gap-2">
                  {pool?.options?.map((opt, idx) => (
                    <OptionButton
                      key={idx}
                      idx={idx}
                      opt={opt}
                      poolId={pool.id}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
                      poolEnded={poolEnded}
                      poolResolved={pool?.resolved}
                      winningOption={pool?.winningOption ?? null}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center gap-2">
              {/* Join */}
              <button
                onClick={handleJoin}
                disabled={
                  poolEnded ||
                  selectedOption === null ||
                  isPending ||
                  isConfirming ||
                  hasJoined
                }
                className={`retro rbtn-small whitespace-nowrap text-xs sm:text-sm w-full sm:w-2/3 text-center ${poolEnded ||
                  selectedOption === null ||
                  isPending ||
                  isConfirming ||
                  hasJoined
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

              {/* Resolve (Owner only) */}
              {isOwner && !pool?.resolved && poolEnded && (
                <div className="mt-2 w-full text-center">
                  <p className="text-xs text-gray-400 mb-1">Resolve Pool:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {pool?.options?.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleResolve(idx)}
                        disabled={resolvePending || resolveConfirming}
                        className={`px-3 py-2 text-[11px] sm:text-xs rounded-lg cursor-pointer font-semibold ${resolvePending || resolveConfirming
                          ? "opacity-50 cursor-not-allowed bg-gray-600"
                          : "bg-red-600 hover:bg-red-500 text-white"
                          }`}
                      >
                        {resolvePending || resolveConfirming ? "Resolving..." : opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Claim */}
              {pool?.resolved &&
                playerData?.hasJoined &&
                !playerData?.claimed &&
                playerData?.pick === pool?.winningOption && (
                  <button
                    onClick={() => handleClaim(pool.id)}
                    disabled={claimPending || claimConfirming}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold mt-2 ${claimPending || claimConfirming
                      ? "opacity-50 cursor-not-allowed bg-gray-600"
                      : "bg-green-600 hover:bg-green-500 text-white"
                      }`}
                  >
                    {claimPending || claimConfirming ? "Claiming..." : "Claim Winnings 🎉"}
                  </button>
                )}
            </div>

            {/* Status */}
            {isLoading && (
              <p className="text-gray-400 text-center mt-2 text-xs">Checking participation...</p>
            )}
            {!isLoading && hasJoined && (
              <p className="text-yellow-400 text-center mt-2 text-xs font-semibold">
                You have already joined this pool.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolModal;
