import { Chip } from "@mui/material";

const baseSx = {
    fontSize:"12px", 
    borderRadius: "5px",
    padding: "5px",
    height: "20px",
    "& .MuiChip-label": {
        padding: "0px",
        fontWeight: "400"
    },
    "&:hover": {
      backgroundColor: "inherit", // Prevents background change on hover
      boxShadow: "none",          // Prevents box-shadow change on hover
    },
}

export const StyledChip = ({sx={}, ...props}) => {
    return (
        <Chip {...props} sx={{
            ...baseSx,
            ...sx
        }} />
    )
    
} 