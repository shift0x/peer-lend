import PropTypes from 'prop-types';

import { Button, CircularProgress, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useSigner, useSwitchChain } from '@thirdweb-dev/react';

const TransactionStatus = {
    "NA" : null, 
    "AwaitingSignature": "Awaiting Signature",
    "AwaitingConfirmation": "Awaiting Confirmation"
}

function SubmitTransactionButton({network, disabled, label, onSubmitTransaction, callback, waitForConfirmation, showDivider=true, sx={}, ...props}){
    const [ transactionStatus, setTransactionStatus ] = useState(TransactionStatus.NA);
    const [ pendingOperation, setPendingOperation ] = useState(false);

    const signer = useSigner();
    const switchChain = useSwitchChain()
    const active = !disabled && transactionStatus == TransactionStatus.NA;

    async function executeTransaction(){
        const tx = await onSubmitTransaction(signer)

        setTransactionStatus(TransactionStatus.AwaitingConfirmation);
        setPendingOperation(false);

        if(waitForConfirmation && tx)
            await tx.wait();

        setTimeout(() => {
            callback();
        }, 1500);
    }

    async function handleClick(){
        setTransactionStatus(TransactionStatus.AwaitingSignature)
        
        await switchChain(network.chainId)

        setPendingOperation(true);
    }

    function getButtonContent(){
        if(transactionStatus == TransactionStatus.NA)
            return label
        
        return (
            <>
                <CircularProgress size="1rem" />&nbsp; { transactionStatus }
            </>
        )
    }

    useEffect(() => {
        if(pendingOperation)
            executeTransaction();

    }, [pendingOperation])


    return (
        <>
            <Divider sx={{
                display: showDivider ? "block" : "none",
                mt:2
            }} />

            <Button variant="contained" 
                onClick={handleClick}
                disabled={!active} 
                sx={{
                    width: "100%",
                    mt: 2,
                    ...sx
                }} 
                color={ active ? "primary" : "info"} 
                {...props}
            >
                {getButtonContent()}
            </Button>
        </>
        
    )
}

SubmitTransactionButton.propTypes = {
    disabled: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onSubmitTransaction: PropTypes.func.isRequired,
    callback: PropTypes.func.isRequired,
    waitForConfirmation: PropTypes.bool.isRequired
};

export default SubmitTransactionButton