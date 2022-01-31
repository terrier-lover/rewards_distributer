import { getRelevantContracts } from "../../utils/contractUtils";

// Specify amounts which will be passed to holder contract
const RECIPIENT_ADDRESS = "0xCDB80835Ed75e8ADe4B4F8ea2969cDf189a9acc8";
const RECIPIENT_UNIQUE_KEY = "20210401";

async function main() {
    const { distributer } = await getRelevantContracts();

    const tx = await distributer.setHasClaimedPerRecipientAndUniqueKey(
        RECIPIENT_ADDRESS,
        RECIPIENT_UNIQUE_KEY,
        false, // newHasClaimed
    );
    await tx.wait();

    console.log('Transaction hash', tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});