"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {Copy} from 'lucide-react';
import {toast} from "react-hot-toast";
const PlayersBoard = ({ players }) => {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10; 

  // Make sure component is mounted before running client-only logic
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration-safe sorting + filtering
  const filteredPlayers = useMemo(() => {
    if (!mounted || !players) return players || [];
    const sorted = [...players].sort((a, b) => b.amount - a.amount);
    return sorted.filter((p) =>
      p.user.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, mounted, search]);

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );

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

  return (
    <div className="w-full h-[100vh] flex justify-center bg-gradient-to-b rounded-2xl shadow-2xl p-6 backdrop-blur-lg">
      <div className="w-1/2 flex flex-col">
        <h2 className="text-2xl font-extrabold mb-6 text-center text-purple-700 drop-shadow-md">
          🏆 Players Leaderboard
        </h2>

        {/* Search Bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          placeholder="🔍 Search by address"
          className="mb-4 px-4 py-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
        />

        {/* Table */}
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
                  Reward XP
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers?.map((player, index) => (
                <motion.tr
                  key={player.user}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    index === 0
                      ? "bg-yellow-100 animate-pulse"
                      : index === 1
                      ? "bg-gray-100"
                      : "bg-white"
                  } divide-y divide-gray-200 hover:bg-purple-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-600">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : (currentPage - 1) * playersPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 flex items-center gap-2">
                    {shortenAddress(player.user)}
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard.writeText(player.user);
                        }
                        toast.success("Address Copied!!!")
                      }}
                      className="text-xs cursor-pointer text-blue-500 hover:text-blue-700"
                    >
                     <Copy size={20}/>
                    </button>
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold">
                    {player.targetScore}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            ⬅ Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to shorten address
const shortenAddress = (address: string) => {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default PlayersBoard;
