import { ethers as hardhatEthers } from "hardhat";
import { utils } from 'ethers';

const AMOUNT_WITHOUT_DECIMALS = "0.1";
const RECIPIENT = "..."; // Specify address

async function main() {
    const [ owner ] = await hardhatEthers.getSigners();
    const tx = {
        to: RECIPIENT,
        value: utils.parseEther(AMOUNT_WITHOUT_DECIMALS)
    };
    const result = await owner.sendTransaction(tx);
    await result.wait();
    console.log(`Tx=${result.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});