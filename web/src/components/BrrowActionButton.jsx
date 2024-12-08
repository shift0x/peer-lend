import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { StyledFab } from './StyledFab';

const defaultFloatingActionButtonStyle = {
    backgroundColor: "rgb(2, 122, 242)",
    color: "#eee",
    '&:hover': {
      backgroundColor: 'rgb(2, 122, 242)',
    },
}

export default function BorrowActionButton({variant="extended", size="medium", sx={}, ...props}) {
    return (
        <StyledFab variant={variant} size={size} sx={{
                ...defaultFloatingActionButtonStyle,
                ...sx
            }} {...props}>
            <AccountBalanceIcon sx={{ fontSize: '17px'}} /> &nbsp; New Loan Request
        </StyledFab>
    )
}