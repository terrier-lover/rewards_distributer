import React from 'react';
import { ThirdwebProvider } from "@3rdweb/react";
import { 
  MAINNET_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  MATIC_CHAIN_ID,
  LOCALHOST_CHAIN_ID,   
} from './DefaultSettings';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function ThirdwebProviderWrapper(props: {
    children: React.ReactNode,
}) {
  // Put the ethereum chain ids of the chains you want to support
  const supportedChainIds = [
    MAINNET_CHAIN_ID,
    RINKEBY_CHAIN_ID,
    MATIC_CHAIN_ID,
    LOCALHOST_CHAIN_ID,
  ].filter(notEmpty).map(val => parseInt(val));
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