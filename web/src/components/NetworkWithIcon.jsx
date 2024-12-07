import { Box } from "@mui/material"

const defaultBoxProps = {
    display: "inline-flex",
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: "capitalize"
}

const NetworkWithIcon = ({network, height="25px", width="25px", sx={}, ...props}) => {
    return (
        <Box sx={{
            ...defaultBoxProps,
            ...sx
        }} {...props}>
            <img src={network.icon} height={height} width={width} />&nbsp;{network.name}
        </Box>
    )
}

export default NetworkWithIcon 