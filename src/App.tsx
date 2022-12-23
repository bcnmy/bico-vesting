import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { useEffect, useState } from 'react';
import { configureChains, createClient, useAccount, WagmiConfig } from 'wagmi';
import { goerli, mainnet } from 'wagmi/chains';
import { ConnectedApp } from './components/ConnectedApp';
import { DisconectedApp } from './components/DisconnectedApp';
import { Layout } from './components/Layout';
import './styles/design_tokens.css';
import './styles/globals.css';

// Get projectID at https://cloud.walletconnect.com
const WALLET_CONNECT_ID =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_WALLET_CONNECT_ID
    : import.meta.env.VITE_STAGING_WALLET_CONNECT_ID;

if (!WALLET_CONNECT_ID) {
  throw new Error('You need to provide WALLET_CONNECT_ID env variable');
}

const projectId = WALLET_CONNECT_ID;

// Configure wagmi client
const chains = import.meta.env.MODE === 'production' ? [mainnet] : [goerli];
const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  provider,
});

// Configure modal ethereum client
export const ethereumClient = new EthereumClient(wagmiClient, chains);

// Wrap the app with WagmiProvider and add <Web3Modal /> compoennt
export default function App() {
  const { isConnected } = useAccount();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <Layout>
          <WagmiConfig client={wagmiClient}>
            {!isConnected ? <DisconectedApp /> : <ConnectedApp />}
          </WagmiConfig>
        </Layout>
      ) : null}

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
