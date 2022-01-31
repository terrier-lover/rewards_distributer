import { Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons';
import FundDistributionCardList from './FundDistributionCardList';
import nullthrows from 'nullthrows';
import {
  ENV_PREFIX_REACT_APP,
} from './CommonVariables';
import { CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS } from './CustomInputs';

const ENV = process.env;

const DEFAULT_RETRY: boolean | number = false;

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

function getContractAddress(currentChainId: number) {
  const networkNameNullable: string | null =
    CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS[currentChainId] ?? null;
  const networkName = nullthrows(
    networkNameNullable,
    "Network name is not defined properly",
  );

  const DISTRIBUTER_CONTRACT_ADDRESS
    = ENV[`${ENV_PREFIX_REACT_APP}_${networkName.toUpperCase()}_DISTRIBUTER_CONTRACT_ADDRESS`]!;

  return { DISTRIBUTER_CONTRACT_ADDRESS };
}

export {
  CARD_LISTS,
  DEFAULT_RETRY,
  getContractAddress,
};