import React from 'react';
import {
    chakra,
    ListItem,
    ListIcon,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

function FundDistributionCardList(props: {children: React.ReactNode}) {
    return (
        <ListItem>
            <ListIcon as={CheckIcon} color="green.400" />
            <chakra.span color='black'>{props.children}</chakra.span>
        </ListItem>
    );
}

export default FundDistributionCardList;