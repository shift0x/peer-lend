import { ErrorCaption, StyledCaption } from "./StyledCaption";
import { useEffect, useState } from "react";
import { StyledInput } from "./StyledInput";
import { Box } from "@mui/material";
import { ethers } from 'ethers'

const defaultContainerStyle = {
    marginTop: 2
}

export default function EvmAddressInput({label, containerSx, onAddressChanged}){
    const [inputAddress, setInputAddress] = useState(null);
    const [error, setError] = useState(null)

    useEffect(() => {
        if(!inputAddress){
            onAddressChanged(null);
            return;
        }
        
        const addr = inputAddress.toString().trim()
        const isValidAddress = ethers.utils.isAddress(addr);

        if(!isValidAddress && addr.length > 0){
            setError("invald address");
            onAddressChanged(null);
        } else {
            setError(null);
            onAddressChanged(inputAddress);
        }
    }, [inputAddress]);

    return (
        <Box sx={{
            ...defaultContainerStyle,
            ...containerSx
        }}>

            <StyledCaption>{label}</StyledCaption>

            <StyledInput type="text"
                value={inputAddress}
                onChange={ (e) => { setInputAddress(e.target.value)} } />

            <ErrorCaption sx={{ flexGrow: 1, textAlign: 'left'}} error={error} />
        </Box>
    )
    
}