import { StyledCaption } from "./StyledCaption";
import { Box, Typography } from "@mui/material";

const defaultBoxStyles = {
    marginTop: 2,
    height: "25px"
}

const defaultTypographyStyles = {
    textAlign: "right",
    backgroundColor: "hsla(220, 35%, 94%, 0.4)",
    border: "1px solid hsla(220, 25%, 80%, 0.8)",
    padding: "8px",
    borderRadius: 1,
    color: "#444",
    display: "block",
    marginTop: "4px"
}

export default function ReadonlyInput({ label, content, containerSx = {}, bodySx = {} }){
    return (
        <Box sx={{
            ...defaultBoxStyles,
            ...containerSx
        }}>
            <StyledCaption>{label}</StyledCaption>

            <Typography variant="body2" sx={{
                ...defaultTypographyStyles,
                ...bodySx
            }}>{content ?? <>&nbsp;</>}</Typography>
        </Box>
    )
}