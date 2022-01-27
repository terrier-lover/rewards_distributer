import { ethers as hardhatEthers } from "hardhat";
import { utils } from 'ethers';

const AMOUNT_WITHOUT_DECIMALS = "0.1";
// const RECIPIENT = "0xCDB80835Ed75e8ADe4B4F8ea2969cDf189a9acc8";
const RECIPIENT = "0x3b1F26390Db8dD9166D1a03c1499d7FBB6615f1F";

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