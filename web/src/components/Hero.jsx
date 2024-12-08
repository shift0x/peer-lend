import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {highlightedText} from '../assets/styles/highlight-text'

export default function Hero() {
  return (
    <Box id="hero">
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 0, sm: 0 },
          pb: { xs: 3, sm: 5 },
          pl: 0,
          pr: 0
        }}
      >
        <Stack
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '100%' } }}
        >
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: '4rem',
              fontFamily: "Poppins",
              fontWeight: 600,
            }}
          >
            <span style={highlightedText}>&nbsp;Peer2Peer&nbsp;</span>Credit Based Lending
          </Typography>
          <Typography
            variant="body1"
            sx={{
                fontFamily: "Poppins",
                textAlign: "center",
                fontSize: "1.3em",
                color: "#666",
                lineHeight: 1.6
            }}
          >
            borrow & lend using on-chain credit and reputation with transparent market driven interest rates. <br /> Powered by Request Network.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}