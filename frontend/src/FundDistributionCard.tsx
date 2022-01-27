import React from 'react';
import { Text } from '@chakra-ui/react';
import FundDistributionCardSkelton from './FundDistributionCardSkelton';
import { CARD_LISTS } from './DefaultSettings';
import { useFundDistributionContext } from './FundDistributionContextProvider';
import FundDistributionCardHeadlinePill from './FundDistributionCardHeadlinePill';

function FundDistributionCard({buttonNode,}: {buttonNode: React.ReactNode,}) {
    const {
        rewardAmountWithoutDecimals, 
        tokenSimbol,
        isRecipientClaimable,
    } = useFundDistributionContext();

    return (
        <FundDistributionCardSkelton
            headlinePillNode={<FundDistributionCardHeadlinePill />}
            rewardAmountTextNode={
                <>
                    <Text fontSize={'6xl'} fontWeight={800}>
                        {isRecipientClaimable ? rewardAmountWithoutDecimals: 0}
                    </Text>
                    <Text fontSize={'3xl'} paddingTop={'16px'}>{tokenSimbol}</Text>
                </>
            }
            listDescriptionsNode={CARD_LISTS}
            buttonNode={buttonNode}
        />
    );
}

export default FundDistributionCard;