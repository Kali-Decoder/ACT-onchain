"use client";

import React, { useState } from "react";

const sectors = ["🔔", "💬", "😊", "❤️", "⭐", "💡"];

const SpinnerWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    setSelected(null);

    const randomExtra = Math.floor(Math.random() * 360); // random stop
    const newRotation = rotation + 1800 + randomExtra; // 5 full spins + randomness
    setRotation(newRotation);

    setTimeout(() => {
      const normalized = (newRotation % 360 + 360) % 360;
      const sectorSize = 360 / sectors.length;
      const winningIndex =
        sectors.length - 1 - Math.floor(normalized / sectorSize);

      setSelected(sectors[winningIndex]);
      setSpinning(false);
    }, 4000); // spin duration
  };

  return (
    <div id="wrapper">
      <div id="wheel">
        {/* Inner Wheel rotates */}
        <div
          id="inner-wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s ease-out" : "none",
          }}
        >
          {sectors.map((icon, idx) => {
            const angle = (360 / sectors.length) * idx;
            return (
              <div
                key={idx}
                className="sec"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span>{icon}</span>
              </div>
            );
          })}
        </div>

        {/* Spin Button */}
        <div id="spin" onClick={spin}>
          <div id="inner-spin"></div>
        </div>

        <div id="shine"></div>
      </div>

      {/* Winner Text */}
      <div id="txt">
        {selected && <h2>🎉 You got {selected}!</h2>}
      </div>
    </div>
  );
};

export default SpinnerWheel;
