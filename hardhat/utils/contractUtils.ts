import type {
    SimpleMerkleDistributer as DistributerType,
    TestSimpleMerkleDistributerV2 as TestDistributerV2Type,
    ERC20 as ERC20Type,
    SimpleToken as SimpleTokenType,
} from "../typechain";
import type {
    SignerWithAddress as SignerWithAddressType
} from "@nomiclabs/hardhat-ethers/signers";
import type { BigNumber as BigNumberType } from "ethers";
import type { MerkleTree as MerkleTreeType } from 'merkletreejs';
import type { RecipientInfoType } from '../settings';

import { ethers, upgrades, network } from 'hardhat';
import {
    ERC20__factory as ERC20Factory,
    SimpleMerkleDistributer__factory as DistributerFactory,
    TestSimpleMerkleDistributerV2__factory as TestUpgradeableMerkleDistributerV2Factory,
    SimpleToken__factory as SimpleTokenFactory,
} from '../typechain';
import { ENV } from './../settings';
import { readFile, writeFile } from 'fs';
import { parse, stringify } from 'envfile';
import { promisify } from "util";
import { COMMON_VARIABLES_AND_FUNCTIONS } from "../settings";

const {
    createMerkleTree,
    ENV_ERC20_CONTRACT_ADDRESS,
    ENV_DISTRIBUTER_CONTRACT_ADDRESS,
} = COMMON_VARIABLES_AND_FUNCTIONS;

async function setEnv(
    keyValueMap: { [key: string]: string },
    path: string,
) {
    const envRawData = await promisify(readFile)(path, { encoding: 'utf-8' });
    const envData = parse(envRawData);
    Object.keys(keyValueMap).forEach(key => {
        envData[key] = keyValueMap[key];
    });

    await promisify(writeFile)(path, stringify(envData));
}

async function setRecipientsInfo(
    recipientsInfo: RecipientInfoType[],
    path: string,
) {
    const json = JSON.stringify(recipientsInfo);
    await promisify(writeFile)(path, json);
}

function getContractAddress() {
    const ERC20_CONTRACT_ADDRESS = getERC20ContractAddress();
    const DISTRIBUTER_CONTRACT_ADDRESS
        = ENV[`${network.name.toUpperCase()}_${ENV_DISTRIBUTER_CONTRACT_ADDRESS}`] ?? null;

    return { ERC20_CONTRACT_ADDRESS, DISTRIBUTER_CONTRACT_ADDRESS };
}

function getERC20ContractAddress() {
    const ERC20_CONTRACT_ADDRESS
        = ENV[`${network.name.toUpperCase()}_${ENV_ERC20_CONTRACT_ADDRESS}`] ?? null;
    return ERC20_CONTRACT_ADDRESS;
}

const {
    ERC20_CONTRACT_ADDRESS,
    DISTRIBUTER_CONTRACT_ADDRESS,
} = getContractAddress();

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
    erc20Address?: string | null,
    owner: SignerWithAddressType,
}): Promise<{
    distributer: DistributerType,
    erc20: ERC20Type,
    merkleTree: MerkleTreeType,
}> {
    const { erc20Address, owner, recipientsInfo } = options;

    let targetERC20: ERC20Type | null = null;
    if (erc20Address == null) {
        const simpleToken = await (
            new SimpleTokenFactory(owner).connect(owner).deploy()
        );
        await simpleToken.deployed();
        targetERC20 = simpleToken;
    } else {
        targetERC20 = ERC20Factory.connect(erc20Address, owner);
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
            { initializer: 'initialize(address,bytes32)' }
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

    if (DISTRIBUTER_CONTRACT_ADDRESS == null) {
        throw new Error('Contracts address are not legit');
    }

    const distributer = (
        new DistributerFactory(owner)
    ).attach(DISTRIBUTER_CONTRACT_ADDRESS);
    const erc20Address = await distributer.token();
    const erc20 = (new ERC20Factory(owner)).attach(erc20Address);

    return { erc20, distributer };
}

export {
    ERC20_CONTRACT_ADDRESS,
    DISTRIBUTER_CONTRACT_ADDRESS,
    setEnv,
    setRecipientsInfo,
    upgradeToDistributerV2,
    formatERC20Amount,
    getERC20AmountWithDecimals,
    getERC20AmountWithDecimalsLight,
    getRelevantContracts,
    initialDeployAndCreateMerkleTree,
    transferERC20,
    mintSimpleToken,
    getERC20ContractAddress,
};