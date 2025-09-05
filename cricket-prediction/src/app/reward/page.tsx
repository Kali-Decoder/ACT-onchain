"use client";
import PlayersBoard from "@/component/PlayersBoard";
import SpinnerWheel from "@/component/RewardSpinner";

import React, { Suspense } from "react";

const Page = () => {
 
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <div className="flex justify-center items-center mt-[10%]">
      <SpinnerWheel/>
      </div>
    </Suspense>
  );
};

export default Page;
