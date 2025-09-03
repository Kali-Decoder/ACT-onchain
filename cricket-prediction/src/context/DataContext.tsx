"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/utils/signer";
import { ethers, BigNumber, Contract } from "ethers";
import { toast } from "react-hot-toast";
import { DiceManiaABI, DiceManiaAddress } from "@/constant";
interface DataContextProps {
  totalPools: any;
  userBetsData: any;
  isPoolsLoading: boolean;
  setResultFunction: (poolId: number) => Promise<void>;
  joinPool: (
    _amount: number,
    _targetValue: number,
    _poolId: number
  ) => Promise<void>;
  getSinglePool: (poolId: number) => Promise<any>;
  singlePoolDetail: any;
  diceValue: number;
  finalValue: number | null;
  setFinalValue: React.Dispatch<React.SetStateAction<number | null>>;
  setDiceValue: React.Dispatch<React.SetStateAction<number>>;
  isOwner: boolean;
  createPool: (
    _expireTime: number,
    _players: number,
    _baseAmount: number
  ) => Promise<void>;
  withdrawlContractBalance: () => Promise<void>;
}

interface DataContextProviderProps {
  children: ReactNode;
}

// Context initialization
const DataContext = React.createContext<DataContextProps | undefined>(
  undefined
);

const DataContextProvider: React.FC<DataContextProviderProps> = ({
  children,
}) => {
  const { chain, address } = useAccount();
  const [activeChain, setActiveChainId] = useState<number | undefined>(
    chain?.id
  );
  useEffect(() => {
    setActiveChainId(chain?.id);
  }, [chain?.id]);

  const [totalPools, setTotalPools] = useState<{}>({});
  const [isOwner, setIsOwner] = useState(false);
  const [userBetsData, setUserBetsData] = useState(null);
  const [isPoolsLoading, setIsPoolsLoading] = useState(false);
  const signer = useEthersSigner({ chainId: activeChain });
  const [singlePoolDetail, setSinglePoolDetail] = useState<any>(null);
  const [diceValue, setDiceValue] = useState(1);
  const [finalValue, setFinalValue] = useState<number | null>(null);
  const getContractInstance = async (
    contractAddress: string,
    contractAbi: any
  ): Promise<Contract | undefined> => {
    try {
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      return contractInstance;
    } catch (error) {
      console.log("Error in deploying contract");
      return undefined;
    }
  };

  const createPool = async (
    _expireTime: number,
    _players: number,
    _baseAmount: number
  ) => {
    const id = toast.loading("Creating pool...");
    try {
      const mainContract = await getContractInstance(
        DiceManiaAddress,
        DiceManiaABI
      );
      const tx = await mainContract?.createPool(
        _expireTime,
        _players,
        ethers.utils.parseEther(_baseAmount.toString())
      );
      await tx.wait();
      toast.success("Pool created successfully", { id });
      await getPoolsDetails();
    } catch (error) {
      console.log("Error in creating pool", error);
      toast.error("Error in creating pool", { id });
    }
  };
  const joinPool = async (
    _amount: number,
    _targetValue: number,
    _poolId: number
  ) => {
    let id = toast.loading("Joining pool...");
    try {
      const mainContract = await getContractInstance(
        DiceManiaAddress,
        DiceManiaABI
      );
      const tx = await mainContract?.placeBet(
        ethers.utils.parseEther(_amount.toString()),
        _targetValue,
        _poolId,
        {
          value: ethers.utils.parseEther(_amount.toString()),
        }
      );
      await getSinglePool(_poolId);
      await tx.wait();
      toast.success("Joined pool successfully", { id });
    } catch (error) {
      console.log("Error in joining pool", error);
      toast.error("Error in joining pool", { id });
    }
  };

  const setResultFunction = async (poolId: number) => {
    try {
      const mainContract = await getContractInstance(
        DiceManiaAddress,
        DiceManiaABI
      );
      const result = Math.floor(Math.random() * 6) + 1;
      const tx = await mainContract?.setResult(result, poolId);

      await tx.wait();
      setDiceValue(result);
      setFinalValue(result);
      await getSinglePool(poolId);
      toast.success("Result set successfully");
    } catch (error) {
      console.log(error, "Error in setting result");
      toast.error("Error in setting result");
    }
  };

  const getPoolsDetails = async () => {
    const poolDetails = {
      pool_data: {
        pools: [],
      },
    };
    setIsPoolsLoading(true);
    console.log("getPoolsDetails called");
    try {
      const mainContract = await getContractInstance(
        DiceManiaAddress,
        DiceManiaABI
      );

      if (!mainContract) {
        console.error(
          "❌ mainContract is not available. Probably not connected yet."
        );
        setIsPoolsLoading(false);
        return poolDetails; // return empty safe structure
      }

      const maxPoolId = await mainContract.poolId();
      const userBets = [];

      for (let i = 0; i < +maxPoolId.toString(); i++) {
        const pool = await mainContract.getPoolDetail(i);

        const poolObj = {
          poolId: i,
          totalplayers: +pool[0].toString(),
          baseamount: +pool[1].toString(),
          endtime: +pool[2].toString(),
          result: +pool[3].toString(),
          totalamount: +pool[4].div(BigNumber.from(10).pow(18)).toString(),
          playersLeft: +pool[5].toString(),
          poolEnded: pool[6],
        };

        poolDetails.pool_data.pools.push(poolObj);

        const bets = await mainContract.getBets(i);
        const poolBets = [];
        for (let y = 0; y < bets.length; y++) {
          const betObj = {
            poolId: i,
            user: bets[y].user,
            amount: +bets[y].amount.div(BigNumber.from(10).pow(18)).toString(),
            targetScore: +bets[y].targetScore.toString(),
            claimedAmount: +bets[y].claimedAmount.toString(),
            claimed: bets[y].claimed,
          };
          if (bets[y].user === address) {
            userBets.push(betObj);
          }
          poolBets.push(betObj);
        }

        poolDetails.pool_data.pools[i].bets = poolBets;
      }

      await setUserBetsData(userBets);
      setTotalPools(poolDetails.pool_data.pools);
      setIsPoolsLoading(false);
      return poolDetails;
    } catch (error) {
      console.log(error, "Error in getting pool detail");
      setIsPoolsLoading(false);
      setTotalPools([]);
      setUserBetsData([]);
      return {
        pool_data: {
          pools: [],
        },
      };
    }
  };

  const getSinglePool = async (_poolid: number) => {
    try {
      let pools = totalPools;
      console.log(pools, "ppolss in single");

      if (!pools || !Array.isArray(pools) || pools.length === 0) {
        console.log("Fetching pools because totalPools is empty");
        const poolDetails = await getPoolsDetails();
        pools = poolDetails?.pool_data?.pools || [];
      }

      if (!Array.isArray(pools)) {
        console.error("❌ Pools is not an array", pools);
        return;
      }

      let pool = pools.filter((pool: any) => pool.poolId === _poolid);
      console.log(pool, "pool");

      setSinglePoolDetail(pool);
      return pool || null;
    } catch (error) {
      console.log(error, "Error in getting single pool");
    }
  };

  const checkOwner = async () => {
    try {
      const mainContract = await getContractInstance(
        DiceManiaAddress,
        DiceManiaABI
      );
      const owner = await mainContract?.owner();
      if (owner.toLowerCase() === address?.toLowerCase()) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.log("Error in checking owner", error);
    }
  };

  const withdrawlContractBalance = async ()=>{
    const id = toast.loading("Withdrawing balance...");
    try {
      
      const mainContract = await getContractInstance(
        DiceManiaAddress,
        DiceManiaABI
      );
      const tx = await mainContract?.withdrawfunds();
      await tx.wait();
      toast.success("Withdrew balance successfully", { id });
    } catch (error) {
      console.log("Error in withdrawing balance", error);
      toast.error("Error in withdrawing balance", { id });
    }
  }

  useEffect(() => {
    if (!signer) return;
    getPoolsDetails();
    checkOwner();
  }, [signer, activeChain]);

  return (
    <DataContext.Provider
      value={{
        totalPools,
        userBetsData,
        isPoolsLoading,
        setResultFunction,
        joinPool,
        getSinglePool,
        singlePoolDetail,
        diceValue,
        setDiceValue,
        finalValue,
        setFinalValue,
        isOwner,
        createPool,
        withdrawlContractBalance
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Hook to use DataContext
export const useDataContext = (): DataContextProps => {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataContextProvider");
  }
  return context;
};

export default DataContextProvider;
