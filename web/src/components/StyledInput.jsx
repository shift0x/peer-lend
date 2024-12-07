import { Input } from "@mui/material";

const rightAlignedInputStyle = (error) => {
    return {
        width: "100%", 
        '& .MuiInput-input': {
            textAlign: "right"
        },
        borderBottom: error ? "1px solid red" : "border bottom 1px solid #000"
    }
} 

export const StyledInput = ({ error = false, sx={}, ...props }) => (
    <Input {...props} sx={{
        ...rightAlignedInputStyle(error),
        ...sx
    }}  />
  );

