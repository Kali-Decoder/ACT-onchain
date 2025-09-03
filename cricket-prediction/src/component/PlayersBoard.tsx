import React from "react";

const PlayersBoard = ({ players }) => {
  if (!players || players.length === 0) {
    return (
      <div className="w-1/3 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4 text-center text-black">
          🏆 Players Board
        </h2>
        <p className="text-center text-gray-500 text-sm">No players yet!</p>
      </div>
    );
  }

  return (
    <div className="w-1/3 bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-center text-black">
        🏆 Players Board
      </h2>
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Bet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Prediction
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                  {shortenAddress(player.user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-green-600 font-bold">
                  {(player.amount || 0)} MON
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                  {player.targetScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to shorten address like 0xabc...xyz
const shortenAddress = (address:`0xstring`) => {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default PlayersBoard;
