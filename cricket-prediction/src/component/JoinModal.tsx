import { useDataContext } from "@/context/DataContext";
import React, { useState } from "react";
import {toast} from "react-hot-toast";
const JoinModal = ({ setShowJoinModal,pool }) => {
  const [selectedFace, setSelectedFace] = useState(null);
   const { joinPool } = useDataContext();
  
  const handleSelect = (face:number) => {
    setSelectedFace(face);
  };

  const handlePoolJoin = async (poolId:number) => {
    if(!selectedFace) {
        toast.error("Please select a face");
        return;
    }
    if(!pool?.baseamount) {
        toast.error("Base Amount not identified !!!");
        return;
    }
    try {
      await joinPool((pool?.baseamount / 1e18), selectedFace , poolId);
      setShowJoinModal(false);
    } catch (error) {
      console.log("Error in adding to pool", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
        <button
          onClick={() => setShowJoinModal(false)}
          className="absolute top-3 right-4 cursor-pointer text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        <div className="flex gap-2 flex-wrap justify-center mt-6">
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 1
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(1)}
          >
            <div className={`first-face`}>
              <div className="column">
                <span className="pip"></span>
              </div>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 2
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(2)}
          >
            <div className="second-face">
              <span className="pip"></span>
              <span className="pip"></span>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 3
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(3)}
          >
            <div className="third-face">
              <span className="pip"></span>
              <span className="pip"></span>
              <span className="pip"></span>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 4
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(4)}
          >
            <div className="fourth-face">
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
            </div>
          </div>

          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 5
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(5)}
          >
            <div className="fifth-face">
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 6
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(6)}
          >
            <div className="sixth-face">
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            className="retro cursor-pointer rbtn-small text-sm"
            disabled={selectedFace === null}
            onClick={() => handlePoolJoin(pool?.poolId)}
          >
            Submit Prediction
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;
