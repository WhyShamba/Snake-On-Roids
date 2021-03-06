import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    primary: {
      main: '#171717',
      hover: '#393838',
      borderColor: '#ffffff0a',
    },
  },
  fonts: {
    body: 'Aldrich',
    heading: 'Aldrich',
  },
});

export default theme;
