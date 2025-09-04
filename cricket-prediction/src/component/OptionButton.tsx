import React from "react";
import { useOptionEntryCount } from "@/hooks/useCricketPools";

interface OptionButtonProps {
  idx: number;
  opt: string;
  poolId: number;
  selectedOption: number | null;
  setSelectedOption: (idx: number) => void;
  poolEnded: boolean;
  poolResolved: boolean;
  winningOption: number | null;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  idx,
  opt,
  poolId,
  selectedOption,
  setSelectedOption,
  poolEnded,
  poolResolved,
  winningOption,
}) => {
  const { count, isLoading } = useOptionEntryCount(poolId, idx);

  let btnClass =
    "px-5 py-2 cursor-pointer rounded-xl text-xs font-medium transition-all duration-300";
  
  if (poolResolved && winningOption === idx) {
    btnClass += " bg-green-600 text-white shadow-lg scale-105"; // highlight winning option
  } else if (selectedOption === idx) {
    btnClass += " bg-green-500 text-white shadow-lg scale-105"; // selected option
  } else {
    btnClass += " bg-blue-600 hover:bg-blue-500 text-white";
  }

  return (
    <button
      onClick={() => setSelectedOption(idx)}
      disabled={poolEnded || poolResolved}
      className={btnClass}
    >
      {opt} {isLoading ? "..." : `(${count})`}
    </button>
  );
};

export default OptionButton;
