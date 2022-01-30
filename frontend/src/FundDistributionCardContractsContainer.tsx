import type { JsonRpcSigner } from '@ethersproject/providers'

import type { BigNumber as BigNumberType } from "ethers";
import type { SimpleMerkleDistributer as DistributerType } from "./typechain";

import { DEFAULT_RETRY } from './DefaultSettings';
import FundDistributionClaimRewardsButton from "./FundDistributionClaimRewardsButton";
import FundDistributionCard from "./FundDistributionCard";
import { useQueries } from "react-query";
import {
    QUERY_KEY_ERC20_SIMBOL,
    QUERY_KEY_ERC20_DECIMALS,
    QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE,
    getContracts,
    getTargetRecipientsInfo,
    getClaimArgumentsForAddress,
} from './FundDistributionContractsUtils';
import CommonErrorBoundary from './CommonErrorBoundary';
import CommonAlert from './CommonAlert';
import FundDistributionCardLoading from './FundDistributionCardLoading';
import { FundDistributionContextProvider } from './FundDistributionContextProvider';
import FundDistributionCardEmpty from './FundDistributionCardEmpty';
import { ClaimArgumentType } from './MerkleTreeUtils';

function FundDistributionCardContractsContainer({
    currentAddress,
    currentChainId,
    signer
}: {
    currentAddress: string,
    currentChainId: number,
    signer: JsonRpcSigner,
}) {
    const { distribute } = getContracts(signer, currentChainId);

    const getERC20Decimals = distribute.getTokenDecimals();
    const getERC20Simbol = distribute.getTokenSymbol();

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

    const isFirstLoading = firstResults.some(result => result.isLoading);
    const isFirstStale = firstResults.some(result => result.isStale);
    const isFirstError = firstResults.some(result => result.isError);
    const isFirstSuccess = firstResults.every(result => result.isSuccess);
    const tokenSimbol = firstResults[0].data ?? null;
    const tokenDecimals = firstResults[1].data ?? null;

    const targetRecipientsInfo = getTargetRecipientsInfo(currentAddress);
    const claimArguments: ClaimArgumentType[] | null 
        = tokenDecimals == null || targetRecipientsInfo == null
            ? []
            : targetRecipientsInfo.map(
                info => getClaimArgumentsForAddress(info, tokenDecimals)
            );

    const secondQueries = claimArguments.map((claimArgument, index) => {
        const getIsClaimable = getIsClaimableCallback({
            address: currentAddress,
            amountWithDecimals: claimArgument?.amount ?? null,
            uniqueKey: claimArgument?.uniqueKey ?? null,
            hexProof: claimArgument?.hexProof ?? null,
            distribute,
        });
        return {
            queryKey: `${QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE}_${index}`,
            queryFn: () => getIsClaimable,
            retry: DEFAULT_RETRY,
            enabled: claimArguments != null,
        };
    });

    const secondResults = useQueries(secondQueries);
    const isSecondLoading = secondResults.some(result => result.isLoading);
    const isSecondStale = secondResults.some(result => result.isStale);
    const isSecondError = secondResults.some(result => result.isError);
    const isSecondSuccess = secondResults.every(result => result.isSuccess);

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

    const firstClaimableResultIndex = secondResults.findIndex(
        result => result.data != null && result.data[0] === true
    ) ?? null;
    const firstClaimableResult = 
        secondResults[firstClaimableResultIndex]?.data ?? null;
    const isRecipientClaimable = 
        (
            firstClaimableResultIndex == null 
            || firstClaimableResultIndex < 0
            || firstClaimableResult == null
        )
            ? false 
            : firstClaimableResult[0] ?? false;

    const buttonNode = (
        <CommonErrorBoundary>
            <FundDistributionClaimRewardsButton signer={signer} />
        </CommonErrorBoundary>
    );
    const rewardAmountWithoutDecimals = isRecipientClaimable
        ? (targetRecipientsInfo[firstClaimableResultIndex]
            .rewardAmountWithoutDecimals ?? 0)
        : 0;

    return (
        <CommonErrorBoundary>
            <FundDistributionContextProvider
                contextData={{
                    rewardAmountWithoutDecimals,
                    rewardAmountWithDecimals: 
                        claimArguments[firstClaimableResultIndex]?.amount,
                    rewardHexProof: 
                        claimArguments[firstClaimableResultIndex]?.hexProof,
                    rewardUniqueKey:
                        claimArguments[firstClaimableResultIndex]?.uniqueKey,
                    tokenDecimals,
                    tokenSimbol,
                    currentAddress,
                    currentChainId,
                    isRecipientClaimable,
                    firstClaimableResultIndex,
                }}
            >
                <FundDistributionCard buttonNode={buttonNode} />
            </FundDistributionContextProvider>
        </CommonErrorBoundary>
    );
}

function getIsClaimableCallback(options: {
    address: string | null,
    amountWithDecimals: BigNumberType | null,
    uniqueKey: string | null,
    hexProof: string[] | null,
    distribute: DistributerType,
}) {
    const { address, amountWithDecimals, uniqueKey, hexProof, distribute } = options;

    if (
        address == null
        || amountWithDecimals == null
        || hexProof == null
        || uniqueKey == null
    ) {
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
        uniqueKey,
        hexProof,
    );
};

export default FundDistributionCardContractsContainer;