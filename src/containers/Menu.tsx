import {
  Button,
  ButtonProps,
  Flex,
  Heading,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { Instructions } from '../components/Instructions/Instructions';
import { Settings } from '../components/Settings/Settings';

interface MenuProps {
  onPlayGame: () => any;
}

export const Menu: React.FC<MenuProps> = React.memo(({ onPlayGame }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenSettings,
    onOpen: openSettings,
    onClose: closeSettings,
  } = useDisclosure();

  const commonButtonStyle: ButtonProps = {
    w: 'full',
    bg: '#732c2c',

    _hover: {
      bg: '#521f1f',
    },

    _focus: {},
    _active: {},
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
      w='90%'
      maxW='450px'
    >
      <Heading textAlign='center' mb={14}>
        Snake On Roids
      </Heading>
      <VStack w='100%' spacing={5}>
        <Button {...commonButtonStyle} onClick={onPlayGame}>
          Play Game
        </Button>
        <Button {...commonButtonStyle} onClick={onOpen}>
          Instructions
        </Button>
        <Button {...commonButtonStyle} onClick={openSettings}>
          Settings
        </Button>
        <Button w='full' bg='#521f1f' disabled _hover={{ bg: '#521f1f' }}>
          Multiplayer (SOON)
        </Button>
      </VStack>
      <Instructions isOpen={isOpen} onClose={onClose} />
      <Settings isOpen={isOpenSettings} onClose={closeSettings} />
    </Flex>
  );
});
