import type { JsonRpcSigner } from '@ethersproject/providers'
import type { BigNumber as BigNumberType } from "ethers";

import { useToast } from '@chakra-ui/react';
import {
    MUTATION_KEY_DISTRIBUTE_FLOW,
    QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE,
    getContracts,
} from './FundDistributionContractsUtils';
import { useMutation, useQueryClient } from 'react-query';
import { useCallback, useEffect, useState } from 'react';
import { useFundDistributionContext } from './FundDistributionContextProvider';
import FundDistributionButtonCommon from './FundDistributionButtonCommon';

function FundDistributionClaimRewardsButton({
    signer,
}: {
    signer: JsonRpcSigner,
}) {
    const {
        currentAddress,
        currentChainId,
        rewardAmountWithoutDecimals,
        rewardAmountWithDecimals,
        rewardHexProof,
        rewardUniqueKey,
        isRecipientClaimable,
        firstClaimableResultIndex,
    } = useFundDistributionContext();

    const { distribute } = getContracts(signer, currentChainId);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (firstClaimableResultIndex < 0) {
            return;
        }

        const eventKey = 'Claim';
        const listener = (
            _recipient: string,
            _claimedtAmount: BigNumberType,
            _uniqueKey: string,
        ) => {
            queryClient.setQueryData(
                `${QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE}_${firstClaimableResultIndex}`,
                [false, "Claimed"],
            );
        };
        distribute.on(eventKey, listener);

        return () => {
            distribute.removeListener(eventKey, listener);
        };
    }, [distribute, queryClient, firstClaimableResultIndex]);

    const toast = useToast();
    const [isTransactionWaiting, setIsTransactionWaiting] = useState(false);

    const {
        isLoading: isMutationLoading,
        mutate,
    } = useMutation(
        () => distribute.claim(
            currentAddress,
            rewardAmountWithDecimals,
            rewardUniqueKey,
            rewardHexProof,
        ),
        {
            mutationKey: MUTATION_KEY_DISTRIBUTE_FLOW,
            onSuccess: (tx) => {
                setIsTransactionWaiting(true);
                Promise.resolve(tx.wait())
                    .then(_tx => {

                        // TODO: Access QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE_X, and modify it. Hope that it triggers the re-render...
                        toast({
                            title: 'Claimed reward!',
                            description: "Your reward was claimed.",
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                        });
                    }).catch(_error => {
                        toast({
                            title: 'Transaction failed!',
                            description: "Please try again.",
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                        });
                    }).finally(() => {
                        setIsTransactionWaiting(false);
                    });

            },
            onError: (_error) => {
                toast({
                    title: 'Claiming failed!',
                    description: "Please try again.",
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            },
            retry: 0,
        },
    );
    const onClick = useCallback(() => mutate(), [mutate]);

    const isLoading = isMutationLoading || isTransactionWaiting;
    const isDisabled = isLoading
        || rewardAmountWithoutDecimals <= 0
        || !isRecipientClaimable;

    return (
        <FundDistributionButtonCommon
            isDisabled={isDisabled}
            isLoading={isLoading}
            loadingText={isMutationLoading ? "Claiming..." : isTransactionWaiting
                ? "Waiting for transaction..." : undefined}
            onClick={onClick}
        />
    );
}

export default FundDistributionClaimRewardsButton;