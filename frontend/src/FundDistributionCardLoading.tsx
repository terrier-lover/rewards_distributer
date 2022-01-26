import { CARD_LISTS } from './DefaultSettings';
import FundDistributionCardSkelton from './FundDistributionCardSkelton';
import { Skeleton } from '@chakra-ui/react'

function FundDistributionCardLoading() {
    return (
        <FundDistributionCardSkelton 
            headlinePillNode={
                <Skeleton 
                    height={'20px'} 
                    width={'81px'} 
                    borderRadius={'16px'} 
                    marginY={'9px'} 
                />
            }
            rewardAmountTextNode={<Skeleton height={'90px'} width={'100px'} />}
            footerTextNode={<Skeleton height={'24px'} width={'195px'} />}
            listDescriptionsNode={CARD_LISTS}
            buttonNode={
                <Skeleton mt={10} height={'40px'} width={'100%'} borderRadius={'16px'} 
            />}
        />
    );
}

export default FundDistributionCardLoading;