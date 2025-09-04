"use client";

import PoolComponent from "@/component/PoolComponent";
import React, { useEffect, useState, Suspense } from "react";
import { usePool } from "@/hooks/useCricketPools";

const PageContent = () => {
 
  const [loading, setLoading] = useState(false);
  const {pool,options} = usePool(1);
  if (loading) {
    return <div>Loading Pool...</div>;
  }

  return (
    <PoolComponent singlePoolDetail={pool} />
  
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
