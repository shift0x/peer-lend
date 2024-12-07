import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useTransactionQueue } from "../providers/TransactionQueueProvider";

export function ActionButton({ content, active, onAction, onActionCompleted, sx={}, ...props }){
    const [isProcessingAction, setIsProcessingAction] = useState(false)
    const { addQueuedTransaction } = useTransactionQueue()
    const canSubmit = active && !isProcessingAction

    async function handleClick(){
        setIsProcessingAction(true);

        try {
            const tx = await onAction();

            setTimeout(() => {
                addQueuedTransaction(tx);

                if(onActionCompleted){
                    onActionCompleted();
                }
                
                setIsProcessingAction(false);    
            }, 750)
        } catch(err){
            setIsProcessingAction(false);

            console.log(err);
        }
    }

    function getButtonContent(){
        if(isProcessingAction){
            return (
                <>
                    <CircularProgress size="1rem" />&nbsp; {content}
                </>
            )
        }

        return content
    }

    return (
        <Button variant="contained" 
            onClick={handleClick}
            disabled={!canSubmit} 
            sx={{
                width: "100%",
                ...sx
            }} 
            color={ canSubmit ? "primary" : "info"} 
            {...props}
        >
                { getButtonContent() }
        </Button>
    )
}