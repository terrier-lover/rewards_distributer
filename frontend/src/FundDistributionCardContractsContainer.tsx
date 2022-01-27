import type { JsonRpcSigner } from '@ethersproject/providers'

import type { BigNumber as BigNumberType } from "ethers";

import { DEFAULT_RETRY } from './DefaultSettings';
import FundDistributionClaimRewardsButton from "./FundDistributionClaimRewardsButton";
import FundDistributionCard from "./FundDistributionCard";
import { useQueries, useQuery } from "react-query";
import {
    QUERY_KEY_ERC20_SIMBOL,
    QUERY_KEY_ERC20_DECIMALS,
    QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE,
    getContracts,
    getRewardAmountByAddress,
    getClaimArgumentsForAddress,
} from './FundDistributionContractsUtils';
import CommonErrorBoundary from './CommonErrorBoundary';
import CommonAlert from './CommonAlert';
import FundDistributionCardLoading from './FundDistributionCardLoading';
import { FundDistributionContextProvider } from './FundDistributionContextProvider';
import FundDistributionCardEmpty from './FundDistributionCardEmpty';

function FundDistributionCardContractsContainer({
    currentAddress,
    currentChainId,
    signer
}: {
    currentAddress: string,
    currentChainId: number,
    signer: JsonRpcSigner,
}) {
    const { erc20, distribute } = getContracts(signer, currentChainId);

    const getERC20Decimals = erc20.decimals();
    const getERC20Simbol = erc20.symbol();
    const rewardAmountWithoutDecimals
        = getRewardAmountByAddress(currentAddress) ?? 0;

    const firstResults =
        useQueries([
            {
                queryKey: QUERY_KEY_ERC20_SIMBOL,
                queryFn: () => getERC20Simbol,
                retry: DEFAULT_RETRY,
            },
            {
                queryKey: QUERY_KEY_ERC20_DECIMALS,
                queryFn: () => getERC20Decimals,
                retry: DEFAULT_RETRY,
            },
        ]);
    console.log('firstResults', firstResults);
    const isFirstLoading = firstResults.some(result => result.isLoading);
    const isFirstStale = firstResults.some(result => result.isStale);
    const isFirstError = firstResults.some(result => result.isError);
    const isFirstSuccess = firstResults.every(result => result.isSuccess);
    const tokenSimbol = firstResults[0].data ?? null;
    const tokenDecimals = firstResults[1].data ?? null;

    let claimArguments = tokenDecimals == null ? null
        : getClaimArgumentsForAddress(currentAddress, tokenDecimals);

    const getIsClaimableCallback = (
        address: string | null,
        amountWithDecimals: BigNumberType | null,
        hexProof: string[] | null
    ) => {
        if (address == null || amountWithDecimals == null || hexProof == null) {
            const fakeReturn: [boolean, string] = [
                false,
                "Not enough data to query isClaim status"
            ];
            // Hack: This is a fake return to make typescript happy
            return new Promise<[boolean, string]>(
                (resolve) => resolve(fakeReturn)
            );
        }
        return distribute.getIsClaimable(
            address,
            amountWithDecimals,
            hexProof,
        );
    };
    const getIsClaimable = getIsClaimableCallback(
        currentAddress,
        claimArguments?.amount ?? null,
        claimArguments?.hexProof ?? null,
    );
    const {
        isSuccess: isSecondSuccess,
        isError: isSecondError,
        isLoading: isSecondLoading,
        isStale: isSecondStale,
        data: isClaimableInfo,
    } = useQuery(
        QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE,
        () => getIsClaimable,
        {
            enabled: claimArguments != null,
        }
    )

    if (isFirstLoading || isSecondLoading) {
        if (isFirstLoading && isFirstStale) {
            return <FundDistributionCardEmpty />;
        }

        if (isSecondLoading && isSecondStale) {
            return <FundDistributionCardEmpty />;
        }
        
        return <FundDistributionCardLoading />;
    }

    if (
        isFirstError
        || !isFirstSuccess
        || isSecondError
        || !isSecondSuccess
        || tokenSimbol == null
        || tokenDecimals == null
        || claimArguments == null
    ) {
        return (
            <CommonAlert
                title="Error"
                description="Something went wrong. Please visit this page again."
            />
        );
    }

    const isRecipientClaimable = isClaimableInfo == null ? false : isClaimableInfo[0];

    const buttonNode = (
        <CommonErrorBoundary>
            <FundDistributionClaimRewardsButton signer={signer} />
        </CommonErrorBoundary>
    );

    return (
        <CommonErrorBoundary>
            <FundDistributionContextProvider
                contextData={
                    {
                        rewardAmountWithoutDecimals
                            : isRecipientClaimable ? rewardAmountWithoutDecimals : 0,
                        rewardAmountWithDecimals: claimArguments.amount,
                        rewardHexProof: claimArguments.hexProof,
                        tokenDecimals,
                        tokenSimbol,
                        currentAddress,
                        currentChainId,
                        isRecipientClaimable,
                    }
                }
            >
                <FundDistributionCard buttonNode={buttonNode} />
            </FundDistributionContextProvider>
        </CommonErrorBoundary>
    );
}

export default FundDistributionCardContractsContainer;