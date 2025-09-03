"use client";
import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import deployments from "../../../onchain-contracts/deployments/CricketPredictionPools.json"

export const cricketContract = {
    address: deployments.address as Address,
    abi: deployments.abi,
};

export function usePools() {
    // get total pool count
    const { data: nextPoolId, isLoading: isLoadingCount } = useReadContract({
        ...cricketContract,
        functionName: "nextPoolId",
    });

    const poolIds = nextPoolId
        ? Array.from({ length: Number(nextPoolId) - 1 }, (_, i) => i + 1)
        : [];

    // fetch pools in one batch using getPool
    const { data, isLoading, error } = useReadContracts({
        contracts: poolIds.map((id) => ({
            ...cricketContract,
            functionName: "getPool",
            args: [BigInt(id)],
        })),
        query: { enabled: poolIds.length > 0 },
    });

    // restructure: map tuple into named fields
    const pools =
        data && poolIds.length > 0
            ? poolIds.map((id, idx) => {
                const poolData = data[idx]?.result;
                if (!poolData) return null;

                return {
                    id,
                    name: poolData[0],
                    description: poolData[1],
                    token: poolData[2],
                    entryFee: poolData[3],
                    startTime: poolData[4],
                    lockTime: poolData[5],
                    platformFeeBps: poolData[6],
                    options: poolData[7],
                    resolved: poolData[8],
                    winnersCount: poolData[9],
                };
            }).filter(Boolean)
            : [];

    return {
        pools,
        nextPoolId,
        isLoading: isLoadingCount || isLoading,
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