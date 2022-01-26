import type { JsonRpcSigner } from '@ethersproject/providers'
import type { BigNumber as BigNumberType } from "ethers";

import { Button, useToast } from '@chakra-ui/react';
import {
    MUTATION_KEY_DISTRIBUTE_FLOW,
    QUERY_KEY_DISTRIBUTE_RECIPIENT_AMOUNT,
    getContracts,
} from './FundDistributionContractsUtils';
import { useMutation, useQueryClient } from 'react-query';
import { useEffect, useState } from 'react';

function FundDistributionClaimRewardsButton(
    { signer, rewardAmount }: { signer: JsonRpcSigner, rewardAmount: number }
) {
    const { holder, distribute } = getContracts(signer);
    const queryClient = useQueryClient();

    useEffect(() => {
        const eventKey = 'LogDistribute';
        const listener = (
            _from: string,
            _recipient: string,
            currentRecipientAmount: BigNumberType
        ) => {
            queryClient.setQueryData(
                QUERY_KEY_DISTRIBUTE_RECIPIENT_AMOUNT,
                currentRecipientAmount,
            );
        };
        distribute.on(eventKey, listener);

        return () => {
            distribute.removeListener(eventKey, listener);
        };
    }, [distribute, queryClient]);

    const toast = useToast();
    const [isTransactionWaiting, setIsTransactionWaiting] = useState(false);

    const {
        isLoading: isMutationLoading,
        mutate,
    } = useMutation(
        () => holder.distributeFlow(),
        {
            mutationKey: MUTATION_KEY_DISTRIBUTE_FLOW,
            onSuccess: (tx) => {
                setIsTransactionWaiting(true);
                Promise.resolve(tx.wait())
                    .then(_tx => {
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
        },
    );

    const isLoading = isMutationLoading || isTransactionWaiting;
    const isDisabled = isLoading || rewardAmount <= 0;

    return (
        <Button
            mt={10}
            w={'full'}
            bg={'green.400'}
            color={'white'}
            rounded={'xl'}
            boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'}
            _hover={{
                bg: 'green.500',
            }}
            _focus={{
                bg: 'green.500',
            }}
            onClick={() => mutate()}
            disabled={isDisabled}
            isLoading={isLoading}
            loadingText={
                isMutationLoading ? "Claiming..." : isTransactionWaiting
                    ? "Waiting for transaction..." : undefined}
        >
            {isDisabled ? "Reward not available" : "Claim Reward"}
        </Button>
    );
}

export default FundDistributionClaimRewardsButton;