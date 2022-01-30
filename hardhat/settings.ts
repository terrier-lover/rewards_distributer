import * as dotenv from "dotenv";

const PATH_TO_HARDHAT_ENV = `${__dirname}/.env`;
dotenv.config({ path: PATH_TO_HARDHAT_ENV });

const PATH_TO_FRONTEND_ENV = `${__dirname}/./../frontend/.env`;
const RAW_RECIPIENTS_INFO_JSON: {
    address: string, 
    amount: number, 
    uniqueKey: string
}[] 
    = require(`${__dirname}/rawRecipientsInfo.json`);
const PATH_TO_REACT_ROOT_RECIPIENTS_INFO_JSON 
    = `${__dirname}/./../frontend/src/recipientsInfo.json`;

const ENV = process.env;

export { 
    ENV,
    PATH_TO_HARDHAT_ENV,
    PATH_TO_FRONTEND_ENV,
    RAW_RECIPIENTS_INFO_JSON,
    PATH_TO_REACT_ROOT_RECIPIENTS_INFO_JSON,
};