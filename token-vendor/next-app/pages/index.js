import {
  vendorABI,
  vendorAddress,
  yourTokenABI,
  yourTokenAddress,
} from "@/constants";
import { Web3Button } from "@web3modal/react";
import { Card } from "antd";
import { useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { writeContract } from "@wagmi/core";
const { ethers, parseEther } = require("ethers");

export default function Home() {
  const { address } = useAccount();
  const { data: yourTokenBalance } = useContractRead({
    address: yourTokenAddress,
    abi: yourTokenABI,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const { data: vendorTokenBalance } = useContractRead({
    address: yourTokenAddress,
    abi: yourTokenABI,
    functionName: "balanceOf",
    args: [vendorAddress],
    watch: true,
  });

  const [approveTokens, setApproveTokens] = useState(0);
  const [transferTokens, setTransferTokens] = useState(0);
  const [buyTokens, setBuyTokens] = useState(0);
  const [sellTokens, setSellTokens] = useState(0);

  const approve = async () => {
    const { hash } = await writeContract({
      address: yourTokenAddress,
      abi: yourTokenABI,
      functionName: "approve",
      args: [vendorAddress, approveTokens],
    });
  };

  const buyToken = async () => {
    const { hash } = await writeContract({
      address: vendorAddress,
      abi: vendorABI,
      functionName: "buyTokens",
      args: [],
      value: parseEther((buyTokens * 0.01).toString()),
    });
  };

  const sellToken = async () => {
    const { hash } = await writeContract({
      address: vendorAddress,
      abi: vendorABI,
      functionName: "sellTokens",
      args: [parseEther(sellTokens.toString())],
    });
  };

  const transfer = async () => {
    const { hash } = await writeContract({
      address: yourTokenAddress,
      abi: yourTokenABI,
      functionName: "transfer",
      args: [vendorAddress, transferTokens],
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between px-16 py-8 border-b">
        <p className=" text-blue-600 font-bold text-2xl">YourToken Vendor</p>
        <Web3Button />
      </div>

      <div className="px-16 py-8 flex justify-evenly">
        <Card
          title="Your Token"
          bordered={false}
          style={{ width: 300 }}
          className="text-center"
        >
          <p>
            {yourTokenBalance ? ethers.formatEther(yourTokenBalance) : "0"} ETH
          </p>
          <div className="border-t mt-2 p-2">
            <p>approve</p>
            <input
              className="border p-2 rounded-md mt-2"
              placeholder="Number of approve tokens"
              onChange={(e) => {
                setApproveTokens(e.target.value);
              }}
            ></input>
            <button
              className="bg-blue-300 block px-2 py-1 text-white rounded-md mt-2 mx-auto"
              onClick={() => {
                approve();
              }}
            >
              Approve
            </button>
          </div>
          <div className="border-t mt-2 p-2">
            <p>transfer</p>
            <input
              className="border p-2 rounded-md mt-2"
              placeholder="Number of transfer tokens"
              onChange={(e) => {
                setTransferTokens(e.target.value);
              }}
            ></input>
            <button
              className="bg-blue-300 block px-2 py-1 text-white rounded-md mt-2 mx-auto"
              onClick={() => {
                transfer();
              }}
            >
              Transfer
            </button>
          </div>
        </Card>
        <Card
          title="Buy Token"
          bordered={false}
          style={{ width: 300 }}
          className="text-center"
        >
          <div className="border-b py-2">
            Vendor Token Balance:{" "}
            {vendorTokenBalance ? ethers.formatEther(vendorTokenBalance) : "0"}{" "}
            Tokens
          </div>
          <div className="py-2">
            Amount to buy: {}
            <input
              className="border rounded-md mt-2"
              placeholder="Token amount to buy"
              onChange={(e) => {
                setBuyTokens(e.target.value);
              }}
            ></input>
          </div>
          <button
            className=" bg-blue-400 text-white rounded-md mt-2 px-2 py-1"
            onClick={() => {
              buyToken();
            }}
          >
            Buy Token
          </button>
        </Card>
        <Card
          title="Sell Token"
          bordered={false}
          style={{ width: 300 }}
          className="text-center"
        >
          <div className="border-b py-2">
            Vendor Token Balance:{" "}
            {vendorTokenBalance ? ethers.formatEther(vendorTokenBalance) : "0"}{" "}
            Tokens
          </div>
          <div className="py-2">
            Amount tokens to Sell: {}
            <input
              className="border rounded-md mt-2"
              placeholder="Token amount to sell"
              onChange={(e) => {
                setSellTokens(e.target.value);
              }}
            ></input>
          </div>
          <button
            className=" bg-blue-400 text-white rounded-md px-2 py-1 mt-2"
            onClick={() => {
              sellToken();
            }}
          >
            Sell Token
          </button>
        </Card>
      </div>
    </div>
  );
}
