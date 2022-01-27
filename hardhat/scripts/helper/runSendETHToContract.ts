import { ethers as hardhatEthers } from "hardhat";
import { utils } from 'ethers';

const AMOUNT_WITHOUT_DECIMALS = "0.1";
// const RECIPIENT = "0x8c5bF4D7216b1e18CC9172595FC46e831718fd76";
const RECIPIENT = "0x08d8Aa61255d7C65e445378e4753bC90317cb8C8";

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