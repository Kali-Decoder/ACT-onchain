"use client";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { Address, parseEther, zeroAddress } from "viem";
import deployments from "../../../onchain-contracts/deployments/CricketPredictionPools.json"
import { useState } from "react";

export const cricketContract = {
    address: deployments.address as Address,
    abi: deployments.abi,
};
export function usePools() {
  // 1. get total pool count
  const { data: nextPoolId, isLoading: isLoadingCount, refetch: refetchCount } = useReadContract({
    ...cricketContract,
    functionName: "nextPoolId",
  });

  const poolIds = nextPoolId
    ? Array.from({ length: Number(nextPoolId) - 1 }, (_, i) => i + 1)
    : [];

  // 2. fetch pools from mapping pools(i)
  const {
    data: poolsData,
    isLoading: isLoadingPools,
    error,
    refetch: refetchPoolsData,
  } = useReadContracts({
    contracts: poolIds.map((id) => ({
      ...cricketContract,
      functionName: "pools",
      args: [BigInt(id)],
    })),
    query: {
      enabled: poolIds.length > 0,
      staleTime: 30_000, // 30s caching
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  // 3. fetch options for each pool
  const { data: optionsData, isLoading: isLoadingOptions, refetch: refetchOptionsData } = useReadContracts({
    contracts: poolIds.map((id) => ({
      ...cricketContract,
      functionName: "getOptions",
      args: [BigInt(id)],
    })),
    query: {
      enabled: poolIds.length > 0,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  // 4. restructure pool info
  const pools =
    poolsData && optionsData
      ? poolIds
          .map((id, idx) => {
            const poolData = poolsData[idx]?.result;
            const poolOptions = optionsData[idx]?.result || [];

            if (!poolData) return null;

            return {
              id,
              startTime: Number(poolData[0]),
              lockTime: Number(poolData[1]),
              resolved: poolData[2],
              canceled: poolData[3],
              token: poolData[4],
              entryFee: poolData[5],
              platformFeeBps: poolData[6],
              totalPot: poolData[7],
              platformFee: poolData[8],
              netPot: poolData[9],
              name: poolData[10],
              desc: poolData[11],
              options: poolOptions,
              winningOption: poolData[12],
              totalEntries: poolData[13],
              winnersCount: poolData[14],
            };
          })
          .filter(Boolean)
      : [];

  // 5. Combine refetch functions
  const refetchPools = async () => {
    await refetchCount();
    await refetchPoolsData();
    await refetchOptionsData();
  };

  return {
    pools,
    nextPoolId,
    isLoading: isLoadingCount || isLoadingPools || isLoadingOptions,
    error,
    refetchPools,
  };
}



export function usePool(poolId?: number) {
    const { data: pool } = useReadContract({
        ...cricketContract,
        functionName: "pools",
        args: poolId ? [BigInt(poolId)] : undefined,
        query: { enabled: !!poolId },
    });

    const { data: options } = useReadContract({
        ...cricketContract,
        functionName: "getOptions",
        args: poolId ? [BigInt(poolId)] : undefined,
        query: { enabled: !!poolId },
    });

    return { pool, options };
}


export function useIsOwner() {
    const { address } = useAccount();

    // Read owner from contract
    const { data: owner, isLoading } = useReadContract({
        ...cricketContract,
        functionName: "owner",
    });

    const isOwner =
        !!address &&
        !!owner &&
        address.toLowerCase() === (owner as string).toLowerCase();

    return { isOwner, owner, isLoading };
}

export function useHasJoined(poolId: number) {
    const { address } = useAccount();

    const { data: joined, isLoading } = useReadContract({
        ...cricketContract,
        functionName: "hasJoined",
        args: [poolId, address],
    });

    const hasJoined = !!joined;

    return { hasJoined, isLoading };
}


export function useCreatePool() {
    const {
        data: hash,
        writeContract,
        isPending,
        error,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const createPool = ({
        name,
        description,
        entryFee,
        startTime,
        lockTime,
        maxParticipants,
        options,
    }: {
        name: string;
        description: string;
        entryFee: string; // "0.1"
        startTime: number;
        lockTime: number;
        maxParticipants: number;
        options: string[];
    }) =>
        writeContract({
            ...cricketContract,
            functionName: "createPool",
            args: [
                name,
                description,
                zeroAddress, // native token
                parseEther(entryFee),
                BigInt(startTime),
                BigInt(lockTime),
                BigInt(maxParticipants),
                options,
            ],
        });

    return {
        createPool,
        isPending,
        isConfirming,
        isSuccess,
        hash,
        error,
    };
}


export function useJoinPool() {
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });


    const joinPool = (poolId: number, optionIndex: number, entryFee: number) =>
        writeContract({
            ...cricketContract,
            functionName: "joinPool",
            args: [BigInt(poolId), optionIndex],
            value: entryFee
        });

    return {
        joinPool,
        isPending,
        isConfirming,
        isSuccess,
        hash,
        error,
    };
}


export function useResolvePool() {
    const { data: hash, writeContractAsync } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, isError } =
        useWaitForTransactionReceipt({ hash });

    const [isPending, setIsPending] = useState(false);

    async function resolvePool(poolId: number, winningOption: number) {
        try {
            setIsPending(true);
            await writeContractAsync({
                ...cricketContract,
                functionName: "resolvePool",
                args: [BigInt(poolId), winningOption],
            });
        } finally {
            setIsPending(false);
        }
    }

    return {
        resolvePool,
        isPending,
        isConfirming,
        isSuccess,
        isError,
    };
}


export function useClaim() {
    const { data: hash, writeContractAsync } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, isError } =
        useWaitForTransactionReceipt({ hash });

    const [isPending, setIsPending] = useState(false);

    async function claim(poolId: number) {
        try {
            setIsPending(true);
            await writeContractAsync({
                ...cricketContract,
                functionName: "claim",
                args: [BigInt(poolId)],
            });
        } finally {
            setIsPending(false);
        }
    }

    return {
        claim,
        isPending,
        isConfirming,
        isSuccess,
        isError,
    };
}

export function useCancelPool() {
    const { data: hash, writeContractAsync } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, isError } =
        useWaitForTransactionReceipt({ hash });

    const [isPending, setIsPending] = useState(false);

    async function cancelPool(poolId: number) {
        try {
            setIsPending(true);
            await writeContractAsync({
                ...cricketContract,
                functionName: "cancelPool",
                args: [BigInt(poolId)],
            });
        } finally {
            setIsPending(false);
        }
    }

    return {
        cancelPool,
        isPending,
        isConfirming,
        isSuccess,
        isError,
    };
}

export function usePlayerInfo(poolId: number, player: string) {
    const { data, isLoading, error } = useReadContract({
        ...cricketContract,
        functionName: "playerInfo",
        args: [BigInt(poolId), player],
    });

    // data will return [_hasJoined, _pick, _claimed] from the contract
    const playerData = {
        hasJoined: data ? data[0] : false,
        pick: data ? data[1] : 0,
        claimed: data ? data[2] : false,
    };

    return {
        playerData,
        isLoading,
        error,
    };
}