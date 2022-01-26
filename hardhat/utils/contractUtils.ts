import type {
    UpgradeableMerkleDistributer as DistributerType,
    TestUpgradeableMerkleDistributerV2 as TestDistributerV2Type,
    ERC20 as ERC20Type,
    SimpleToken as SimpleTokenType,
} from "../typechain";
import type {
    SignerWithAddress as SignerWithAddressType
} from "@nomiclabs/hardhat-ethers/signers";
import type { BigNumber as BigNumberType } from "ethers";
import type { MerkleTree as MerkleTreeType } from 'merkletreejs';
import type { RecipientInfoType } from './merkleTreeUtils';

import { ethers, upgrades } from 'hardhat';
import {
    ERC20__factory as ERC20Factory,
    UpgradeableMerkleDistributer__factory as DistributerFactory,
    TestUpgradeableMerkleDistributerV2__factory as TestUpgradeableMerkleDistributerV2Factory,
    SimpleToken__factory as SimpleTokenFactory,
} from '../typechain';
import * as dotenv from "dotenv";
import { createMerkleTree } from "./merkleTreeUtils";

dotenv.config();

const ERC20_CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS;
const DISTRIBUTER_CONTRACT_ADDRESS = process.env.DISTRIBUTER_CONTRACT_ADDRESS;

// Mint to holder contract
async function transferERC20(
    options: {
        amount: number,
        targetAddress: string,
        erc20: ERC20Type,
        owner: SignerWithAddressType,
    },
) {
    const { amount, targetAddress, owner, erc20 } = options;

    const initialMintAmount = await getERC20AmountWithDecimals(
        amount,
        erc20
    );

    const tx = await erc20.connect(owner).transfer(
        targetAddress,
        initialMintAmount
    );
    await tx.wait();
}

async function mintSimpleToken(
    options: {
        amountWithoutDecimals: number,
        erc20: ERC20Type,
        owner: SignerWithAddressType,
    },
) {
    const { amountWithoutDecimals, owner, erc20 } = options;

    const simpleToken = erc20 as SimpleTokenType;
    const initialMintAmount = await getERC20AmountWithDecimals(
        amountWithoutDecimals,
        simpleToken
    );

    const tx = await simpleToken.connect(owner).mint(initialMintAmount);
    await tx.wait();
}

async function getERC20AmountWithDecimals(
    amountWithoutDecimals: number,
    erc20: ERC20Type,
): Promise<BigNumberType> {
    const tokenDecimals = await erc20.decimals();
    return ethers.utils.parseUnits(
        String(amountWithoutDecimals),
        tokenDecimals
    );
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

async function formatERC20Amount(
    amount: BigNumberType,
    erc20: ERC20Type,
): Promise<string> {
    const tokenDecimals = await erc20.decimals();
    return ethers.utils.formatUnits(amount, tokenDecimals);
}

async function initialDeployAndCreateMerkleTree(options: {
    recipientsInfo: RecipientInfoType[],
    erc20?: ERC20Type,
    owner: SignerWithAddressType,
}): Promise<{
    distributer: DistributerType,
    erc20: ERC20Type,
    merkleTree: MerkleTreeType,
}> {
    const { erc20, owner, recipientsInfo } = options;

    let targetERC20: ERC20Type | null = null;
    if (erc20 == null) {
        const simpleToken = await (
            new SimpleTokenFactory(owner).connect(owner).deploy()
        );
        await simpleToken.deployed();
        targetERC20 = simpleToken;
    } else {
        targetERC20 = erc20;
    }

    const tokenDecimals = await targetERC20.decimals();
    let merkleTree = createMerkleTree({
        recipientsInfo,
        tokenDecimals,
    });
    if (merkleTree == null) {
        throw new Error('Merkle Tree cannot be generated');
    }

    const Distributer = new DistributerFactory(owner);
    const distributer = (
        await upgrades.deployProxy(
            Distributer,
            [targetERC20.address, merkleTree.getHexRoot()],
            { initializer: 'initialize' }
        )
    ) as DistributerType;

    await distributer.deployed();

    return { distributer, erc20: targetERC20, merkleTree };
}

async function upgradeToDistributerV2(options: {
    distributer: DistributerType,
    owner: SignerWithAddressType,
}) {
    const { distributer, owner } = options;

    const TestDistributerV2 = new TestUpgradeableMerkleDistributerV2Factory(
        owner
    );
    const testDistributerV2 = (
        await upgrades.upgradeProxy(distributer.address, TestDistributerV2)
    ) as TestDistributerV2Type;
    await testDistributerV2.deployed();

    return testDistributerV2;
}

async function getRelevantContracts() {
    const [owner] = await ethers.getSigners();

    if (
        ERC20_CONTRACT_ADDRESS == null
        || DISTRIBUTER_CONTRACT_ADDRESS == null
    ) {
        throw new Error('Contracts address are not legit');
    }

    const erc20 = (new ERC20Factory(owner)).attach(ERC20_CONTRACT_ADDRESS);
    const distributer = (
        new DistributerFactory(owner)
    ).attach(DISTRIBUTER_CONTRACT_ADDRESS);

    return { erc20, distributer };
}

export {
    ERC20_CONTRACT_ADDRESS,
    DISTRIBUTER_CONTRACT_ADDRESS,
    upgradeToDistributerV2,
    formatERC20Amount,
    getERC20AmountWithDecimals,
    getERC20AmountWithDecimalsLight,
    getRelevantContracts,
    initialDeployAndCreateMerkleTree,
    transferERC20,
    mintSimpleToken,
};