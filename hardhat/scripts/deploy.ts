import {
    formatERC20Amount,
    initialDeployAndCreateMerkleTree,
    transferERC20,
    mintSimpleToken,
} from "../utils/contractUtils";
import { ethers } from "hardhat";
import { getClaimArguments } from "../utils/merkleTreeUtils";

const INITIAL_MINT_AMOUNT_WITHOUT_DECIMALS = 100000;
const REWARD_ELIGIBLE_AMOUNT_WITHOUT_DECIMALS = 100;

/*
 * This script deploys contracts using ERC20 token. In local mode, it uses
 * SimpleToken ERC20 contracts intentionally. In rinkeby, it uses USDC on rinkeby.
 */
async function main() {
    const [owner, recipient] = await ethers.getSigners();

    const recipientsInfo = [{
        address: recipient.address,
        rewardAmountWithoutDecimals: REWARD_ELIGIBLE_AMOUNT_WITHOUT_DECIMALS,
        connectAs: recipient,
    }];
    const { distributer, erc20, merkleTree } = await initialDeployAndCreateMerkleTree({
        owner,
        recipientsInfo,
    });

    console.log(`ERC20 contract deployed to ${erc20.address}`);
    console.log(`Distribute token contract deployed to ${distributer.address}`);
    console.log(`Owner address is ${owner.address}`);
    console.log(`Recipient address is ${recipient.address}`);

    await mintSimpleToken({
        amountWithoutDecimals: INITIAL_MINT_AMOUNT_WITHOUT_DECIMALS,
        erc20,
        owner,
    });
    await transferERC20({
        amount: INITIAL_MINT_AMOUNT_WITHOUT_DECIMALS,
        targetAddress: distributer.address,
        erc20: erc20,
        owner,
    });

    const distributerBalance = await erc20.balanceOf(distributer.address);
    console.log(
        'The balance of distributer contract:',
        await formatERC20Amount(distributerBalance, erc20),
    );

    const tokenDecimals = await erc20.decimals();

    const { address, amount, hexProof } = getClaimArguments({
        merkleTree,
        recipientInfo: recipientsInfo[0],
        tokenDecimals
    });

    const recipientClaimTx = await distributer.connect(recipient).claim(
        address,
        amount,
        hexProof,
    );
    await recipientClaimTx.wait();

    const balanceWithDecimals = await erc20.balanceOf(recipient.address);
    const balanceWithoutDecimals =
        await formatERC20Amount(balanceWithDecimals, erc20);
    console.log(`Current balance of recipient: ${balanceWithoutDecimals}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

