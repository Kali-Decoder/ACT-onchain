"use client";

import PoolComponent from "@/component/PoolComponent";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { useAccount } from "wagmi"; // 👈 Add this

const PageContent = () => {
  const searchParams = useSearchParams();
  const poolId = searchParams.get("poolId");

  // const { getSinglePool, singlePoolDetail } = useDataContext();
  const { isConnected } = useAccount(); // 👈 Add this

  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!poolId || !isConnected) return; // 👈 Don't fetch until wallet connected
  //     try {
  //       setLoading(true);
  //       const data = await getSinglePool(+poolId);
  //       console.log(data, "data");
  //     } catch (error) {
  //       console.error("Failed to fetch pool:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [poolId, isConnected]); 

  if (loading) {
    return <div>Loading Pool...</div>;
  }

  return (
    // <PoolComponent singlePoolDetail={singlePoolDetail} />
    <></>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
