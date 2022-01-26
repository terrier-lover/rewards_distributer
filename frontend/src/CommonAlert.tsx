import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    CloseButton,
    Text,
} from '@chakra-ui/react';

function CommonAlert(
    { title, description }: { title: string, description: string }
) {
    return (
        <Alert status='error' width={"80%"}>
            <AlertIcon />
            <AlertTitle mr={2}><Text color='black'>{title}</Text></AlertTitle>
            <AlertDescription>
                <Text color='black'>{description}</Text>
            </AlertDescription>
            <CloseButton color="black" position='absolute' right='8px' top='8px' />
        </Alert>
    );
}

export default CommonAlert;