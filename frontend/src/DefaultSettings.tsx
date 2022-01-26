import { Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons';
import FundDistributionCardList from './FundDistributionCardList';

const CARD_LIST1 = (<FundDistributionCardList key="card-list-1">
  Get rewards by <Link href='https://jpyc.jp/jip.pdf' color="green.500" fontWeight="bold" isExternal>
    providing liquidity <ExternalLinkIcon mx='2px' mb="4px" />
  </Link>
</FundDistributionCardList>);

const CARD_LIST2 = (
  <FundDistributionCardList key="card-list-2">
    Claim your rewards periodically
  </FundDistributionCardList>
);
const CARD_LIST3 = (
  <FundDistributionCardList key="card-list-3">
    Any questions? Please ask <Link href='https://jpyc.jp/#contact' color="green.500" fontWeight="bold" isExternal>
      here <ExternalLinkIcon mx='2px' mb="4px" /></Link>
  </FundDistributionCardList>
);
const CARD_LISTS = [
  CARD_LIST1,
  CARD_LIST2,
  CARD_LIST3
];
const TOKEN_NAME = "JPYC";
const TOKEN_IMAGE_URL = 'https://jpyc.jp/static/media/jpyc.0d1e5d3f.png';

const ERC20_TOKEN_CONTRACT_ADDRESS = 
  "0x1FC43791039741Efe5cC2F03616A548a21d45B06";
const DISTRIBUTE_TOKEN_CONTRACT_ADDRESS = 
  "0xD0c9fa6a214D05f6597d322D0f038C4C09C83B00";
const HOLDER_TOKEN_CONTRACT_ADDRESS =
  "0x2bd08548EdC5Ca89e984ff7Aa9e03616Fe8eDc10";

const DEFAULT_RETRY: boolean | number = false;

export { 
  CARD_LISTS, 
  TOKEN_NAME, 
  TOKEN_IMAGE_URL,
  ERC20_TOKEN_CONTRACT_ADDRESS,
  DISTRIBUTE_TOKEN_CONTRACT_ADDRESS,
  HOLDER_TOKEN_CONTRACT_ADDRESS,
  DEFAULT_RETRY
};