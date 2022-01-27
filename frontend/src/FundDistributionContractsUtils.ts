import type { JsonRpcSigner } from '@ethersproject/providers'
import type {
    ERC20 as ERC20Type,
    SimpleMerkleDistributer as DistributerType,
} from "./typechain";
import type { BigNumber as BigNumberType } from "ethers";
import { createMerkleTree, getClaimArguments, RecipientInfoType } from './MerkleTreeUtils';

import * as ethers from "ethers";
import {
    SimpleMerkleDistributer__factory as DistributerFactory,
    ERC20__factory as ERC20Factory,
} from './typechain';
import addressAndAmountMapJson from './addressAndAmountMap.json';
import { getContractAddress } from './DefaultSettings';

const MUTATION_KEY_DISTRIBUTE_FLOW = 'mutationDistributeFlow';
const QUERY_KEY_ERC20_DECIMALS = 'queryERC20Decimals';
const QUERY_KEY_ERC20_SIMBOL = 'queryERC20Simbol';
const QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE = 'queryDistributeIsRecipientClaimable';

const ADDRESS_AND_AMOUNT_MAP = addressAndAmountMapJson as { [address: string]: number };

function getRewardAmountByAddress(address: string) {
    const rewardAmount: number | null = ADDRESS_AND_AMOUNT_MAP[address];
    return rewardAmount ?? 0;
}

function getMerkleTree(tokenDecimals: number) {
    const recipientsInfo: RecipientInfoType[] =
        Object.keys(ADDRESS_AND_AMOUNT_MAP).map(address => {
            const rewardAmountWithoutDecimals = ADDRESS_AND_AMOUNT_MAP[address];
            return { address, rewardAmountWithoutDecimals }
        });

    return createMerkleTree({ recipientsInfo, tokenDecimals });
}

function getClaimArgumentsForAddress(address: string, tokenDecimals: number) {
    const rewardAmountWithoutDecimals = getRewardAmountByAddress(address);
    const merkleTree = getMerkleTree(tokenDecimals);
    return getClaimArguments({
        merkleTree,
        recipientInfo: { address, rewardAmountWithoutDecimals },
        tokenDecimals
    });
}

function getContracts(
    signer: JsonRpcSigner,
    currentChainId: number,
): {
    erc20: ERC20Type,
    distribute: DistributerType,
} {
    const {
        ERC20_CONTRACT_ADDRESS,
        DISTRIBUTER_CONTRACT_ADDRESS,
    } = getContractAddress(currentChainId);

    const erc20 = (new ERC20Factory(signer)).attach(ERC20_CONTRACT_ADDRESS);
    const distribute = (new DistributerFactory(signer)).attach(
        DISTRIBUTER_CONTRACT_ADDRESS
    );

    return { erc20, distribute };
}

function convertToNumberFromBigNumber(
    availableRewards: BigNumberType,
    tokenDecimals: number,
) {
    return parseFloat(
        ethers.utils.formatUnits(availableRewards, tokenDecimals)
    );
}

export {
    ADDRESS_AND_AMOUNT_MAP,
    MUTATION_KEY_DISTRIBUTE_FLOW,
    QUERY_KEY_ERC20_DECIMALS,
    QUERY_KEY_ERC20_SIMBOL,
    QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE,
    convertToNumberFromBigNumber,
    getContracts,
    getRewardAmountByAddress,
    getMerkleTree,
    getClaimArgumentsForAddress,
};