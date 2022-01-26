import type { JsonRpcSigner } from '@ethersproject/providers'

import * as ethers from "ethers";
import { CARD_LISTS, DEFAULT_RETRY } from './DefaultSettings';
import FundDistributionClaimRewardsButton from "./FundDistributionClaimRewardsButton";
import FundDistributionCard from "./FundDistributionCard";
import { useQueries } from "react-query";
import {
    QUERY_KEY_ERC20_DECIMALS,
    QUERY_KEY_ERC20_SIMBOL,
    QUERY_KEY_DISTRIBUTE_RECIPIENT_AMOUNT,
    getContracts,
} from './FundDistributionContractsUtils';
import CommonErrorBoundary from './CommonErrorBoundary';
import { Spinner } from '@chakra-ui/react'
import CommonAlert from './CommonAlert';
import FundDistributionCardLoading from './FundDistributionCardLoading';

function FundDistributionCardContractsContainer({
    currentAddress,
    signer
}: {
    currentAddress: string,
    signer: JsonRpcSigner,
}) {
    const { erc20, distribute } = getContracts(signer);

    const erc20Decimals = erc20.decimals();
    const erc20Simbol = erc20.symbol();
    const recipientAmount = distribute.getRecipientAmount(currentAddress);
    const results =
        useQueries([
            {
                queryKey: QUERY_KEY_ERC20_DECIMALS,
                queryFn: () => erc20Decimals,
                retry: DEFAULT_RETRY,
            },
            {
                queryKey: QUERY_KEY_ERC20_SIMBOL,
                queryFn: () => erc20Simbol,
                retry: DEFAULT_RETRY,
            },
            {
                queryKey: QUERY_KEY_DISTRIBUTE_RECIPIENT_AMOUNT,
                queryFn: () => recipientAmount,
                retry: DEFAULT_RETRY,
            },
        ]);

    const isLoading = results.some(result => result.isLoading);
    const isError = results.some(result => result.isError);
    const isSuccess = results.every(result => result.isSuccess);

    if (isLoading) {
        return <FundDistributionCardLoading />;
    }

    if (isError || !isSuccess) {
        return (
            <CommonAlert
                title="Error"
                description="Something went wrong. Please visit this page again."
            />
        );
    }

    const tokenDecimals = results[0].data ?? null;
    const tokenSimbol = results[1].data ?? null;
    const availableRewards = results[2].data ?? ethers.BigNumber.from(0);

    if (
        tokenDecimals == null 
        || tokenSimbol == null
    ) {
        return (
            <CommonAlert
                title="Error"
                description="Something went wrong. Please visit this page again."
            />
        );
    }

    const rewardAmount = parseFloat(
        ethers.utils.formatUnits(availableRewards, tokenDecimals)
    );

    return (
        <CommonErrorBoundary>
            <FundDistributionCard
                rewardAmount={rewardAmount}
                tokenSimbol={tokenSimbol}
                startDateString="May 4, 2012"
                endDateString="May 3, 2013"
                buttonNode={
                    <CommonErrorBoundary>
                        <FundDistributionClaimRewardsButton
                            signer={signer}
                            rewardAmount={rewardAmount}
                        />
                    </CommonErrorBoundary>
                }
            />
        </CommonErrorBoundary>
    );
}

export default FundDistributionCardContractsContainer;