import { useWeb3 } from "@3rdweb/hooks";
import CommonAlert from "./CommonAlert";

import FundDistributionCardContractsContainer from "./FundDistributionCardContractsContainer";
import FundDistributionCardEmpty from "./FundDistributionCardEmpty";

function FundDistributionCardWeb3Container() {
    const {
        address: currentAddress,
        provider,
        chainId: currentChainId,
        error,
    } = useWeb3();
    const signer = provider?.getSigner();

    if (error != null) {
        return (
            <CommonAlert title="Error" description={error.message} />
        );
    }

    if (currentAddress == null || provider == null || signer == null || currentChainId == null) {
        return <FundDistributionCardEmpty />;
    }

    return (
        <FundDistributionCardContractsContainer
            currentChainId={currentChainId}
            currentAddress={currentAddress}
            signer={signer}
            // To force re-render, set key with current ChainId 
            key={`card-contracts-container-${currentChainId}`}
        />
    );
}

export default FundDistributionCardWeb3Container;