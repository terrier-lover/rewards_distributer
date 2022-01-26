import type { BigNumber as BigNumberType } from "ethers";
import type { MerkleTree as MerkleTreeType } from 'merkletreejs';
import type {
    SignerWithAddress as SignerWithAddressType
} from "@nomiclabs/hardhat-ethers/signers";

import { MerkleTree } from 'merkletreejs';
import keccak256 from "keccak256";
import { ethers } from 'ethers';
import { getERC20AmountWithDecimalsLight } from './contractUtils';

export type RecipientInfoType = {
    address: string,
    rewardAmountWithoutDecimals: number,
    connectAs: SignerWithAddressType,
};

function generateLeaf(address: string, rewardAmount: BigNumberType): Buffer {
    return Buffer.from(
        ethers.utils.solidityKeccak256(
            ['address', 'uint256'],
            [address, rewardAmount]
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
        ({ address, rewardAmountWithoutDecimals }) => {
            return generateLeaf(
                ethers.utils.getAddress(address),
                getERC20AmountWithDecimalsLight(
                    rewardAmountWithoutDecimals,
                    tokenDecimals,
                ),
            );
        }
    );

    return new MerkleTree(leaves, keccak256, { sortPairs: true });
}

function getClaimArguments(options: {
    merkleTree: MerkleTreeType,
    recipientInfo: RecipientInfoType,
    tokenDecimals: number,
}): {
    address: string,
    amount: BigNumberType,
    hexProof: string[],
} {
    const { merkleTree, recipientInfo, tokenDecimals } = options;
    const { address, rewardAmountWithoutDecimals } = recipientInfo;
    const amount = getERC20AmountWithDecimalsLight(
        rewardAmountWithoutDecimals,
        tokenDecimals
    );
    const recipientLeaf = generateLeaf(
        address,
        amount,
    );
    const hexProof = merkleTree.getHexProof(recipientLeaf);
    return { address, amount, hexProof };
}

export { createMerkleTree, generateLeaf, getClaimArguments };