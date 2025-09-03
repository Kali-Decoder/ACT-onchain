import { useDataContext } from "@/context/DataContext";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const CreatePoolModal = ({ setShowCreatePoolModal }) => {
  const { createPool } = useDataContext();
  const [expireTime, setExpireTime] = useState("");
  const [playerCount, setPlayerCount] = useState("");
  const [baseAmount, setBaseAmount] = useState("");

  const handleCreatePool = async () => {
    if (!expireTime || !playerCount || !baseAmount) {
      toast.error("Please fill all fields");
      return;
    }
    if (
      isNaN(Number(expireTime)) ||
      isNaN(Number(playerCount)) ||
      isNaN(Number(baseAmount))
    ) {
      toast.error("Please enter valid numbers");
      return;
    }
    if (
      Number(expireTime) <= 0 ||
      Number(playerCount) <= 0 ||
      Number(baseAmount) <= 0
    ) {
      toast.error("Values must be greater than zero");
      return;
    }
    await createPool(
      Number(expireTime),
      Number(playerCount),
      Number(baseAmount)
    );
    setShowCreatePoolModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
        <button
          onClick={() => setShowCreatePoolModal(false)}
          className="absolute top-3 right-4 cursor-pointer text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-bold text-center mb-4">Create Pool</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium">
              Expire Time (in seconds)
            </label>
            <input
              type="number"
              value={expireTime}
              onChange={(e) => setExpireTime(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="e.g., 60"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Number of Players</label>
            <input
              type="number"
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="e.g., 10"
            />
          </div>

          <div>
            <label className="text-xs font-medium">
              Base Amount (in MON or token)
            </label>
            <input
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="e.g., 0.1"
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            className="retro cursor-pointer rbtn-small text-sm"
            onClick={handleCreatePool}
          >
            Create Pool
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolModal;
