import React from 'react';
import {
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import FundDistributionCardSkelton from './FundDistributionCardSkelton';
import { CARD_LISTS } from './DefaultSettings';

function FundDistributionCard({
    rewardAmount,
    tokenSimbol,
    startDateString,
    endDateString,
    buttonNode,
}: {
    rewardAmount: number,
    tokenSimbol: string,
    startDateString: string,
    endDateString: string,
    buttonNode: React.ReactNode,
}) {
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
                        {rewardAmount}
                    </Text>
                    <Text fontSize={'3xl'} paddingTop={'16px'}>{tokenSimbol}</Text>
                </>
            }
            footerTextNode={
                <Text color={'gray.500'}>
                    {startDateString} ~ {endDateString}
                </Text>
            }
            listDescriptionsNode={CARD_LISTS}
            buttonNode={buttonNode}
        />
    );
}

export default FundDistributionCard;