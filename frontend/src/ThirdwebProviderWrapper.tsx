import React from 'react';
import { ThirdwebProvider } from "@3rdweb/react";
import { SUPPORTED_CHAIN_IDS_IN_WEB } from './CustomInputs';

function ThirdwebProviderWrapper(props: {
    children: React.ReactNode,
}) {
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
      supportedChainIds={SUPPORTED_CHAIN_IDS_IN_WEB}
    >
      {props.children}
    </ThirdwebProvider>
  );
}

export default ThirdwebProviderWrapper;