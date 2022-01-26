import { useWeb3 } from "@3rdweb/hooks";

import FundDistributionCardContractsContainer from "./FundDistributionCardContractsContainer";
import FundDistributionCardLoading from "./FundDistributionCardLoading";

function FundDistributionCardWeb3Container() {
    const { 
        address: currentAddress, 
        provider, 
        chainId: currentChainId 
    } = useWeb3();

    const signer = provider?.getSigner();

    if (currentAddress == null || provider == null || signer == null) {
        return <FundDistributionCardLoading />;
    }

    return (
        <FundDistributionCardContractsContainer
            currentAddress={currentAddress}
            signer={signer}
            // To force re-render, set key with current ChainId 
            key={`card-contracts-container-${currentChainId ?? 0}`}
        />
    );
}

export default FundDistributionCardWeb3Container;