import { Button, ButtonProps, Flex, Heading, VStack } from '@chakra-ui/react';
import React from 'react';

interface MenuProps {
  onPlayGame: () => any;
}

export const Menu: React.FC<MenuProps> = ({ onPlayGame }) => {
  const commonButtonStyle: ButtonProps = {
    w: 'full',
    bg: '#732c2c',

    _hover: {
      bg: '#521f1f',
    },
  };
  return (
    <Flex
      direction='column'
      boxShadow='lg'
      borderRadius='md'
      border='1px solid #ffffff0a'
      p={10}
      bg='primary.main'
      zIndex={1}
      w='80%'
      maxW='450px'
    >
      <Heading textAlign='center' mb={14}>
        Snake On Roids
      </Heading>
      <VStack w='100%' spacing={5}>
        <Button {...commonButtonStyle} onClick={onPlayGame}>
          Play Game
        </Button>
        <Button {...commonButtonStyle}>Instructions</Button>
        <Button {...commonButtonStyle}>Settings</Button>
        <Button w='full' bg='#521f1f' disabled _hover={{ bg: '#521f1f' }}>
          Multiplayer (SOON)
        </Button>
      </VStack>
    </Flex>
  );
};
