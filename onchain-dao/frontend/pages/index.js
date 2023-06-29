import { useAccount, useBalance, useContractRead } from "wagmi";
import styles from "../styles/Home.module.css";
import { Inter } from "next/font/google";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CryptoDevDAOABI,
  CryptoDevDAOAddress,
  CryptoDevNftABI,
  CryptoDevNftAddress,
} from "@/constants";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  // check if the user's wallet is connected, and is address using wagmi hook
  const { address, isConnected } = useAccount();
  // State variable to know if the component has been mounted yet or not
  const [isMounted, setIsMounted] = useState(false);

  // State variable to show loading state when waiting for a transaction to go through
  const [loading, setLoading] = useState(false);

  // Fake NFT Token ID to purchase. Used when creating a proposal.
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");

  // State variable to store all proposals in the DAO
  const [proposals, setProposals] = useState([]);

  // State variable to switch between the 'Create Proposal' and 'View Proposals' tabs
  const [selectedTab, setSelectedTab] = useState("");

  // Fetch the owner of the DAO
  const daoOwner = useContractRead({
    abi: CryptoDevDAOABI,
    address: CryptoDevDAOAddress,
    functionName: "owner",
  });

  // DAO's balance
  const daoBalance = useBalance({
    address: CryptoDevDAOAddress,
  });

  // user's balance of nft
  const nftBalanceOfUser = useContractRead({
    abi: CryptoDevNftABI,
    address: CryptoDevNftAddress,
    functionName: "balanceOf",
    args: [address],
  });

  // the number of proposals in the dao
  const numOfProposalsInDAO = useContractRead({
    abi: CryptoDevDAOABI,
    address: CryptoDevDAOAddress,
    functionName: "numProposals",
  });

  // Function to make a createProposal transaction in the DAO
  const createProposal = async () => {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: CryptoDevDAOAddress,
        abi: CryptoDevDAOABI,
        functionName: "createProposal",
        args: [fakeNftTokenId],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }

    setLoading(false);
  };

  // Function to fetch a proposal by it's ID
  const fetchProposalById = async (id) => {
    try {
      const proposal = await readContract({
        address: CryptoDevDAOAddress,
        abi: CryptoDevDAOABI,
        functionName: "proposals",
        args: [id],
      });
      const [tokenId, deadline, yayVotes, nayVotes, executed] = proposal;
      const parsedProposal = {
        proposalId: id,
        tokenId: tokenId.toString(),
        deadline: new Date(parseInt(deadline.toString()) * 1000),
        yayVotes: yayVotes.toString(),
        nayVotes: nayVotes.toString(),
        executed: Boolean(executed),
      };

      return parsedProposal;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };

  // Function to fetch all proposals in the DAO
  const fetchAllProposals = async () => {
    try {
      const proposals = [];
      for (let i = 0; i < numOfProposalsInDAO.data; i++) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }
      setProposals(proposals);
      return proposals;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };

  // Function to vote YAY or NAY on a proposal
  const voteForProposal = async (propopsalId, vote) => {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: CryptoDevDAOAddress,
        abi: CryptoDevDAOABI,
        functionName: "voteOnProposal",
        args: [propopsalId, vote === "YAY" ? 1 : 0],
      });
      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  };

  // Function to execute a proposal after deadline has been exceeded
  async function executeProposal(proposalId) {
    setLoading(true);
    try {
      const tx = await writeContract({
        address: CryptoDevDAOAddress,
        abi: CryptoDevDAOABI,
        functionName: "executeProposal",
        args: [proposalId],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  async function withdrawDAOEther() {
    setLoading(true);
    try {
      const tx = await writeContract({
        address: CryptoDevDAOAddress,
        abi: CryptoDevDAOABI,
        functionName: "withdraw",
      });
      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Render the contents of the appropriate tab based on `selectedTab`
  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  // Renders the 'Create Proposal' tab content
  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalanceOfUser.data === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }

  // Renders the 'View Proposals' tab content
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.card}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "YAY")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  // Piece of code that runs everytime the value of `selectedTab` changes
  // Used to re-fetch all proposals in the DAO when user switches
  // to the 'View Proposals' tab
  useEffect(() => {
    if (selectedTab === "View Proposals") {
      fetchAllProposals();
    }
  }, [selectedTab]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected) {
    return (
      <div>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className={inter.className}>
      <Head>
        <title>CyptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <p className={styles.description}>Welcome to the DAO!</p>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalanceOfUser.data.toString()}
            <br />
            {daoBalance.data && (
              <>
                Treasury Balance:{" "}
                {formatEther(daoBalance.data.value).toString()} ETH
              </>
            )}
            <br />
            Total Number of Proposals: {numOfProposalsInDAO.data.toString()}
          </div>
        </div>
        <div className={styles.flex}>
          <button
            className={styles.button}
            onClick={() => setSelectedTab("Create Proposal")}
          >
            Create Proposal
          </button>
          <button
            className={styles.button}
            onClick={() => setSelectedTab("View Proposals")}
          >
            View Proposals
          </button>
        </div>
        {renderTabs()}
        {/* Display additional withdraw button if connected wallet is owner */}

        {address && address.toLowerCase() === daoOwner.data.toLowerCase() ? (
          <div>
            {loading ? (
              <button className={styles.button}>Loading...</button>
            ) : (
              <button className={styles.button} onClick={withdrawDAOEther}>
                Withdraw DAO ETH
              </button>
            )}
          </div>
        ) : (
          ""
        )}
      </div>
      {/* <div>
        <img className={styles.image} src="https://i.imgur.com/buNhbF7.png" />
      </div> */}
    </div>
  );
}
