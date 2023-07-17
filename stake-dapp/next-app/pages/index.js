import { abi, contractAddress } from "@/constans";
import { Web3Button, useWeb3Modal } from "@web3modal/react";
import humanizeDuration from "humanize-duration";
import { parseEther } from "viem";
import { writeContract } from "@wagmi/core";

import { useAccount, useBalance, useContractRead } from "wagmi";

export default function Home() {
  const { address } = useAccount();
  const { data: timeLeft } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "timeLeft",
    watch: true,
  });

  const { data: stakeBalance } = useBalance({
    address: contractAddress,
    watch: true,
  });

  const { data: youStaked } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "balances",
    args: [address],
  });

  const { data: threshold } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "threshold",
  });

  const stake = async () => {
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "stake",
        args: [],
        value: parseEther("0.05"),
      });
    } catch (error) {
      window.alert(error);
    }
  };

  const execute = async () => {
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "execute",
      });
    } catch (error) {
      window.alert(error);
    }
  };

  const withdraw = async () => {
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "withdraw",
      });
    } catch (error) {
      window.alert(error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-16 py-10">
        <p>Stake Here</p>
        <Web3Button />
      </div>
      <div className="mx-auto w-2/3  text-center space-y-4">
        <p className=" font-bold text-lg px-4 py-4 mb-4">{`Staker contracts: ${contractAddress}`}</p>
        <div>
          <div>TimeLeft: </div>
          {timeLeft ? humanizeDuration(timeLeft.toNmber * 1000) : "0"}
        </div>

        <div>
          <div>Total staked: </div>
          {stakeBalance ? stakeBalance.formatted : "0"} /{" "}
          {threshold ? threshold.toString() : "0"}
        </div>

        <div>
          <div>You staked:</div>
          {youStaked ? youStaked.toString() : "0"}
        </div>

        <button
          className="px-4 py-2 rounded-md bg-blue-300 text-white"
          onClick={() => {
            stake();
          }}
        >
          Stake 0.05 eth
        </button>

        <div>
          <button
            className="border border-black px-4 py-2 rounded-lg"
            onClick={() => {
              execute();
            }}
          >
            execute!
          </button>
        </div>

        <div>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              withdraw();
            }}
          >
            withdraw!
          </button>
        </div>
      </div>
    </div>
  );
}
