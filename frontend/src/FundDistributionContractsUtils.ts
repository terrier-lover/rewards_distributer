import type { JsonRpcSigner } from '@ethersproject/providers'
import type { SimpleMerkleDistributer as DistributerType } from "./typechain";
import type { BigNumber as BigNumberType } from "ethers";
import {
    createMerkleTree,
    getClaimArguments,
    RecipientInfoType
} from './MerkleTreeUtils';
import recipientsInfoJson from './recipientsInfo.json';
import * as ethers from "ethers";
import {
    SimpleMerkleDistributer__factory as DistributerFactory,
} from './typechain';

import { getContractAddress } from './DefaultSettings';

const MUTATION_KEY_DISTRIBUTE_FLOW = 'mutationDistributeFlow';
const QUERY_KEY_ERC20_DECIMALS = 'queryERC20Decimals';
const QUERY_KEY_ERC20_SIMBOL = 'queryERC20Simbol';
const QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE = 'queryDistributeIsRecipientClaimable';
const RECIPIENTS_INFO = recipientsInfoJson as RecipientInfoType[];

function getTargetRecipientsInfo(targetAddress: string) {
    return RECIPIENTS_INFO.filter(
        info => info.address === targetAddress,
    ) ?? [];
}

function getMerkleTree(tokenDecimals: number) {
    return createMerkleTree({ recipientsInfo: RECIPIENTS_INFO, tokenDecimals });
}

function getClaimArgumentsForAddress(
    targetRecipientInfo: RecipientInfoType,
    tokenDecimals: number,
) {
    const merkleTree = getMerkleTree(tokenDecimals);
    return getClaimArguments({
        merkleTree,
        recipientInfo: targetRecipientInfo,
        tokenDecimals
    });
}

function getContracts(
    signer: JsonRpcSigner,
    currentChainId: number,
): {
    distribute: DistributerType,
} {
    const {
        DISTRIBUTER_CONTRACT_ADDRESS,
    } = getContractAddress(currentChainId);

    const distribute = (new DistributerFactory(signer)).attach(
        DISTRIBUTER_CONTRACT_ADDRESS
    );

    return { distribute };
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
    RECIPIENTS_INFO,
    MUTATION_KEY_DISTRIBUTE_FLOW,
    QUERY_KEY_ERC20_DECIMALS,
    QUERY_KEY_ERC20_SIMBOL,
    QUERY_KEY_DISTRIBUTE_IS_RECIPIENT_CLAIMABLE,
    convertToNumberFromBigNumber,
    getContracts,
    getTargetRecipientsInfo,
    getMerkleTree,
    getClaimArgumentsForAddress,
};