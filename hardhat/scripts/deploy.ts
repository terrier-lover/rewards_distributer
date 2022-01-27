import {
    formatERC20Amount,
    initialDeployAndCreateMerkleTree,
    transferERC20,
    mintSimpleToken,
    setEnv,
    setAddressAndAmountMappingJson,
} from "../utils/contractUtils";
import { ethers, network } from "hardhat";
import { getClaimArguments } from "../utils/merkleTreeUtils";
import {     
    PATH_TO_HARDHAT_ENV,
    PATH_TO_FRONTEND_ENV,
    ENV_ERC20_CONTRACT_ADDRESS,
    ENV_DISTRIBUTER_CONTRACT_ADDRESS,
    ENV_PREFIX_REACT_APP,
    PATH_TO_REACT_ROOT_ADDRESS_AMOUNT_MAP_JSON,
} from "../settings";

// Settings for this deployment
const INITIAL_MINT_AMOUNT_WITHOUT_DECIMALS = 10000;

const SHOULD_RECIPIENT_CLAIM_REWARD = false;
const SHOULD_GENERATE_ENV_FILE = true;
const SHOULD_GENERATE_RECIPIENT_AMOUNT_JSON_FILE = true;

const CUSTOM_RECIPIENT1 = null; // string or null
const CUSTOM_RECIPIENT2 = null; // string or null
const RECIPIENT1_AMOUNT_WITHOUT_DECIMALS = 100;
const RECIPIENT2_AMOUNT_WITHOUT_DECIMALS = 200;

/*
 * This script deploys contracts using ERC20 token. In local mode, it uses
 * SimpleToken ERC20 contracts intentionally. In rinkeby, it uses USDC on rinkeby.
 */
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

    const { distributer, erc20, merkleTree } =
        await initialDeployAndCreateMerkleTree({ owner, recipientsInfo });

    console.log(`ERC20 contract deployed to ${erc20.address}`);
    console.log(`Distributer token contract deployed to ${distributer.address}`);
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

    const recipientsOperation = recipientsInfo.map(async (recipientInfo, index) => {
        const { address, amount, hexProof } = getClaimArguments({
            merkleTree,
            recipientInfo,
            tokenDecimals
        });        
        const [isClaimable, _] = await distributer.connect(
            recipientInfo.address,
        ).getIsClaimable(address, amount, hexProof);
        console.log(`Can recipient${index} claim reward? ${isClaimable ? "Yes" : "No"}`);

        if (SHOULD_RECIPIENT_CLAIM_REWARD) {
            console.log('Claiming reward as a recipient');
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
    });
    await Promise.all(recipientsOperation);

    if (SHOULD_GENERATE_RECIPIENT_AMOUNT_JSON_FILE) {
        const recipientAddressAndAmountMappings: {[address: string]: number} = {};
        recipientsInfo.forEach(recipientInfo => {
            const { address, rewardAmountWithoutDecimals} = recipientInfo;
            recipientAddressAndAmountMappings[address] = rewardAmountWithoutDecimals;
        });
        console.log(
            'Setting new address and amount map json', 
            recipientAddressAndAmountMappings
        );
        await setAddressAndAmountMappingJson(
            recipientAddressAndAmountMappings, 
            PATH_TO_REACT_ROOT_ADDRESS_AMOUNT_MAP_JSON,
        );
    }

    if (SHOULD_GENERATE_ENV_FILE) {
        let newEnvValues: {[key: string]: string} = {};
        newEnvValues[`${network.name.toUpperCase()}_${ENV_ERC20_CONTRACT_ADDRESS}`] 
            = erc20.address;
        newEnvValues[`${network.name.toUpperCase()}_${ENV_DISTRIBUTER_CONTRACT_ADDRESS}`] 
            = distributer.address;
        console.log('Setting new env Values for hardhat directory', newEnvValues);
        await setEnv(newEnvValues, PATH_TO_HARDHAT_ENV);

        newEnvValues = {};
        newEnvValues[`${ENV_PREFIX_REACT_APP}_${network.name.toUpperCase()}_${ENV_ERC20_CONTRACT_ADDRESS}`] 
            = erc20.address;
        newEnvValues[`${ENV_PREFIX_REACT_APP}_${network.name.toUpperCase()}_${ENV_DISTRIBUTER_CONTRACT_ADDRESS}`] 
            = distributer.address;
        console.log('Setting new env Values for frontend directory', newEnvValues);
        await setEnv(newEnvValues, PATH_TO_FRONTEND_ENV);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
