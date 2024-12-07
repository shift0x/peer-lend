import { styled } from '@mui/material/styles';

const StyledBox = styled('div')(({ theme, height }) => ({
  alignSelf: 'center',
  width: '100%',
  height: height,
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  outline: '1px solid',
  boxShadow: '0 0 12px 8px hsla(220, 25%, 80%, 0.2)',
  outlineColor: 'hsla(220, 25%, 80%, 0.5)',
  backgroundSize: 'cover',
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(3),
    height: {height},
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 24px 12px hsla(210, 100%, 25%, 0.2)',
    outlineColor: 'hsla(210, 100%, 80%, 0.1)',
  }),
}));

export default StyledBox
