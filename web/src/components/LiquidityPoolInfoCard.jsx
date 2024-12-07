import { Avatar, AvatarGroup, Stack, Typography, Box } from "@mui/material";
import { StyledCaption } from "./StyledCaption";
import { StyledChip } from "./StyledChip";

const LiquidityPoolInfoCard = ({ record, tokens, showExchange=false, sx={}, ...props}) => {
    const token0 = tokens[0];
    const token1 = tokens[1];

    return (
        <Stack direction="column" {...props}>
            <Box sx={{display: "flex", mb: "3px"}}>
                <AvatarGroup sx={{display: "inline-flex"}}>
                    {
                        tokens.map(token => (
                            <Avatar 
                                src={token.image} 
                                sx={{ width: "28px", height: "28px" }} />
                        ))
                    }
                </AvatarGroup>
                <Typography  sx={{
                    display: "inline-flex",
                    alignItems: "center"
                }}>
                    { `${token0.symbol} / ${token1.symbol}` }
                </Typography>
                <Box sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    ml: 1
                }}>
                    <StyledChip label={`${record.fee * 100}%`} />

                    {
                        showExchange ?
                            <StyledChip label={record.exchange.name.toLowerCase()} sx={{ ml: 1}} />
                            :
                            null
                    }
                </Box>
                
            </Box>

            <StyledCaption>
                { record.address }
            </StyledCaption>
            
        </Stack>
    )
}

export default LiquidityPoolInfoCard