import React, { useEffect } from "react";
import { ErrorBoundary } from 'react-error-boundary'
import { useToast } from '@chakra-ui/react';

function CommonErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    );
}

function ErrorFallback(
    { error, resetErrorBoundary}: { error: any, resetErrorBoundary: () => void }
) {
    const toast = useToast();

    useEffect(() => {
        if (error == null) {
            return;
        }

        toast({
            title: 'Error',
            description: "Something went wrong. Please try again.",
            status: 'warning',
            duration: null,
            isClosable: true,
            onCloseComplete: () => {
                resetErrorBoundary();
            }
        });
    }, [error, toast]);
    // Intentionally return nothing
    return (<></>)
}

export default CommonErrorBoundary;