import type { RecipientInfoType } from "../settings";

import {
    formatERC20Amount,
    initialDeployAndCreateMerkleTree,
    transferERC20,
    mintSimpleToken,
    setEnv,
    setRecipientsInfo,
    ERC20_CONTRACT_ADDRESS,
} from "../utils/contractUtils";
import { ethers, network } from "hardhat";
import {
    PATH_TO_HARDHAT_ENV,
    PATH_TO_FRONTEND_ENV,
    RAW_RECIPIENTS_INFO_JSON,
    PATH_TO_REACT_ROOT_RECIPIENTS_INFO_JSON,
} from "../settings";
import { COMMON_VARIABLES_AND_FUNCTIONS } from "../settings";

const {
    getClaimArguments,
    ENV_PREFIX_REACT_APP,
    ENV_DISTRIBUTER_CONTRACT_ADDRESS,
} = COMMON_VARIABLES_AND_FUNCTIONS;

/***** Change following values based on your needs *****/
const INITIAL_MINT_AMOUNT_WITHOUT_DECIMALS = 1000;
const SHOULD_RECIPIENT_CLAIM_REWARD = false;
const SHOULD_GENERATE_ENV_FILE = true;
const SHOULD_GENERATE_JSON_FOR_TARGET_RECIPIENTS = true;
const SHOULD_USE_JSON_FOR_TARGET_RECIPIENTS = true;
const SHOULD_USE_EXTERNAL_ERC20_TOKEN = true; // Set true if you want to use external token address

/*
 * This script deploys contracts using ERC20 token. In local mode, it uses
 * SimpleToken ERC20 contracts automatically. In other environments, it uses
 * ERC20 token that dev specified in .env.
 */
async function main() {
    console.log(`##### This script deploys contract to ${network.name} with following settings:`);
    console.log(`SHOULD_RECIPIENT_CLAIM_REWARD=${getYesOrNo(SHOULD_RECIPIENT_CLAIM_REWARD)}`);
    console.log(`SHOULD_GENERATE_ENV_FILE=${getYesOrNo(SHOULD_GENERATE_ENV_FILE)}`);
    console.log(`SHOULD_GENERATE_JSON_FOR_TARGET_RECIPIENTS=${getYesOrNo(SHOULD_GENERATE_JSON_FOR_TARGET_RECIPIENTS)}`);
    console.log(`SHOULD_USE_JSON_FOR_TARGET_RECIPIENTS=${getYesOrNo(SHOULD_USE_JSON_FOR_TARGET_RECIPIENTS)}`);
    console.log(`SHOULD_USE_EXTERNAL_ERC20_TOKEN=${getYesOrNo(SHOULD_USE_EXTERNAL_ERC20_TOKEN)}`);

    const [owner, recipient1, recipient2] = await ethers.getSigners();
    const recipientsWithSignature = [recipient1, recipient2];

    let recipientsInfo: RecipientInfoType[] | null = null;
    if (SHOULD_USE_JSON_FOR_TARGET_RECIPIENTS) {
        recipientsInfo = RAW_RECIPIENTS_INFO_JSON.map(
            info => ({
                address: info.address,
                rewardAmountWithoutDecimals: info.amount,
                uniqueKey: info.uniqueKey
            })
        );
    } else {
        recipientsInfo = recipientsWithSignature.map(
            recipient => ({
                address: recipient.address,
                rewardAmountWithoutDecimals: INITIAL_MINT_AMOUNT_WITHOUT_DECIMALS / 2,
                uniqueKey: "20220930",
            }),
        );
    }

    const targetERC20TokenAddress = SHOULD_USE_EXTERNAL_ERC20_TOKEN
        ? ERC20_CONTRACT_ADDRESS!
        : null;

    const { distributer, erc20, merkleTree } =
        await initialDeployAndCreateMerkleTree({
            owner,
            recipientsInfo,
            erc20Address: targetERC20TokenAddress,
        });

    console.log(`ERC20 contract deployed to ${erc20.address}`);
    console.log(`Distributer token contract deployed to ${distributer.address}`);
    console.log(`Owner address is ${owner.address}`);
    recipientsInfo.forEach(
        info => console.log(`Recipient address is ${info.address}`)
    );

    if (!SHOULD_USE_EXTERNAL_ERC20_TOKEN) {
        await mintSimpleToken({
            amountWithoutDecimals: INITIAL_MINT_AMOUNT_WITHOUT_DECIMALS,
            erc20,
            owner,
        });
    }
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

    const recipientsOperation = recipientsInfo.map(async recipientInfo => {
        const { address, amount, uniqueKey, hexProof } = getClaimArguments({
            merkleTree,
            recipientInfo,
            tokenDecimals
        });
        const [isClaimable, _] = await distributer.connect(
            recipientInfo.address,
        ).getIsClaimable(address, amount, uniqueKey, hexProof);
        console.log(`Can recipient=${address} claim amount=${recipientInfo.rewardAmountWithoutDecimals}? ${isClaimable ? "Yes" : "No"}`);

        if (SHOULD_RECIPIENT_CLAIM_REWARD && !SHOULD_USE_JSON_FOR_TARGET_RECIPIENTS) {
            console.log('Claiming reward as a recipient');
            const targetSigner = recipientsWithSignature.find(
                signer => signer.address === address
            ) ?? null;
            if (targetSigner == null) {
                return null;
            }
            const recipientClaimTx =
                await distributer.connect(targetSigner).claim(
                    address,
                    amount,
                    uniqueKey,
                    hexProof,
                );
            await recipientClaimTx.wait();

            const balanceWithDecimals =
                await erc20.balanceOf(address);
            const balanceWithoutDecimals =
                await formatERC20Amount(balanceWithDecimals, erc20);
            console.log(`Current balance of recipient: ${balanceWithoutDecimals}`);

        }
    });
    await Promise.all(recipientsOperation);

    if (SHOULD_GENERATE_JSON_FOR_TARGET_RECIPIENTS) {
        console.log(
            'Setting new address and amount map json in frontend',
            recipientsInfo
        );
        await setRecipientsInfo(
            recipientsInfo,
            PATH_TO_REACT_ROOT_RECIPIENTS_INFO_JSON,
        );
    }

    if (SHOULD_GENERATE_ENV_FILE) {
        // Updating .env on hardhat directory
        let newEnvValues: { [key: string]: string } = {};
        newEnvValues[`${network.name.toUpperCase()}_${ENV_DISTRIBUTER_CONTRACT_ADDRESS}`]
            = distributer.address;
        console.log('Setting new env Values for hardhat directory', newEnvValues);
        await setEnv(newEnvValues, PATH_TO_HARDHAT_ENV);

        // Updating .env on frontend directory
        newEnvValues = {};
        newEnvValues[`${ENV_PREFIX_REACT_APP}_${network.name.toUpperCase()}_${ENV_DISTRIBUTER_CONTRACT_ADDRESS}`]
            = distributer.address;
        console.log('Setting new env Values for frontend directory', newEnvValues);
        await setEnv(newEnvValues, PATH_TO_FRONTEND_ENV);
    }
}

function getYesOrNo(value: boolean) {
    return value ? "Yes" : "No";
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
