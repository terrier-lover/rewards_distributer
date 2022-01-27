import React from 'react';
import {
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import FundDistributionCardSkelton from './FundDistributionCardSkelton';
import { CARD_LISTS } from './DefaultSettings';
import { useFundDistributionContext } from './FundDistributionContextProvider';

function FundDistributionCard({buttonNode,}: {buttonNode: React.ReactNode,}) {
    const {
        rewardAmountWithoutDecimals, 
        tokenSimbol,
    } = useFundDistributionContext();

    return (
        <FundDistributionCardSkelton
            headlinePillNode={
                <Text
                    fontSize={'sm'}
                    fontWeight={500}
                    bg={useColorModeValue('green.50', 'green.900')}
                    p={2}
                    px={3}
                    color={'green.500'}
                    rounded={'full'}>
                    Rewards
                </Text>
            }
            rewardAmountTextNode={
                <>
                    <Text fontSize={'6xl'} fontWeight={800}>
                        {rewardAmountWithoutDecimals}
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