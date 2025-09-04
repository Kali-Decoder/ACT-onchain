import React from "react";
import { motion } from "framer-motion";

const PlayersBoard = ({ players }) => {
  if (!players || players.length === 0) {
    return (
      <div className="w-1/2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-extrabold mb-4 text-center text-white drop-shadow-lg">
          🏆 Players Leaderboard
        </h2>
        <p className="text-center text-white/80 text-sm italic">No players yet!</p>
      </div>
    );
  }
  const sortedPlayers = [...players].sort((a, b) => b.amount - a.amount);

  return (
    <div className="w-full h-[100vh] flex justify-center bg-gradient-to-b rounded-2xl shadow-2xl p-6 backdrop-blur-lg">
      <div className="w-1/2 flex flex-col">
        <h2 className="text-2xl font-extrabold mb-6 text-center text-purple-700 drop-shadow-md">
          🏆 Players Leaderboard
        </h2>
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-purple-300 to-pink-300 text-white">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Total Invested
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Reward XP
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <motion.tr
                  key={player.user}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${index === 0
                      ? "bg-yellow-100 animate-pulse"
                      : index === 1
                        ? "bg-gray-100"
                        : "bg-white"
                    } divide-y divide-gray-200 hover:bg-purple-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-600">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 ">
                    {shortenAddress(player.user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                    <span className="px-2 py-1 bg-green-100 rounded-full">{player.amount} MON</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold">
                    {player.targetScore}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div></div>
    </div>
  );
};

// Helper function to shorten address
const shortenAddress = (address: `0xstring`) => {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default PlayersBoard;
