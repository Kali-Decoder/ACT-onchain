"use client";
import { useEffect, useRef, useState } from "react";
import PlayersBoard from "./PlayersBoard";
import PoolDetail from "./PoolDetail";
import { useDataContext } from "@/context/DataContext";

const PoolComponent = ({ singlePoolDetail }) => {
  const { diceValue, setDiceValue, finalValue, setFinalValue } =
    useDataContext();

  const diceRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start infinite rolling
  useEffect(() => {
    const resultValue = singlePoolDetail?.[0]?.result;
    console.log("Result Value:", resultValue);
  
    if (resultValue > 0) {
      setFinalValue(resultValue);
      setDiceValue(resultValue);
    } else if (finalValue === null) {
      intervalRef.current = setInterval(() => {
        const randomValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(randomValue);
      }, 150); // adjust speed here
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDiceValue(finalValue); // show final result
    }
  
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [finalValue, singlePoolDetail]);
  
  // Apply dice class for animation
  useEffect(() => {
    const dice = diceRef.current;
    if (!dice) return;
  
    // Remove previous dice show classes
    for (let i = 1; i <= 6; i++) {
      dice.classList.remove(`show-${i}`);
    }
  
    // Add the class corresponding to dice value
    dice.classList.add(`show-${diceValue}`);
  }, [diceValue]);
  return (
    <>
      {singlePoolDetail && singlePoolDetail.length > 0 ? (
        <>
          <div className="flex justify-between items-start w-full p-6 gap-6">
            {/* Left: Pool Details */}
            <PoolDetail singlePoolDetail={singlePoolDetail} />
            {/* Center: Dice Roll */}
            <div className="w-1/3 flex justify-center items-center">
              <div className="game w-24 h-24">
                <div className="container">
                  <div id="dice1" className="dice dice-one" ref={diceRef}>
                    <div id="dice-one-side-one" className="side one">
                      <div className="dot one-1"></div>
                    </div>
                    <div id="dice-one-side-two" className="side two">
                      <div className="dot two-1"></div>
                      <div className="dot two-2"></div>
                    </div>
                    <div id="dice-one-side-three" className="side three">
                      <div className="dot three-1"></div>
                      <div className="dot three-2"></div>
                      <div className="dot three-3"></div>
                    </div>
                    <div id="dice-one-side-four" className="side four">
                      <div className="dot four-1"></div>
                      <div className="dot four-2"></div>
                      <div className="dot four-3"></div>
                      <div className="dot four-4"></div>
                    </div>
                    <div id="dice-one-side-five" className="side five">
                      <div className="dot five-1"></div>
                      <div className="dot five-2"></div>
                      <div className="dot five-3"></div>
                      <div className="dot five-4"></div>
                      <div className="dot five-5"></div>
                    </div>
                    <div id="dice-one-side-six" className="side six">
                      <div className="dot six-1"></div>
                      <div className="dot six-2"></div>
                      <div className="dot six-3"></div>
                      <div className="dot six-4"></div>
                      <div className="dot six-5"></div>
                      <div className="dot six-6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Players Board */}
            <PlayersBoard players={singlePoolDetail?.[0]?.bets || []} />
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default PoolComponent;
