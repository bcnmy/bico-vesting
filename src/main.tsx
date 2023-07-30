import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { goerli, mainnet } from "wagmi/chains";

// Get projectID at https://cloud.walletconnect.com
const projectId =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_WALLET_CONNECT_ID
    : import.meta.env.VITE_STAGING_WALLET_CONNECT_ID;

if (!projectId) {
  throw new Error("You need to provide WALLET_CONNECT_ID env variable");
}

const chains = [import.meta.env.MODE === "production" ? mainnet : goerli];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <App />
    </WagmiConfig>
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </React.StrictMode>
);
