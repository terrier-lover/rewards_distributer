import type { JsonRpcSigner } from '@ethersproject/providers'
import type {
    ERC20 as ERC20Type,
    Distribute as DistributeType,
    Holder as HolderType,
} from "./typechain";
import type { BigNumber as BigNumberType } from "ethers";

import * as ethers from "ethers";
import {
    Distribute__factory as DistributeFactory,
    Holder__factory as HolderFactory,
    ERC20__factory as ERC20Factory,
} from './typechain';
import {
    ERC20_TOKEN_CONTRACT_ADDRESS,
    DISTRIBUTE_TOKEN_CONTRACT_ADDRESS,
    HOLDER_TOKEN_CONTRACT_ADDRESS
} from './DefaultSettings';

const MUTATION_KEY_DISTRIBUTE_FLOW = 'mutationDistributeFlow';
const QUERY_KEY_ERC20_DECIMALS = 'queryERC20Decimals';
const QUERY_KEY_ERC20_SIMBOL = 'queryERC20Simbol';
const QUERY_KEY_DISTRIBUTE_RECIPIENT_AMOUNT = 'queryDistributeRecipientAmount';

function getContracts(signer: JsonRpcSigner): {
    erc20: ERC20Type,
    distribute: DistributeType,
    holder: HolderType,
} {
    const erc20 = (
        new ERC20Factory(signer)
    ).attach(ERC20_TOKEN_CONTRACT_ADDRESS);
    const distribute = (
        new DistributeFactory(signer)
    ).attach(DISTRIBUTE_TOKEN_CONTRACT_ADDRESS);
    const holder = (
        new HolderFactory(signer)
    ).attach(HOLDER_TOKEN_CONTRACT_ADDRESS);

    return { erc20, distribute, holder };
}

function convertToNumberFromBigNumber(
    availableRewards: BigNumberType,
    tokenDecimals: number,
) {
    return parseFloat(
        ethers.utils.formatUnits(availableRewards, tokenDecimals)
    );    
}

export { 
    MUTATION_KEY_DISTRIBUTE_FLOW,
    QUERY_KEY_ERC20_DECIMALS,
    QUERY_KEY_ERC20_SIMBOL,
    QUERY_KEY_DISTRIBUTE_RECIPIENT_AMOUNT,
    convertToNumberFromBigNumber,
    getContracts,
 };