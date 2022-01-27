import type {
  SimpleMerkleDistributer as DistributerType,
} from "../typechain";

import { ethers } from "hardhat";
import { upgradeToDistributerV2 } from "../utils/contractUtils";
import {
  testInitialDeployAndCreateMerkleTree,
  testMainFlow,
  testDistributerV2NewLogic,
  testIsClaimable
} from "../utils/testUtils";

describe("Distribution test using SimpleMerkleDistributer contract", () => {
  const distributerAmountWithoutDecimals = 10000;
  const recipientRewardAmount = 100;

  it(
    "Correct flow - one recipient claims reward",
    async () => {
      const [_, recipient] = await ethers.getSigners();

      // User claims their reward. Should succeed.
      const recipientsInfoAndTestScenarios = [
        {
          recipientInfo: {
            address: recipient.address,
            rewardAmountWithoutDecimals: recipientRewardAmount,
            connectAs: recipient,
          },
          testScenario: {
            shouldFirstClaimRevert: false,
            shouldSecondClaimRevert: true,
            isFirstGetClaimable: true,
            isSecondGetClaimable: false,
          },
        },
      ];
      await testMainFlow({
        distributerAmountWithoutDecimals,
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
        testScenarios: recipientsInfoAndTestScenarios.map(el => el.testScenario),
      });
    }
  );

  it(
    "Correct flow - multiple recipients claim rewards",
    async () => {
      const [_, recipient1, recipient2, recipient3] = await ethers.getSigners();

      const commonSuccessTestScenario = {
        shouldFirstClaimRevert: false,
        shouldSecondClaimRevert: true,
        isFirstGetClaimable: true,
        isSecondGetClaimable: false,
      };
      // All test scenarios below: user tries to claim reward. All should succeed.
      const recipientsInfoAndTestScenarios = [
        {
          recipientInfo: {
            address: recipient1.address,
            rewardAmountWithoutDecimals: recipientRewardAmount,
            connectAs: recipient1,
          },
          testScenario: commonSuccessTestScenario,
        },
        {
          recipientInfo: {
            address: recipient2.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 100,
            connectAs: recipient2,
          },
          testScenario: commonSuccessTestScenario,
        },
        {
          recipientInfo: {
            address: recipient3.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 200,
            connectAs: recipient3,
          },
          testScenario: commonSuccessTestScenario,
        },
      ];
      await testMainFlow({
        distributerAmountWithoutDecimals,
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
        testScenarios: recipientsInfoAndTestScenarios.map(el => el.testScenario),
      });
    }
  );

  it(
    "Error flow - distributer contract does not have enough funds",
    async () => {
      const [_, recipient] = await ethers.getSigners();
      // Scenario: recipient tries to get reward, but fail doing so.
      const recipientsInfoAndTestScenarios = [
        {
          recipientInfo: {
            address: recipient.address,
            rewardAmountWithoutDecimals: recipientRewardAmount,
            connectAs: recipient,
          },
          testScenario: {
            shouldFirstClaimRevert: true,
            shouldSecondClaimRevert: true,
            // When contract does not enough funds, return true for isClaimable status.
            isFirstGetClaimable: true,
            isSecondGetClaimable: true,
          },
        }
      ];

      await testMainFlow({
        distributerAmountWithoutDecimals,
        blocklistedOperations: { transferERC20ToDistributerContract: true },
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
        testScenarios: recipientsInfoAndTestScenarios.map(el => el.testScenario),
      });
    }
  );

  it(
    "Error and correct flow - recipient does not have available rewards. other recipient can claim rewards.",
    async () => {
      const [
        _,
        recipientNotInTree,
        otherRecipient1InTree,
        otherRecipient2InTree,
      ] = await ethers.getSigners();
      const otherRecipient1RewardAmount = recipientRewardAmount + 100;
      const otherRecipient2RewardAmount = recipientRewardAmount + 500;

      const recipientsInfoAndTestScenarios = [
        // Scenario1: recipient tries to claim other recipient's reward. should fail.
        {
          recipientInfo: {
            address: otherRecipient1InTree.address,
            rewardAmountWithoutDecimals: otherRecipient1RewardAmount,
            connectAs: recipientNotInTree,
          },
          testScenario: {
            shouldFirstClaimRevert: true,
            shouldSecondClaimRevert: true,
            isFirstGetClaimable: true,
            isSecondGetClaimable: true,
          },
        },
        // Scenario2: other recipient claims their reward. should pass.
        {
          recipientInfo: {
            address: otherRecipient2InTree.address,
            rewardAmountWithoutDecimals: otherRecipient2RewardAmount,
            connectAs: otherRecipient2InTree,
          },
          testScenario: {
            shouldFirstClaimRevert: false,
            shouldSecondClaimRevert: true,
            isFirstGetClaimable: true,
            isSecondGetClaimable: false,
          },
        }
      ];
      // Connect as recipient who is not in tree, and fail claiming reward.
      await testMainFlow({
        distributerAmountWithoutDecimals,
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
        testScenarios: recipientsInfoAndTestScenarios.map(el => el.testScenario),
      });
    }
  );

  it(
    "Correct flow - owner sets new Merkle Tree.",
    async () => {
      const [
        _owner,
        recipient1EligibleForFirstReward,
        recipient2EligibleForFirstReward,
        recipient3EligibleForFirstAndSecondReward,
        recipient4EligibleForSecondReward,
        recipient5EligibleForSecondReward,
      ] = await ethers.getSigners();

      const commonSuccessTestScenario = {
        shouldFirstClaimRevert: false,
        shouldSecondClaimRevert: true,
        isFirstGetClaimable: true,
        isSecondGetClaimable: false,
      };
      // Start reward distribution and claiming for first merkle tree

      // All scenarios below: users claim their reward. Should suceed.
      const firstTestScenarios = [
        {
          recipientInfo: {
            address: recipient1EligibleForFirstReward.address,
            rewardAmountWithoutDecimals: recipientRewardAmount,
            connectAs: recipient1EligibleForFirstReward,
          },
          testScenario: commonSuccessTestScenario,
        },
        {
          recipientInfo: {
            address: recipient2EligibleForFirstReward.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 100,
            connectAs: recipient2EligibleForFirstReward,
          },
          testScenario: commonSuccessTestScenario,
        },
        {
          recipientInfo: {
            address: recipient3EligibleForFirstAndSecondReward.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 200,
            connectAs: recipient3EligibleForFirstAndSecondReward,
          },
          testScenario: commonSuccessTestScenario,
        },
      ];
      const { distributer, erc20 } = await testMainFlow({
        distributerAmountWithoutDecimals,
        recipientsInfo: firstTestScenarios.map(el => el.recipientInfo),
        testScenarios: firstTestScenarios.map(el => el.testScenario),
      });

      // All scenarios below: If user claimed the rewards already, they cannot
      // claim the rewards again. Other than this case, test should succeed.
      const secondTestScenarios = [
        {
          recipientInfo: {
            address: recipient3EligibleForFirstAndSecondReward.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 500,
            connectAs: recipient3EligibleForFirstAndSecondReward,
          },
          // This recipient already claiemd their rewards, so claiming again fails.
          testScenario: {
            shouldFirstClaimRevert: true,
            shouldSecondClaimRevert: true,
            isFirstGetClaimable: false,
            isSecondGetClaimable: false,
          },
        },
        {
          recipientInfo: {
            address: recipient4EligibleForSecondReward.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 600,
            connectAs: recipient4EligibleForSecondReward,
          },
          testScenario: commonSuccessTestScenario,
        },
        {
          recipientInfo: {
            address: recipient5EligibleForSecondReward.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 700,
            connectAs: recipient5EligibleForSecondReward,
          },
          testScenario: commonSuccessTestScenario,
        },
      ];

      await testMainFlow({
        distributerAmountWithoutDecimals,
        recipientsInfo: secondTestScenarios.map(el => el.recipientInfo),
        testScenarios: secondTestScenarios.map(el => el.testScenario),
        pastRecipientsInfo: firstTestScenarios.map(el => el.recipientInfo),
        // When setting existing contracts, it will use these contracts.
        existingContracts: { distributer, erc20 },
      });

      // Test changing hasClaimed value for certain user. 
      // Set false at hasClaimed for a user who already claimed the rewards.
      const setHasClaimed = await distributer.setHasClaimedPerRecipient(
        recipient3EligibleForFirstAndSecondReward.address,
        false, // newHasClaimed
      );
      await setHasClaimed.wait();

      const thirdTestScenarios = [
        {
          recipientInfo: {
            address: recipient3EligibleForFirstAndSecondReward.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 500,
            connectAs: recipient3EligibleForFirstAndSecondReward,
          },
          // This use should be able to claim rewards.
          testScenario: commonSuccessTestScenario,
        },
      ];
      await testMainFlow({
        distributerAmountWithoutDecimals,
        recipientsInfo: thirdTestScenarios.map(el => el.recipientInfo),
        testScenarios: thirdTestScenarios.map(el => el.testScenario),
        pastRecipientsInfo: firstTestScenarios.map(el => el.recipientInfo),
        // When setting existing contracts, it will use these contracts.
        existingContracts: { distributer, erc20 },
      });
    }
  );

  it(
    "Correct flow - owner upgrades new contract using openzeppelin's upgradeable functionality",
    async () => {
      const [
        owner,
        recipient1,
        recipient2,
        recipient3,
      ] = await ethers.getSigners();

      const commonSuccessTestScenarioWithoutWithdrawal = {
        shouldFirstClaimRevert: false,
        shouldSecondClaimRevert: true,
        isFirstGetClaimable: true,
        isSecondGetClaimable: false,
      };
      const recipientsInfoAndTestScenarios = [
        {
          recipientInfo: {
            address: recipient1.address,
            rewardAmountWithoutDecimals: recipientRewardAmount,
            connectAs: recipient1,
          },
          testScenario: commonSuccessTestScenarioWithoutWithdrawal,
        },
        {
          recipientInfo: {
            address: recipient2.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 100,
            connectAs: recipient2,
          },
          testScenario: commonSuccessTestScenarioWithoutWithdrawal,
        },
        {
          recipientInfo: {
            address: recipient3.address,
            rewardAmountWithoutDecimals: recipientRewardAmount + 200,
            connectAs: recipient3,
          },
          testScenario: commonSuccessTestScenarioWithoutWithdrawal,
        },
      ];
      const {
        distributer,
        erc20,
        merkleTree
      } = await testInitialDeployAndCreateMerkleTree({
        distributerAmountWithoutDecimals,
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
      });
      await testIsClaimable({
        erc20,
        merkleTree,
        distributer,
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
        scenariosIsClaimable: recipientsInfoAndTestScenarios.map(_ => true),
      });

      // Upgrade Distributer contract
      const testDistributerV2 = await upgradeToDistributerV2({
        distributer,
        owner
      });
      await testDistributerV2NewLogic({ testDistributerV2 });

      // No one claims the reward, so use is able to claim their rewards here.
      await testIsClaimable({
        erc20,
        merkleTree,
        distributer: testDistributerV2 as DistributerType,
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
        scenariosIsClaimable: recipientsInfoAndTestScenarios.map(_ => true),
      });
      await testMainFlow({
        distributerAmountWithoutDecimals,
        recipientsInfo: recipientsInfoAndTestScenarios.map(el => el.recipientInfo),
        testScenarios: recipientsInfoAndTestScenarios.map(el => el.testScenario),
        existingContracts: {
          distributer: testDistributerV2 as DistributerType,
          erc20,
          merkleTree
        },
      });
    }
  );
});
