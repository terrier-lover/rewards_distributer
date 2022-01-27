import type { BigNumber as BigNumberType } from "ethers";
import nullthrows from "nullthrows";

import { ReactNode, createContext, useContext } from "react";

interface FundDistributionContextDataType {
    rewardAmountWithoutDecimals: number;
    rewardAmountWithDecimals: BigNumberType;
    rewardHexProof: string[];
    tokenDecimals: number;
    tokenSimbol: string;
    currentAddress: string;
    currentChainId: number;
    isRecipientClaimable: boolean;
};

const fundDistributionContextDefaultValue
    : FundDistributionContextDataType | null = null;

const FundDistributionContext = createContext<FundDistributionContextDataType | null>(
    fundDistributionContextDefaultValue,
);

function FundDistributionContextProvider({
    children,
    contextData,
}: {
    children: ReactNode,
    contextData: FundDistributionContextDataType,
}) {
    return (
        <FundDistributionContext.Provider value={contextData} >
            {children}
        </FundDistributionContext.Provider>
    );
}

function useFundDistributionContext() {
    const fundDistributionDataNullable = useContext(FundDistributionContext);

    return nullthrows(
        fundDistributionDataNullable,
        "Context should not be used outside context provider",
    );
}

export {
    FundDistributionContextProvider,
    FundDistributionContext,
    useFundDistributionContext,
};
