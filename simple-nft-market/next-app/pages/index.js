import { abi, contractAddress } from "@/constants";
import { metadatas } from "@/utils/metadatas";
import { Web3Button } from "@web3modal/react";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { readContract, writeContract } from "wagmi/actions";

const items = [
  {
    label: "YourCollectibles",
    key: "collections",
  },
  {
    label: "Transfers",
    key: "transfers",
  },
  {
    label: "IPFS Upload",
    key: "ipfsUpload",
  },
  {
    label: "IPFS Download",
    key: "ipfsDownload",
  },
  {
    label: "Debug Contracts",
    key: "debug",
  },
];

export default function Home() {
  const [current, setCurrent] = useState("collections");
  const [metadataNumber, setMetadataNumber] = useState(0);
  const { address, isConnecting, isDisconnected } = useAccount();
  // nft show list
  const [collections, setCollections] = useState([]);

  const { data: balance } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "balanceOf",
    args: [address],
  });

  const changeMenu = (e) => {
    setCurrent(e.key);
  };

  const mintItem = async () => {
    // upload metadata to IPFS and get the ipfs hash
    const tokenURIMetadata = metadatas[(metadataNumber % 6) + 1];
    const response = await fetch("/api/ipfsUpload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(tokenURIMetadata),
    });
    const data = await response.json();

    // call contracts mintItem to mint a NFT
    // need contract address and abi
    // need current user address and ipfshash
    const { hash } = await writeContract({
      address: contractAddress,
      abi: abi,
      functionName: "mintItem",
      args: [address, data.ipfsHash],
    });

    setMetadataNumber(metadataNumber + 1);
    window.alert("Mint successfully");
  };

  // whenever address or nft balance changes, reload the page
  useEffect(() => {
    const updateCollections = async () => {
      const collectionsUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        // get the tokenURI of the user s nft in tokenIndex
        const tokenId = await readContract({
          address: contractAddress,
          abi: abi,
          functionName: "tokenOfOwnerByIndex",
          args: [address, tokenIndex],
        });
        const tokenURI = await readContract({
          address: contractAddress,
          abi: abi,
          functionName: "tokenURI",
          args: [tokenId],
        });
        const ipfsHash = tokenURI
          .toString()
          .replace("https://ipfs.io/ipfs/", "");
        const response = await fetch("/api/getJsonFromIpfs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ ipfsHash: ipfsHash }),
        });
      }
    };
    updateCollections();
  }, [address, balance]);

  return (
    <main>
      <div className="flex items-center justify-between px-10 py-8">
        <div className=" flex space-x-6 items-center justify-center">
          <p>"🏗 scaffold-eth"</p>
          <p>"🖼 NFT example" </p>
        </div>

        <Web3Button />
      </div>
      <div>
        <Menu
          className="flex items-center justify-center"
          onClick={changeMenu}
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
        />
      </div>
      {current === "collections" && (
        <div className="mt-10">
          <button
            className="block mx-auto border px-6 py-4 text-lg rounded-lg font-bold cursor-pointer hover:border-e-2"
            onClick={(e) => {
              mintItem();
            }}
          >
            Mint NFT
          </button>
          <div>{balance}</div>
        </div>
      )}
    </main>
  );
}
