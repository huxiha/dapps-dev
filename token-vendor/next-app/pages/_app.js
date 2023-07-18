import "@/styles/globals.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";

export default function App({ Component, pageProps }) {
  const chains = [sepolia];
  const projectId = "bcbee6f02623b6aff22b03a7ef8d5075";
  const { publicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ chains, projectId }),
    publicClient,
  });

  const ethereumClient = new EthereumClient(wagmiConfig, chains);
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Component {...pageProps} />
      </WagmiConfig>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
      ></Web3Modal>
    </>
  );
}
