import { Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons';
import FundDistributionCardList from './FundDistributionCardList';
import nullthrows from 'nullthrows';

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

const NETWORK_NAME_MAINNET = "mainnet";
const NETWORK_NAME_MATIC = "matic";
const NETWORK_NAME_RINKEBY = "rinkeby";
const NETWORK_NAME_LOCALHOST = "localhost";

const MAINNET_CHAIN_ID = ENV.REACT_APP_MAINNET_CHAIN_ID!;
const RINKEBY_CHAIN_ID = ENV.REACT_APP_RINKEBY_CHAIN_ID!;
const MATIC_CHAIN_ID = ENV.REACT_APP_MATIC_CHAIN_ID!;
const LOCALHOST_CHAIN_ID = ENV.REACT_APP_LOCALHOST_CHAIN_ID!;

const CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS = {
  [MAINNET_CHAIN_ID]: NETWORK_NAME_MAINNET,
  [RINKEBY_CHAIN_ID]: NETWORK_NAME_RINKEBY,
  [MATIC_CHAIN_ID]: NETWORK_NAME_MATIC,
  [LOCALHOST_CHAIN_ID]: NETWORK_NAME_LOCALHOST,
};

function getContractAddress(currentChainId: number) {
  const networkNameNullable: string | null =
    CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS[currentChainId] ?? null;
  const networkName = nullthrows(
    networkNameNullable, 
    "Network name is not defined properly",
  );

  const ERC20_CONTRACT_ADDRESS
    = ENV[`REACT_APP_${networkName.toUpperCase()}_ERC20_CONTRACT_ADDRESS`]!;
  const DISTRIBUTER_CONTRACT_ADDRESS
    = ENV[`REACT_APP_${networkName.toUpperCase()}_DISTRIBUTER_CONTRACT_ADDRESS`]!;

  return { ERC20_CONTRACT_ADDRESS, DISTRIBUTER_CONTRACT_ADDRESS };
}

const DEFAULT_RETRY: boolean | number = false;

export {
  MAINNET_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  MATIC_CHAIN_ID,
  LOCALHOST_CHAIN_ID, 
  CARD_LISTS,
  TOKEN_NAME,
  TOKEN_IMAGE_URL,
  DEFAULT_RETRY,
  getContractAddress,
};