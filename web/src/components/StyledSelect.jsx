import { Select } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledSelect = styled(Select)({
    '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
        textTransform: 'capitalize',
    },
    '& .MuiMenuItem-root': {
        textTransform: 'capitalize',
    },
    width: "100%" 
})