import type { Dispatch, SetStateAction } from "react";

import type { BigNumber as BigNumberType } from "ethers";
import nullthrows from "nullthrows";

import { ReactNode, createContext, useContext, useState } from "react";

interface FundDistributionContextDataType {
    rewardAmountWithoutDecimals: number;
    rewardAmountWithDecimals: BigNumberType;
    rewardHexProof: string[];
    tokenDecimals: number;
    tokenSimbol: string;
    currentAddress: string;
    currentChainId: number;
    isRecipientClaimable: boolean;
    setIsRecipientClaimable: Dispatch<SetStateAction<boolean>>,
};

const fundDistributionContextDefaultValue
    : FundDistributionContextDataType | null = null;

const FundDistributionContext = createContext<FundDistributionContextDataType | null>(
    fundDistributionContextDefaultValue,
);

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

function FundDistributionContextProvider({
    children,
    contextData,
}: {
    children: ReactNode,
    contextData: Without<
        FundDistributionContextDataType,
        "setIsRecipientClaimable"
    >,
}) {
    const [isRecipientClaimable, setIsRecipientClaimable]
        = useState<boolean>(contextData.isRecipientClaimable);

    return (
        <FundDistributionContext.Provider value={{
            ...contextData,
            isRecipientClaimable,
            setIsRecipientClaimable,
        }}>
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
