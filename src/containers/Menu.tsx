import {
  Button,
  ButtonProps,
  Flex,
  Heading,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { Instructions } from '../components/Instructions/Instructions';
import { Multiplayer } from '../components/Multiplayer/Multiplayer';
import { Settings } from '../components/Settings/Settings';

interface MenuProps {
  onPlayGame: () => any;
  handleMultiplayer: () => any;
}

export const Menu: React.FC<MenuProps> = React.memo(
  ({ onPlayGame, handleMultiplayer }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
      isOpen: isOpenSettings,
      onOpen: openSettings,
      onClose: closeSettings,
    } = useDisclosure();
    const {
      isOpen: isOpenMultiplayer,
      onOpen: openMultiplayer,
      onClose: closeMultiplayer,
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
          <Text fontSize='1.4rem' color='red.800'>
            (Beta 1.0.0)
          </Text>
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
          <Button {...commonButtonStyle} onClick={openMultiplayer}>
            Multiplayer (BETA)
          </Button>
          <Button w='full' bg='#521f1f' disabled _hover={{ bg: '#521f1f' }}>
            Leaderboard (SOON)
          </Button>
        </VStack>
        <Instructions isOpen={isOpen} onClose={onClose} />
        <Settings isOpen={isOpenSettings} onClose={closeSettings} />
        <Multiplayer
          isOpen={isOpenMultiplayer}
          onClose={closeMultiplayer}
          handleMultiplayer={handleMultiplayer}
        />
      </Flex>
    );
  }
);
