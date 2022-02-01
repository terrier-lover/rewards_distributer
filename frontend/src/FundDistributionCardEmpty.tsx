import { Text } from '@chakra-ui/react';
import FundDistributionCardSkelton from './FundDistributionCardSkelton';
import { CARD_LISTS } from './DefaultSettings';
import FundDistributionCardHeadlinePill from './FundDistributionCardHeadlinePill';
import FundDistributionButtonCommon from './FundDistributionButtonCommon';

function FundDistributionCardEmpty() {
    return (
        <FundDistributionCardSkelton
            headlinePillNode={<FundDistributionCardHeadlinePill />}
            rewardAmountTextNode={
                <Text fontSize={'4xl'} color={'grey'}>Not available</Text>
            }
            listDescriptionsNode={CARD_LISTS}
            buttonNode={<FundDistributionButtonCommon isDisabled={true} />}
        />
    );
}

export default FundDistributionCardEmpty;