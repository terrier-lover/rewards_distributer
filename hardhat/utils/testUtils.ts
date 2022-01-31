import type {
    SimpleMerkleDistributer as DistributerType,
    TestSimpleMerkleDistributerV2 as TestDistributerV2Type,
    ERC20 as ERC20Type,
} from "../typechain";
import type {
    SignerWithAddress as SignerWithAddressType
} from "@nomiclabs/hardhat-ethers/signers";
import type { MerkleTree as MerkleTreeType } from 'merkletreejs';

import {
    getERC20AmountWithDecimals,
    mintSimpleToken,
    transferERC20,
    initialDeployAndCreateMerkleTree,
    getERC20AmountWithDecimalsLight,
} from './contractUtils';
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { COMMON_VARIABLES_AND_FUNCTIONS, RecipientInfoType } from "../settings";

const {
    createMerkleTree,
    getClaimArguments,
} = COMMON_VARIABLES_AND_FUNCTIONS;

type TestScenariosType = {
    shouldFirstClaimRevert: boolean,
    shouldSecondClaimRevert: boolean,
    isFirstGetClaimable: boolean,
    isSecondGetClaimable: boolean,
};
type TestRecipientInfoType = RecipientInfoType & {
    connectAs: SignerWithAddressType,
};

async function testMintSimpleToken(
    options: {
        amountWithoutDecimals: number,
        erc20: ERC20Type,
        owner: SignerWithAddressType,
    },
) {
    const { amountWithoutDecimals, erc20, owner } = options;

    await mintSimpleToken(options);

    const amountWithDecimals = await getERC20AmountWithDecimals(
        amountWithoutDecimals,
        erc20
    );

    expect(await erc20.balanceOf(owner.address)).to.equals(amountWithDecimals);
}

// As a recipient, claim reward
async function testRecipientClaimFlow(
    options: {
        connectAs: SignerWithAddressType,
        recipientInfo: RecipientInfoType,
        recipientExpectedReward?: number,
        distributer: DistributerType,
        shouldBeReverted: boolean,
        merkleTree: MerkleTreeType,
        erc20: ERC20Type,
    },
) {
    const {
        connectAs,
        erc20,
        merkleTree,
        distributer,
        recipientInfo,
        recipientExpectedReward,
    } = options;

    const tokenDecimals = await erc20.decimals();
    const { address, amount, uniqueKey, hexProof } = getClaimArguments({
        merkleTree,
        recipientInfo,
        tokenDecimals
    });
    if (options.shouldBeReverted) {
        // Check error happens and tx is reverted
        await expect(
            distributer.connect(connectAs).claim(address, amount, uniqueKey, hexProof)
        ).to.be.reverted;
    } else {
        // Confirm that claim operation as a recipient is as expected
        await expect(
            distributer.connect(connectAs).claim(address, amount, uniqueKey, hexProof)
        ).to.emit(distributer, 'Claim').withArgs(connectAs.address, amount, uniqueKey);

        // Confirm that recipient balance increases
        const recipientBalanceWithDecimals =
            await erc20.balanceOf(connectAs.address);
        expect(recipientBalanceWithDecimals).to.equal(
            getERC20AmountWithDecimalsLight(
                recipientExpectedReward!,
                tokenDecimals
            ),
        );
    }
}

async function testInitialDeployAndCreateMerkleTree(
    options: {
        distributerAmountWithoutDecimals: number,
        recipientsInfo: RecipientInfoType[],
        blocklistedOperations?: {
            transferERC20ToDistributerContract?: boolean,
        },
    },
): Promise<{
    distributer: DistributerType,
    erc20: ERC20Type,
    merkleTree: MerkleTreeType,
}> {
    const { distributerAmountWithoutDecimals, recipientsInfo, blocklistedOperations } = options;
    const blocklistedTransferERC20ToDistributerContract
        = blocklistedOperations?.transferERC20ToDistributerContract ?? false;

    const [owner] = await ethers.getSigners();
    const {
        distributer,
        erc20,
        merkleTree,
    } = await initialDeployAndCreateMerkleTree({
        owner,
        recipientsInfo,
    });

    await testMintSimpleToken({
        erc20,
        owner,
        amountWithoutDecimals: distributerAmountWithoutDecimals,
    });

    if (!blocklistedTransferERC20ToDistributerContract) {
        await transferERC20({
            amount: distributerAmountWithoutDecimals,
            targetAddress: distributer.address,
            erc20: erc20,
            owner,
        });
    }

    return { distributer, erc20, merkleTree };
}

async function testDistributerV2NewLogic(options: {
    testDistributerV2: TestDistributerV2Type,
}) {
    const { testDistributerV2 } = options;

    const expectedTestValue = 20;
    const tx = await testDistributerV2.setTestValue(expectedTestValue);
    await tx.wait();

    const actualTestValue = await testDistributerV2.getTestValue();
    expect(actualTestValue).to.be.equals(BigNumber.from(expectedTestValue));
}

async function testMainFlow(options: {
    distributerAmountWithoutDecimals: number,
    recipientsInfo: TestRecipientInfoType[],
    pastRecipientsInfo?: TestRecipientInfoType[],
    blocklistedOperations?: {
        transferERC20ToDistributerContract?: boolean,
    },
    testScenarios: TestScenariosType[],
    existingContracts?: {
        distributer: DistributerType,
        erc20: ERC20Type,
        merkleTree?: MerkleTreeType,
    },
}) {
    const {
        distributerAmountWithoutDecimals,
        recipientsInfo,
        pastRecipientsInfo: rawPastRecipientsInfo,
        blocklistedOperations,
        testScenarios,
        existingContracts,
    } = options;

    let distributer: DistributerType | null = null;
    let erc20: ERC20Type | null = null;
    let merkleTree: MerkleTreeType | null = null;
    if (existingContracts == null) {
        const deployedData = await testInitialDeployAndCreateMerkleTree({
            distributerAmountWithoutDecimals,
            recipientsInfo,
            blocklistedOperations,
        });
        distributer = deployedData.distributer;
        erc20 = deployedData.erc20;
        merkleTree = deployedData.merkleTree;
    } else {
        distributer = existingContracts.distributer;
        erc20 = existingContracts.erc20;

        if (existingContracts.merkleTree == null) {
            const tokenDecimals = await erc20.decimals();
            merkleTree = createMerkleTree({
                recipientsInfo,
                tokenDecimals,
            });
            const tx = await distributer.setMerkleRoot(merkleTree.getHexRoot());
            await tx.wait();
        } else {
            merkleTree = existingContracts.merkleTree;
        }
    }

    const pastRecipientsInfo = rawPastRecipientsInfo ?? [];
    const duplicateRecipients = [
        recipientsInfo.map(info => info.address),
        pastRecipientsInfo.map(info => info.address),
    ].reduce((prev, current) => prev.filter(p => current.includes(p)));
    const recipientsExpectedRewards = recipientsInfo.map(recipientInfo => {
        if (duplicateRecipients.includes(recipientInfo.address)) {
            const previousRewardAmount = pastRecipientsInfo.find(
                pastRecipientInfo => pastRecipientInfo.address === recipientInfo.address
            )?.rewardAmountWithoutDecimals ?? 0;
            return recipientInfo.rewardAmountWithoutDecimals + previousRewardAmount;
        }

        return recipientInfo.rewardAmountWithoutDecimals;
    });

    // Run claim first time
    await testIsClaimable({
        erc20,
        merkleTree,
        recipientsInfo,
        distributer,
        scenariosIsClaimable: testScenarios.map(s => s.isFirstGetClaimable),
    });
    const firstClaims = recipientsInfo.map(async (recipientInfo, index) => {
        return await testRecipientClaimFlow({
            connectAs: recipientInfo.connectAs,
            recipientInfo,
            recipientExpectedReward: testScenarios[index].shouldFirstClaimRevert
                ? undefined : recipientsExpectedRewards[index],
            distributer: distributer!,
            shouldBeReverted: testScenarios[index].shouldFirstClaimRevert,
            merkleTree: merkleTree!,
            erc20: erc20!,
        });
    });
    await Promise.all(firstClaims);

    // Run claim second time
    await testIsClaimable({
        erc20,
        merkleTree,
        recipientsInfo,
        distributer,
        scenariosIsClaimable: testScenarios.map(s => s.isSecondGetClaimable),
    });
    const secondClaims = recipientsInfo.map(async (recipientInfo, index) => {
        return await testRecipientClaimFlow({
            connectAs: recipientInfo?.connectAs!,
            recipientInfo,
            recipientExpectedReward: testScenarios[index].shouldSecondClaimRevert
                ? undefined : recipientsExpectedRewards[index],
            distributer: distributer!,
            shouldBeReverted: testScenarios[index].shouldSecondClaimRevert,
            merkleTree: merkleTree!,
            erc20: erc20!,
        });
    });
    await Promise.all(secondClaims);

    return { distributer, merkleTree, erc20 };
}

async function testIsClaimable(options: {
    erc20: ERC20Type,
    merkleTree: MerkleTreeType,
    recipientsInfo: TestRecipientInfoType[],
    distributer: DistributerType,
    scenariosIsClaimable: boolean[],
}) {
    const {
        erc20,
        distributer,
        merkleTree,
        recipientsInfo,
        scenariosIsClaimable
    } = options;

    const tokenDecimals = await erc20.decimals();

    const isClaimable = recipientsInfo.map(async (recipientInfo, index) => {
        const { address, amount, uniqueKey, hexProof } = getClaimArguments({
            merkleTree,
            recipientInfo,
            tokenDecimals
        });
        const [actualIsClaimable, _] =
            await distributer.connect(recipientInfo.connectAs).getIsClaimable(
                address,
                amount,
                uniqueKey,
                hexProof,
            );
        expect(actualIsClaimable).to.equals(scenariosIsClaimable[index]);
    });
    await Promise.all(isClaimable);
}

export {
    testMainFlow,
    testInitialDeployAndCreateMerkleTree,
    testMintSimpleToken,
    testRecipientClaimFlow,
    testDistributerV2NewLogic,
    testIsClaimable,
};