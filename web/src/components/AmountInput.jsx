import { ErrorCaption, StyledCaption } from "./StyledCaption"
import { Box, Skeleton, Stack } from "@mui/material"
import { formatNumber } from "../lib/format"
import { useEffect, useState } from "react"
import { StyledInput } from "./StyledInput"

const accountBalanceStyle = {
    display: "flex",
    alignItems: 'center'
}

const maxAmountInStyle = {
    display: "flex",
    color: "blue",
    cursor: "pointer",
    alignItems: 'center'
}

const defaultContainerStyle = {
    marginTop: 2
}


export default function AmountInput({ caption="Amount", checkForInsuffientInput=true, balances, asset, network, onAmountInChanged, containerSx = {}, inputSx = {} }){
    const [selectedAssetBalance, setSelectedAssetBalance] = useState(0);
    const [inputAmountIn, setInputAmountIn] = useState("");
    const [amountInError, setAmountInError] = useState(null);

    function setAccountMaximumInput(){
        if(!asset|| !network || !balances[network.chainId]) {
            setSelectedAssetBalance("");

            return;
        } 

        const balance = balances[network.chainId][asset.address.toLowerCase()];

        setSelectedAssetBalance(balance == null ? "" : balance);
    }


    useEffect(() => {
        setAccountMaximumInput();
        setAmount(0)
    }, [asset, network])

    function setAmount(amount){
        setInputAmountIn(amount);

        let error = null;

        if(isNaN(amount)){
            error = "invalid input amount";
        } else if(amount > selectedAssetBalance && checkForInsuffientInput){
            error = "amount exceeds balance";
        } else if(amount < 0){
            error = "amount must be > 0"
        }
        
        if(error || amount == 0){
            onAmountInChanged(null);
        } else {
            onAmountInChanged(amount);
        }

        setAmountInError(error);
    }

    return (
        <Box sx={{
            ...defaultContainerStyle,
            ...containerSx
        }}>
            <StyledCaption>{caption}</StyledCaption>

            <StyledInput error={amountInError != null} 
                sx={inputSx} 
                value={inputAmountIn} 
                onChange={ (e) => setAmount(e.target.value) } />


            <Stack direction="row" sx={{ 
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <ErrorCaption sx={{ flexGrow: 1, textAlign: 'left'}} error={amountInError} />

                <StyledCaption 
                    sx={accountBalanceStyle}>
                        {
                            selectedAssetBalance.toString() == "" ? 
                                <Skeleton width={100} /> :
                                <>
                                    Balance:&nbsp;{ formatNumber(selectedAssetBalance) }
                                </>
                        }
                        
                </StyledCaption>
                
                <StyledCaption 
                    sx={maxAmountInStyle} 
                    onClick={ () => { setAmount(selectedAssetBalance)}}>
                        {
                            selectedAssetBalance.toString() == "" ?
                                <Skeleton width={20} /> :
                                <>
                                    &nbsp;(max)
                                </>
                        }
                        
                </StyledCaption>
            </Stack>
        </Box>
    )
}