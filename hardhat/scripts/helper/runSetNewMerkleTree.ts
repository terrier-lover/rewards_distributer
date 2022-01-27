import { ethers, network } from "hardhat";
import { initialDeployAndCreateMerkleTree } from '../../utils/contractUtils';

const CUSTOM_RECIPIENT1 = "0x3b1F26390Db8dD9166D1a03c1499d7FBB6615f1F"; // string or null
const CUSTOM_RECIPIENT2 = "0xCDB80835Ed75e8ADe4B4F8ea2969cDf189a9acc8"; // string or null
const RECIPIENT1_AMOUNT_WITHOUT_DECIMALS = 100;
const RECIPIENT2_AMOUNT_WITHOUT_DECIMALS = 200;

async function main() {
    const [owner, recipient] = await ethers.getSigners();

    const recipientsInfo = [{
        address: CUSTOM_RECIPIENT1 ?? recipient.address,
        rewardAmountWithoutDecimals: RECIPIENT1_AMOUNT_WITHOUT_DECIMALS,
    }];
    if (CUSTOM_RECIPIENT2 != null) {
        recipientsInfo.push({
            address: CUSTOM_RECIPIENT2,
            rewardAmountWithoutDecimals: RECIPIENT2_AMOUNT_WITHOUT_DECIMALS,
        });
    }

    const {
        distributer,
        erc20,
        merkleTree,
    } = await initialDeployAndCreateMerkleTree({
        owner,
        recipientsInfo,
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});