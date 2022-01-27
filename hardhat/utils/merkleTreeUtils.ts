// TODO: Find a better way to share library among hardhat and frontend code
import type { RecipientInfoType } from '../../frontend/src/MerkleTreeUtils';
import { 
    createMerkleTree, 
    generateLeaf, 
    getClaimArguments 
} from '../../frontend/src/MerkleTreeUtils';

export { RecipientInfoType, createMerkleTree, generateLeaf, getClaimArguments };