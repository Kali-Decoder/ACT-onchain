"use client";

import ConnectButton from "@/providers/wallet-connect";
import Link from "next/link";
import React from "react";
import { useAccount, useBalance } from "wagmi";
import CreatePoolModal from "./CreatePoolModal";
import deployments from "../../../onchain-contracts/deployments/CricketPredictionPools.json";
import { useIsOwner } from "@/hooks/useCricketPools";
const Navbar = () => {
  const [showCreatePoolModal, setShowCreatePoolModal] = React.useState(false);
  const { isOwner, isLoading } = useIsOwner();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({
    address: deployments.address,
    watch: true,
  });

  return (
    <>
<nav className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-md fixed w-full z-20 top-0 start-0 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center mb-4 text-2xl font-semibold whitespace-nowrap dark:text-white">
              🏏 Cricket Mania
            </span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {address && isOwner && (
              <>
                <button
                  onClick={() => setShowCreatePoolModal(true)}
                  className="retro rbtn-small text-sm mr-4 mb-10"
                >
                  Create Pool
                </button>

                <button
                  // onClick={async()=>{
                  //   await withdrawlContractBalance();
                  // }}
                  className="retro rbtn-small text-sm mr-4 mb-10"
                >
                 Contract Balance {"💰 " + balanceData?.formatted + balanceData?.symbol}
                </button>
              </>
            )}
            {address && (
              <button className="retro rbtn-small text-sm mr-4 mb-10">
                🟢 {address.slice(0, 6) + "..." + address.slice(-4)}
              </button>
            )}
            {!address && <ConnectButton />}
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          ></div>
        </div>
      </nav>
      {showCreatePoolModal && (
        <CreatePoolModal setShowCreatePoolModal={setShowCreatePoolModal} />
      )}
    </>
  );
};

export default Navbar;
