import { Stack, TextField } from "@mui/material";
import { StyledCaption } from "./StyledCaption";

const defaultTextFieldSx = {
    '& .MuiFilledInput-input': {
        paddingTop: "5px",
    },
    '& .MuiFilledInput-root': {
          paddingTop: "5px",
          borderRadius: 0,
          '&:before, &:after': {
            borderRadius: 0
          }
        }
}
export default function CaptionedTextField({label="", variant="filled", sx={}, onTextChanged, rows=1}){

    return (
        <Stack sx={{...sx}}> 
            <StyledCaption>{label}</StyledCaption>

            <TextField 
                multiline={rows > 1}
                variant={variant} 
                minRows={rows}
                maxRows={rows}
                sx={{
                    ...defaultTextFieldSx
                }}
                onChange={(e) => { onTextChanged(e.target.value) }}
            />

        </Stack>
    )
}