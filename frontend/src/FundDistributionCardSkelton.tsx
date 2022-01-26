import React from 'react';
import {
    Box,
    Stack,
    List,
    useColorModeValue,
} from '@chakra-ui/react';

function FundDistributionCardSkelton({
    headlinePillNode,
    rewardAmountTextNode,
    footerTextNode,
    listDescriptionsNode,
    buttonNode,
}: {
    headlinePillNode: React.ReactNode,
    rewardAmountTextNode: React.ReactNode,
    footerTextNode: React.ReactNode,
    listDescriptionsNode?: React.ReactNode[] | null,
    buttonNode: React.ReactNode,
}) {
    return (
        <Box
            maxWidth={{ base: '350px', md: '350px', lg: '400px' }}
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow={'2xl'}
            rounded={'md'}
            overflow={'hidden'}>
            <Stack
                textAlign={'center'}
                p={6}
                color={useColorModeValue('gray.800', 'white')}
                align={'center'}>
                {headlinePillNode}
                <Stack direction={'column'} align={'center'} justify={'center'}>
                    <Stack direction={'row'} textAlign={'center'} align={'center'}>
                        {rewardAmountTextNode}
                    </Stack>
                    {footerTextNode}
                </Stack>
            </Stack>
            <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={10}>
                {listDescriptionsNode == null ? null : (
                    <List spacing={3}>{listDescriptionsNode}</List>
                )}
                {buttonNode}
            </Box>
        </Box>
    )
}

export default FundDistributionCardSkelton;