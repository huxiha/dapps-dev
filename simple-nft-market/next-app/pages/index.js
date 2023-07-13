import { abi, contractAddress } from "@/constants";
import { metadatas } from "@/utils/metadatas";
import { Web3Button } from "@web3modal/react";
import { Menu, List, Card, Avatar, Input, Button } from "antd";
import { useEffect, useState } from "react";
import { useAccount, useContractEvent, useContractRead } from "wagmi";
import { readContract, writeContract } from "wagmi/actions";
import ReactJson from "react-json-view";

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
];
//json example to show
const STARTING_JSON = {
  description: "It's actually a bison?",
  external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
  image: "https://austingriffith.com/images/paintings/buffalo.jpg",
  name: "Buffalo",
  attributes: [
    {
      trait_type: "BackgroundColor",
      value: "green",
    },
    {
      trait_type: "Eyes",
      value: "googly",
    },
  ],
};

export default function Home() {
  const [current, setCurrent] = useState("collections");
  const [metadataNumber, setMetadataNumber] = useState(0);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [transferToAddress, setTransferToAddress] = useState("");

  const [yourJSON, setYourJSON] = useState(STARTING_JSON);
  const [ipfsHash, setIpfsHash] = useState("");
  const [ipfsDownloadHash, setIpfsDownloadHash] = useState("");
  const [ipfsContent, setIpfsContent] = useState("");
  // nft show list
  const [collections, setCollections] = useState([]);
  const [tranferEvents, setTransferEvents] = useState([]);
  let transferEvents_t = [];
  useContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: "Transfer",
    listener(log) {
      transferEvents_t.push(log[0].args);
      setTransferEvents(transferEvents_t);
    },
  });

  console.log(tranferEvents);
  const changeMenu = (e) => {
    setCurrent(e.key);
  };

  const uploadToIpfs = async () => {
    // upload metadata to IPFS and get the ipfs hash
    let number = metadataNumber % 6;
    console.log(`number: ${number}`);
    const tokenURIMetadata = metadatas[number + 1];
    const response = await fetch("/api/ipfsUpload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(tokenURIMetadata),
    });
    const data = await response.json();
    return data.ipfsHash;
  };

  const mintItem = async () => {
    const data = await uploadToIpfs();

    // call contracts mintItem to mint a NFT
    // need contract address and abi
    // need current user address and ipfshash
    const { hash } = await writeContract({
      address: contractAddress,
      abi: abi,
      functionName: "mintItem",
      args: [address, data],
    });
    number++;
    setMetadataNumber(number);

    window.alert("Mint successfully");
  };

  const transfer = async (tokenId) => {
    const { hash } = await writeContract({
      address: contractAddress,
      abi: abi,
      functionName: "safeTransferFrom",
      args: [address, transferToAddress, tokenId],
    });

    window.alert("transfer successfully");
  };

  // whenever address or nft balance changes, reload the page
  useEffect(() => {
    const updateCollections = async () => {
      const collectionsUpdate = [];
      const balance1 = await readContract({
        address: contractAddress,
        abi: abi,
        functionName: "balanceOf",
        args: [address],
      });
      for (let tokenIndex = 0; tokenIndex < balance1; tokenIndex++) {
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
        // just through fetch to get the metadata
        const response = await fetch(tokenURI);
        const metadata = await response.json();
        metadata.owner = address;
        metadata.tokenId = tokenId;
        collectionsUpdate.push(metadata);
      }
      setCollections(collectionsUpdate);
    };
    updateCollections();
  }, [transferEvents_t, address]);

  return (
    <main>
      <div className="flex items-center justify-between px-10 py-8">
        <div className=" flex space-x-6 items-center justify-center">
          <p>"Simple NFT Market example" </p>
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

          <List
            className="mt-8 w-2/3 mx-auto"
            dataSource={collections}
            bordered
            renderItem={(item, index) => {
              return (
                <List.Item key={index}>
                  <Card
                    title={
                      <div>
                        <span style={{ fontSize: 16, marginRight: 8 }}>
                          #{index}
                        </span>{" "}
                        {item.name}
                      </div>
                    }
                  >
                    <div>
                      <img src={item.image} style={{ maxWidth: 150 }} />
                    </div>
                    <div>{item.description}</div>
                  </Card>
                  <div className=" space-y-4">
                    <p>owner: {` ${item.owner}`}</p>
                    <p>tokenId: {` ${item.tokenId}`}</p>
                    <Input
                      placeholder="transfer to"
                      onChange={(e) => {
                        setTransferToAddress(e.target.value);
                      }}
                    />
                    <Button
                      className=" bg-blue-400 text-white"
                      onClick={() => {
                        transfer(item.tokenId);
                      }}
                    >
                      Transfer
                    </Button>
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      )}
      {current === "transfers" && (
        <div>
          <List
            className="mt-8 w-2/3 mx-auto"
            dataSource={tranferEvents}
            bordered
            renderItem={(item, index) => {
              return (
                <List.Item key={index}>
                  <p>{`From address: ${item.from}`}</p>
                  <p>{`From address: ${item.to}`}</p>
                  <p>{`tokenId: ${item.tokenId}`}</p>
                </List.Item>
              );
            }}
          />
        </div>
      )}

      {current === "ipfsUpload" && (
        <div className="mx-auto w-2/3 mt-10">
          <ReactJson
            style={{ padding: 8 }}
            src={yourJSON}
            theme="pop"
            enableClipboard={false}
            onEdit={(edit, a) => {
              setYourJSON(edit.updated_src);
            }}
            onAdd={(add, a) => {
              setYourJSON(add.updated_src);
            }}
            onDelete={(del, a) => {
              setYourJSON(del.updated_src);
            }}
          />
          <Button
            className="mx-auto block mt-8 bg-blue-300 text-white"
            onClick={async (e) => {
              const ipfshash_t = await uploadToIpfs();
              setIpfsHash(ipfshash_t);
            }}
          >
            Upload to IPFS
          </Button>

          <p>{`IPFS Hash: ${ipfsHash}`}</p>
        </div>
      )}
      {current === "ipfsDownload" && (
        <div className="mt-10 w-2/3 mx-auto items-center space-y-4">
          <div className="flex space-x-4 ">
            <Input
              placeholder="IPFS hash"
              onChange={(e) => {
                setIpfsDownloadHash(e.target.value);
              }}
            ></Input>
            <Button
              className="block mx-auto bg-blue-400"
              onClick={async () => {
                const response = await fetch(
                  "https://ipfs.io/ipfs/" + ipfsDownloadHash
                );
                const data = await response.json();
                setIpfsContent(JSON.stringify(data));
              }}
            >
              DownLoad from IPFS
            </Button>
          </div>

          <p>{`Download content`}</p>
          <p>{ipfsContent.toString()}</p>
        </div>
      )}
    </main>
  );
}
