// TODO: Find a better way to share library among hardhat and frontend code
import type { RecipientInfoType } from '../frontend/src/MerkleTreeUtils';

import {
    createMerkleTree,
    generateLeaf,
    getClaimArguments
} from '../frontend/src/MerkleTreeUtils';
import {
    ENV_PREFIX_REACT_APP,
    ENV_ERC20_CONTRACT_ADDRESS,
    ENV_DISTRIBUTER_CONTRACT_ADDRESS,
    NETWORK_NAMES,
    CHAIN_IDS,
} from '../frontend/src/CommonVariables';

export {
    RecipientInfoType,
    createMerkleTree,
    generateLeaf,
    getClaimArguments,
    ENV_PREFIX_REACT_APP,
    ENV_ERC20_CONTRACT_ADDRESS,
    ENV_DISTRIBUTER_CONTRACT_ADDRESS,
    NETWORK_NAMES,
    CHAIN_IDS,
};