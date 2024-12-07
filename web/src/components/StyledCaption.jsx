import { styled, Typography } from "@mui/material";

const StyledTypography = styled(Typography)({
    pb: "3px",
    color: "#666"
})

const inputErrorStyle = {
    color: "red"
}

export const StyledCaption = ({ variant = 'caption', display = 'block', ...props }) => (
    <StyledTypography variant={variant} display={display} {...props} />
  );

export const ErrorCaption = ({error = null, sx={}}) => (
    <StyledCaption sx={{
        ...inputErrorStyle,
        ...sx
    }}>
            {error}
    </StyledCaption>
)

