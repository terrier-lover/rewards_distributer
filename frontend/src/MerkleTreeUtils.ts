import type { BigNumber as BigNumberType } from "ethers";
import type { MerkleTree as MerkleTreeType } from 'merkletreejs';

import { MerkleTree } from 'merkletreejs';
import keccak256 from "keccak256";
import { ethers } from 'ethers';

// Hack: To make typescript happy
global.Buffer = require('buffer').Buffer;

export type RecipientInfoType = {
    address: string,
    rewardAmountWithoutDecimals: number,
    uniqueKey: string,
};

export type ClaimArgumentType = {
    address: string,
    amount: BigNumberType,
    uniqueKey: string,
    hexProof: string[],
};

function generateLeaf(
    address: string, 
    rewardAmount: BigNumberType,
    uniqueKey: string,
): Buffer {
    return Buffer.from(
        ethers.utils.solidityKeccak256(
            ['address', 'uint256', 'string'],
            [address, rewardAmount, uniqueKey]
        ).slice(2),
        'hex',
    );
}

function createMerkleTree(options: {
    recipientsInfo: RecipientInfoType[],
    tokenDecimals: number,
}) {
    const { recipientsInfo, tokenDecimals } = options;
    const leaves = recipientsInfo.map(
        ({ address, rewardAmountWithoutDecimals, uniqueKey }) => {
            return generateLeaf(
                ethers.utils.getAddress(address),
                getERC20AmountWithDecimalsLight(
                    rewardAmountWithoutDecimals,
                    tokenDecimals,
                ),
                uniqueKey,
            );
        }
    );

    return new MerkleTree(leaves, keccak256, { sortPairs: true });
}

function getClaimArguments(options: {
    merkleTree: MerkleTreeType,
    recipientInfo: RecipientInfoType,
    tokenDecimals: number,
}): ClaimArgumentType {
    const { merkleTree, recipientInfo, tokenDecimals } = options;
    const { address, rewardAmountWithoutDecimals, uniqueKey } = recipientInfo;
    const amount = getERC20AmountWithDecimalsLight(
        rewardAmountWithoutDecimals,
        tokenDecimals
    );
    const recipientLeaf = generateLeaf(
        address,
        amount,
        uniqueKey,
    );
    const hexProof = merkleTree.getHexProof(recipientLeaf);
    return { address, amount, uniqueKey, hexProof };
}

function getERC20AmountWithDecimalsLight(
    amountWithoutDecimals: number,
    tokenDecimals: number,
): BigNumberType {
    return ethers.utils.parseUnits(
        String(amountWithoutDecimals),
        tokenDecimals
    );
}

export { createMerkleTree, generateLeaf, getClaimArguments };