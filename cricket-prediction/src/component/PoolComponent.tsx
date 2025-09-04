"use client";
import PlayersBoard from "./PlayersBoard";

const dummyPlayers = [
  {
    user: "0x3ce0123456789AbCDEF0123456789abcdef01234",
    amount: 100,
    targetScore: 250
  },
  {
    user: "0x9ab0123456789AbCDEF0123456789abcdef01234",
    amount: 50,
    targetScore: 200
  },
  {
    user: "0x5ef0123456789AbCDEF0123456789abcdef01234",
    amount: 75,
    targetScore: 180
  },
  {
    user: "0x7cd0123456789AbCDEF0123456789abcdef01234",
    amount: 120,
    targetScore: 300
  }
];
const PoolComponent = ({ singlePoolDetail }) => {
 

  return (
    <>
      {singlePoolDetail && singlePoolDetail.length > 0 ? (
        <>
          <div className="flex mt-[10%]">
            <PlayersBoard players={dummyPlayers} />
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default PoolComponent;
