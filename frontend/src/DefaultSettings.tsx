import { Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons';
import FundDistributionCardList from './FundDistributionCardList';
import nullthrows from 'nullthrows';
import { 
  ENV_PREFIX_REACT_APP,
  NETWORK_NAME_MAINNET,
  NETWORK_NAME_MATIC,
  NETWORK_NAME_RINKEBY,
  NETWORK_NAME_GETH_LOCALHOST,
} from './CommonVariables';

const ENV = process.env;

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

const MAINNET_CHAIN_ID = ENV[`${ENV_PREFIX_REACT_APP}_${NETWORK_NAME_MAINNET.toUpperCase()}_CHAIN_ID`]!;
const RINKEBY_CHAIN_ID = ENV[`${ENV_PREFIX_REACT_APP}_${NETWORK_NAME_RINKEBY.toUpperCase()}_CHAIN_ID`]!;
const MATIC_CHAIN_ID = ENV[`${ENV_PREFIX_REACT_APP}_${NETWORK_NAME_MATIC.toUpperCase()}_CHAIN_ID`]!;
const GETH_LOCALHOST_CHAIN_ID = ENV[`${ENV_PREFIX_REACT_APP}_${NETWORK_NAME_GETH_LOCALHOST.toUpperCase()}_CHAIN_ID`]!;

const CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS = {
  [MAINNET_CHAIN_ID]: NETWORK_NAME_MAINNET,
  [RINKEBY_CHAIN_ID]: NETWORK_NAME_RINKEBY,
  [MATIC_CHAIN_ID]: NETWORK_NAME_MATIC,
  [GETH_LOCALHOST_CHAIN_ID]: NETWORK_NAME_GETH_LOCALHOST,
};

function getContractAddress(currentChainId: number) {
  const networkNameNullable: string | null =
    CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS[currentChainId] ?? null;
  const networkName = nullthrows(
    networkNameNullable, 
    "Network name is not defined properly",
  );

  const DISTRIBUTER_CONTRACT_ADDRESS
    = ENV[`REACT_APP_${networkName.toUpperCase()}_DISTRIBUTER_CONTRACT_ADDRESS`]!;

  return { DISTRIBUTER_CONTRACT_ADDRESS };
}

const DEFAULT_RETRY: boolean | number = false;

export {
  MAINNET_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  MATIC_CHAIN_ID,
  GETH_LOCALHOST_CHAIN_ID, 
  CARD_LISTS,
  TOKEN_NAME,
  TOKEN_IMAGE_URL,
  DEFAULT_RETRY,
  getContractAddress,
};