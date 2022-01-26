import React from 'react';
import { ThirdwebProvider } from "@3rdweb/react";

function ThirdwebProviderWrapper(props: {
    children: React.ReactNode,
}) {
  // Put the ethereum chain ids of the chains you want to support
  const supportedChainIds = [
    1, // Ethereum Mainnet
    4, // Ethereum Rinkeby
    137 // polygon
  ];

  /**
   * Include the connectors you want to support
   * injected - MetaMask
   * walletconnect - Wallet Connect
   * walletlink - Coinbase Wallet
   */
  const connectors = {
    injected: {},
    walletconnect: {},
    walletlink: {
      appName: "demo",
      url: "https://thirdweb.com",
      darkMode: false,
    },
  };

  return (
    <ThirdwebProvider 
      connectors={connectors} 
      supportedChainIds={supportedChainIds}
    >
      {props.children}
    </ThirdwebProvider>
  );
}

export default ThirdwebProviderWrapper;