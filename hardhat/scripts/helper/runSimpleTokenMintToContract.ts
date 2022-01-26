import { ethers } from "hardhat";
import {
    transferERC20,
    getRelevantContracts,
} from "../../utils/contractUtils";

// Specify amounts which will be passed to holder contract
const AMOUNT_WITHOUT_DECIMALS = 10000000;

async function main() {
    const { erc20, distributer } = await getRelevantContracts();

    const [owner] = await ethers.getSigners();

    await transferERC20({
        amount: AMOUNT_WITHOUT_DECIMALS,
        targetAddress: distributer.address,
        erc20,
        owner,
    });

    const balanceOfDistributer = await erc20.balanceOf(distributer.address);
    console.log('balance of distributer contract is', balanceOfDistributer.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});