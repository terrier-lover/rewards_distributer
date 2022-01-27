import { Button } from '@chakra-ui/react';

function FundDistributionButtonCommon({
    isDisabled,
    isLoading = false,
    loadingText = undefined,
    onClick,
}: {
    isDisabled: boolean,
    isLoading?: boolean,
    loadingText?: string,
    onClick?: () => void,    
}) {
    return (
        <Button
            mt={10}
            w={'full'}
            bg={'green.400'}
            color={'white'}
            rounded={'xl'}
            boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'}
            _hover={{ bg: 'green.500' }}
            _focus={{ bg: 'green.500' }}
            onClick={onClick}
            disabled={isDisabled}
            isLoading={isLoading}
            loadingText={loadingText}
        >
            {isDisabled ? "Reward not available" : "Claim Reward"}
        </Button>        
    );
}

export default FundDistributionButtonCommon;