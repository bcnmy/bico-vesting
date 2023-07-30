import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectedApp } from "./components/ConnectedApp";
import { DisconectedApp } from "./components/DisconnectedApp";
import { Layout } from "./components/Layout";
import "./styles/design_tokens.css";
import "./styles/globals.css";



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
            {!isConnected ? <DisconectedApp /> : <ConnectedApp />}
        </Layout>
      ) : null}
    </>
  );
}
