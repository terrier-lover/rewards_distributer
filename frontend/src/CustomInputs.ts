// Set token image that you want to display in the website
const TOKEN_IMAGE_URL = 'https://jpyc.jp/static/media/jpyc.0d1e5d3f.png';

// Set network names used in hardhat
const NETWORK_NAMES = {
    MAINNET: "mainnet",
    MATIC: "matic",
    RINKEBY: "rinkeby",
    GETH_LOCALHOST: "geth_localhost",
};

// Set supported chain ids
const CHAIN_IDS = {
    MAINNET: 1,
    RINKEBY: 4,
    MATIC: 137,
    GETH_LOCALHOST: 31337,
}

// Specify which chain corresponds with network name
const CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS: { [chainID: number]: string } = {
    [CHAIN_IDS.MAINNET]: NETWORK_NAMES.MAINNET,
    [CHAIN_IDS.RINKEBY]: NETWORK_NAMES.RINKEBY,
    [CHAIN_IDS.MATIC]: NETWORK_NAMES.MATIC,
    [CHAIN_IDS.GETH_LOCALHOST]: NETWORK_NAMES.GETH_LOCALHOST,
};

// Set chains that you want to support in the website. The website uses this setting.
const SUPPORTED_CHAIN_IDS_IN_WEB = [
    // CHAIN_IDS.MAINNET, // Comment out when supporting mainnet
    CHAIN_IDS.RINKEBY,
    // CHAIN_IDS.MATIC, // Comment out when supporting matic
    // CHAIN_IDS.GETH_LOCALHOST, // Comment out when testing on geth network.
];

export {
    CHAINS_IDS_AND_NETWORK_NAME_MAPPINGS,
    TOKEN_IMAGE_URL,
    SUPPORTED_CHAIN_IDS_IN_WEB,
    NETWORK_NAMES,
    CHAIN_IDS,
};