import React from 'react';
import { Divider, Box } from '@mui/material';
import SwapVerticalCircleIcon from '@mui/icons-material/SwapVerticalCircle';

const DividerWithIcon = ({sx={}, icon=<SwapVerticalCircleIcon color="primary" />}) => {
   
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', ...sx}}>
      <Divider sx={{ flexGrow: 1 }} />
      <Box sx={{ px: 2 }}>
            {icon}
      </Box>
      <Divider sx={{ flexGrow: 1 }} />
    </Box>
  );
};

export default DividerWithIcon;