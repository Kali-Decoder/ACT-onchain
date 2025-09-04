import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useCreatePool, usePools } from "@/hooks/useCricketPools";
const CreatePoolModal = ({ setShowCreatePoolModal }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [startTime, setStartTime] = useState("");
  const [lockTime, setLockTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [options, setOptions] = useState<string[]>([""]);

  const { createPool, isPending, isConfirming, isSuccess } = useCreatePool();
  const { refetchPools } = usePools();
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOptionField = () => setOptions([...options, ""]);
  const removeOptionField = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));

  const handleCreatePool = () => {
    if (!name || !description || !entryFee || !startTime || !lockTime || !maxParticipants) {
      toast.error("Please fill all fields");
      return;
    }
    if (options.length < 2 || options.some((opt) => !opt.trim())) {
      toast.error("Please provide at least two valid options");
      return;
    }

    createPool({
      name,
      description,
      entryFee,
      startTime: Math.floor(new Date(startTime).getTime() / 1000), 
      lockTime: Math.floor(new Date(lockTime).getTime() / 1000),  
      maxParticipants: Number(maxParticipants),
      options,
    });
    refetchPools();
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
          {/* Pool Name */}
          <div>
            <label className="text-xs font-medium">Pool Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 border rounded text-xs"
              placeholder="e.g., Who will score most runs?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-2 border rounded text-xs"
              placeholder="e.g., Athena Cricket Tournament"
            />
          </div>

          {/* Entry Fee */}
          <div>
            <label className="text-xs font-medium">Entry Fee (in MON)</label>
            <input
              type="number"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="w-full mt-1 p-2 border rounded text-xs"
              placeholder="e.g., 0.1"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="text-xs font-medium">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full mt-1 p-2 border rounded text-xs"
            />
          </div>

          {/* Lock Time */}
          <div>
            <label className="text-xs font-medium">Lock Time</label>
            <input
              type="datetime-local"
              value={lockTime}
              onChange={(e) => setLockTime(e.target.value)}
              className="w-full mt-1 p-2 border rounded text-xs"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label className="text-xs font-medium">Max Participants</label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="w-full mt-1 p-2 border rounded text-xs"
              placeholder="e.g., 10"
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-medium">Options</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="w-full p-2 border rounded text-xs"
                  placeholder={`Option ${idx + 1}`}
                />
                {options.length > 1 && (
                  <button
                    onClick={() => removeOptionField(idx)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOptionField}
              className="mt-2 text-blue-500 cursor-pointer text-xs"
            >
              + Add Option
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 text-center">
          <button
            disabled={isPending || isConfirming}
            className="retro cursor-pointer rbtn-small text-sm disabled:opacity-50"
            onClick={handleCreatePool}
          >
            {isPending
              ? "Waiting for wallet..."
              : isConfirming
                ? "Confirming..."
                : isSuccess
                  ? "Created ✅"
                  : "Create Pool"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolModal;
