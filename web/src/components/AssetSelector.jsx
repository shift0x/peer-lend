import { Box } from "@mui/material"
import { StyledCaption } from "./StyledCaption"
import { StyledSelect } from "./StyledSelect"
import { StyledMenuItem } from "./StyledMenuItem"
import { useEffect, useState } from "react"

const defaultContainerStyle = {
    marginTop: 2
}

export default function AssetSelector({ caption="Asset", network, onSelectedAssetChanged, sx = {}, selectSx={} }){
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

    useEffect(() => {
        const selectedAsset = selectedAssetIndex == -1 || !network ? null : network.tokens[selectedAssetIndex];

        onSelectedAssetChanged(selectedAsset);
    }, [selectedAssetIndex])

    useEffect(() => {
        setSelectedAssetIndex(0);

        if(network){
            onSelectedAssetChanged(network.tokens[selectedAssetIndex]);
        }
    }, [network])

    

    const tokens = network ? network.tokens : []

    return (
        <Box sx={{
            ...defaultContainerStyle,
            ...sx
        }}>
            <StyledCaption>{caption}</StyledCaption>
            <StyledSelect sx={{mt: "3px", ...selectSx}}
                value={selectedAssetIndex} 
                onChange={(e) => { setSelectedAssetIndex(e.target.value) }}>

                { tokens.map((token, index) => (
                    <StyledMenuItem value={index}>
                        <img src={token.image} height="25px" width="25px" />&nbsp;{token.name}
                    </StyledMenuItem>
                ))}
            </StyledSelect>
        </Box>
    )
}