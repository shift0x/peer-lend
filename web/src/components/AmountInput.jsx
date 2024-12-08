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


export default function AmountInput({ caption="Amount", checkForInsuffientInput=true, displayBalances=true, balances={}, asset, network, onAmountInChanged, containerSx = {}, inputSx = {}, value, readonly=false, minimumValue, defaultValue }){
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
        setAmount(defaultValue ?? 0)
    }, [asset, network])

    function setAmount(amount){
        if(!onAmountInChanged)
            return 
        setInputAmountIn(amount);

        let error = null;

        if(isNaN(amount)){
            error = "invalid value";
        } else if(amount > selectedAssetBalance && checkForInsuffientInput){
            error = "amount exceeds balance";
        } else if(amount < 0){
            error = "value must be > 0"
        } else if(minimumValue && amount < minimumValue){
            error = `value must be > ${minimumValue}`
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
                value={value ?? inputAmountIn} 
                
                onChange={ (e) => {  if(!readonly) setAmount(e.target.value)}  }  />


            <Stack direction="row" sx={{ 
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <ErrorCaption sx={{ flexGrow: 1, textAlign: 'left'}} error={amountInError} />

                <StyledCaption 
                    sx={accountBalanceStyle}>
                        {
                            displayBalances ?
                                selectedAssetBalance.toString() == "" ? 
                                    <Skeleton width={100} /> :
                                    <>
                                        Balance:&nbsp;{ formatNumber(selectedAssetBalance) }
                                    </>
                                :
                                null
                        }
                        
                </StyledCaption>
                
                <StyledCaption 
                    sx={maxAmountInStyle} 
                    onClick={ () => { setAmount(selectedAssetBalance)}}>
                        {
                            displayBalances ?
                                selectedAssetBalance.toString() == "" ?
                                    <Skeleton width={20} /> :
                                    <>
                                        &nbsp;(max)
                                    </>
                                :
                                null
                        }
                        
                </StyledCaption>
            </Stack>
        </Box>
    )
}