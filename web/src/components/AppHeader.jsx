import * as React from 'react';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Link, useLocation } from "react-router-dom";

import { scrollToSection } from '../lib/navigation';
import Web3WalletConnection from '../features/web3-wallet-connection/Web3WalletConnection';
import { useMemo } from 'react';


function AppHeader() {
  const [open, setOpen] = React.useState(false);
  const [isHomepage, setIsHomepage] = React.useState(true);
  const location = useLocation();

  useMemo(() => {
    setIsHomepage(location.pathname == "/")
  }, [location])

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const scroll = (sectionId) => {
    scrollToSection(sectionId, () => {
      setOpen(false);
    })
  };


  return (
    <AppBar
      sx={{ boxShadow: 0, bgcolor: 'transparent', backgroundImage: 'none', mt: 2 }}
    >
      <Container maxWidth="lg">
        <Toolbar
          variant="regular"
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            maxHeight: 40,
            ml: -10,
            mr: -10
           
          })}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <Link to="/" style={{paddingTop: "5px"}}>
              <img src="/assets/images/chainfolio_logo.png"  style={{height: "35px"}} />
            </Link>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 0.5,
              alignItems: 'center',
            }}
          >
            <Web3WalletConnection active={!isHomepage} />  
        

            
          </Box>
          <Box sx={{ display: { sm: 'flex', md: 'none' } }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="top" open={open} onClose={toggleDrawer(false)}>
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ my: 3 }} />
                <MenuItem onClick={() => scroll('features')}>
                  Features
                </MenuItem>
                <MenuItem onClick={() => scroll('testimonials')}>
                  Testimonials
                </MenuItem>
                <MenuItem onClick={() => scroll('highlights')}>
                  Highlights
                </MenuItem>
                <MenuItem onClick={() => scroll('pricing')}>
                  Pricing
                </MenuItem>
                <MenuItem onClick={() => scroll('faq')}>FAQ</MenuItem>
                <MenuItem>
                  <Button color="primary" variant="contained" fullWidth>
                    Sign up
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button color="primary" variant="outlined" fullWidth>
                    Sign in
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}


export default AppHeader;
