import { ConnectWallet } from "@3rdweb/react";
import {
    Box,
    Flex,
    Avatar,
    Text,
    HStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/media-query'

function Header({ tokenImageURL }: { tokenImageURL: string }) {
    const avatarSize = useBreakpointValue({ base: 'xs', md: 'xs', lg: 'sm' });

    return (
        <Box
            bg={useColorModeValue('gray.100', 'gray.900')}
            px={{ base: 2, md: 3, lg: 4 }}>
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <HStack spacing={{ base: 2, md: 3, lg: 4 }} alignItems={'center'}>
                    <Avatar
                        size={avatarSize}
                        src={tokenImageURL}
                        marginTop="4px"
                    />
                    <Text
                        fontSize={{ base: 'md', md: 'xl', lg: '3xl' }}
                        fontWeight="bold">
                        Rewards Distributor
                    </Text>
                </HStack>
                <Flex alignItems={'center'}>
                    <ConnectWallet
                        variant={'solid'}
                        mr={{ base: 2, md: 3, lg: 4 }}
                    />
                </Flex>
            </Flex>
        </Box>
    );
}

export default Header;