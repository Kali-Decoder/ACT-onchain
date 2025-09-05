"use client";
import PlayersBoard from "@/component/PlayersBoard";
import { useLeaderboard } from "@/hooks/apiHooks";
import React, { Suspense } from "react";

const Page = () => {
  const { data: leaderboard, isLoading, error } = useLeaderboard();

  if (isLoading) return <p className="mt-[10%]">Loading leaderboard...</p>;
  if (error) return <p className="mt-[10%]">Error loading leaderboard</p>;
  if(leaderboard.length==0) return <p className="mt-[10%]">No Data Avaialable </p>;
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <div className="flex mt-[10%]">
        <PlayersBoard players={leaderboard} />
      </div>
    </Suspense>
  );
};

export default Page;
