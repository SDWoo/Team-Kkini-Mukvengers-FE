import { Box, ChakraProvider, Flex } from '@chakra-ui/react';
import Header from 'components/common/Layout/Header';
import Navigation from 'components/common/Layout/Navigation';
import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <ChakraProvider resetCSS>
      <Flex flexDirection='column' id='app'>
        <Header />
        <Box as='main' flex={1}>
          {children}
        </Box>
        <Navigation />
      </Flex>
    </ChakraProvider>
  );
};

export default Layout;