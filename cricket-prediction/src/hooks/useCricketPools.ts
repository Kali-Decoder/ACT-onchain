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
    const { data: nextPoolId, isLoading: isLoadingCount } = useReadContract({
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
    const { data: optionsData, isLoading: isLoadingOptions } = useReadContracts({
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
            ? poolIds.map((id, idx) => {
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
            }).filter(Boolean)
            : [];

    return {
        pools,
        nextPoolId,
        isLoading: isLoadingCount || isLoadingPools || isLoadingOptions,
        error,
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
    const { data: hash, writeContractAsync } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
    const [isPending, setIsPending] = useState(false);

    async function joinPool(poolId: number, optionIndex: number) {
        try {
            setIsPending(true);
            await writeContractAsync({
                ...cricketContract,
                functionName: "joinPool",
                args: [BigInt(poolId), optionIndex],
            });
        } finally {
            setIsPending(false);
        }
    }

    return {
        joinPool,
        isPending,
        isConfirming,
        isSuccess,
        isError,
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