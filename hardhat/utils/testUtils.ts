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
    grantRole,
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
        ).to.emit(distributer, 'Claim').withArgs(address, amount, uniqueKey);

        // Confirm that recipient balance increases
        const recipientBalanceWithDecimals = await erc20.balanceOf(address);
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
    rolesInfo?: { targetAddress: string, isModerator: boolean }[],
}) {
    const {
        distributerAmountWithoutDecimals,
        recipientsInfo,
        pastRecipientsInfo: rawPastRecipientsInfo,
        blocklistedOperations,
        testScenarios,
        existingContracts,
        rolesInfo
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

    if (rolesInfo != null) {
        distributer;
        const grantRoles = rolesInfo.map(async roleInfo => {
            distributer = distributer!;
            const { isModerator, targetAddress } = roleInfo;
            const role = isModerator
                ? await distributer.MODERATOR_ROLE()
                : await distributer.DEFAULT_ADMIN_ROLE();
            await grantRole({
                role,
                distributer: distributer!,
                targetAddress,
            });
        });
        await Promise.all(grantRoles);
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

async function testSetHasClaimed(options: {
    merkleTree: MerkleTreeType,
    recipientInfo: TestRecipientInfoType,
    distributer: DistributerType,
    tokenDecimals: number,
    connectAs: SignerWithAddressType,
}) {
    const {
        connectAs,
        distributer,
        merkleTree,
        recipientInfo,
        tokenDecimals,
    } = options;

    const { address, uniqueKey } = getClaimArguments({
        merkleTree,
        recipientInfo,
        tokenDecimals
    });

    const setHasClaimed =
        await distributer.connect(connectAs).setHasClaimedPerRecipientAndUniqueKey(
            address,
            uniqueKey,
            true, // newHasClaimed
        );
    await setHasClaimed.wait();
}

async function testAllClaimToken({
    connectAs,
    doesModeratorConnectAs = false,
    recipientInfo,
}: {
    connectAs: SignerWithAddressType,
    doesModeratorConnectAs?: boolean,
    recipientInfo: RecipientInfoType,
}) {
    const distributerAmountWithoutDecimals = 100;
    const {
        distributer,
        erc20,
    } = await testInitialDeployAndCreateMerkleTree({
        distributerAmountWithoutDecimals,
        recipientsInfo: [recipientInfo],
    });

    if (doesModeratorConnectAs != null) {
        const moderatorRole = await distributer.MODERATOR_ROLE();

        await grantRole({
            role: moderatorRole,
            distributer,
            targetAddress: connectAs.address,
        });
    }

    const claimAllDepositsTx = await distributer.connect(connectAs).claimAllDiposits();
    await claimAllDepositsTx.wait();

    const distributerAmountWithDecimals = await getERC20AmountWithDecimals(
        distributerAmountWithoutDecimals,
        erc20
    );
    const currentBalance = await erc20.balanceOf(connectAs.address);
    expect(currentBalance).to.equals(distributerAmountWithDecimals);
}

export {
    testMainFlow,
    testInitialDeployAndCreateMerkleTree,
    testMintSimpleToken,
    testRecipientClaimFlow,
    testDistributerV2NewLogic,
    testIsClaimable,
    testSetHasClaimed,
    testAllClaimToken,
};