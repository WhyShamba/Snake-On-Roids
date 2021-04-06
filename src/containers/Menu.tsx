import {
  Button,
  ButtonProps,
  Flex,
  Heading,
  useDisclosure,
  VStack,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { Instructions } from '../components/Instructions/Instructions';
import { Settings } from '../components/Settings/Settings';
import Peer from 'peerjs';
import { Multiplayer } from '../components/Multiplayer/Multiplayer';

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
          {/* // TODO: Add  modal that lets you join or create a game*/}
          <Button {...commonButtonStyle} onClick={openMultiplayer}>
            Multiplayer
          </Button>
          <Button w='full' bg='#521f1f' disabled _hover={{ bg: '#521f1f' }}>
            Leaderboard (SOON)
          </Button>
          <Button
            w='full'
            bg='#521f1f'
            _hover={{ bg: '#521f1f' }}
            onClick={() => {
              const peer = new Peer();
              peer.on('open', function (id) {
                console.log('My peer ID is: ' + id);
              });

              peer.on('connection', (conn) => {
                conn.on('data', (data) => {
                  // Will print 'hi!'
                  console.log(data);
                });
                conn.on('open', () => {
                  conn.send('hello!');
                });
              });
            }}
          >
            TEST 1 (SOON)
          </Button>
          <Button
            w='full'
            bg='#521f1f'
            _hover={{ bg: '#521f1f' }}
            onClick={() => {
              const peer = new Peer();
              peer.on('open', () => {
                const con = peer.connect(
                  'f62f3ba8-0316-40a0-8e6f-96f6760e4cdf'
                );
                con.on('open', () => {
                  con.send('Gay shit');
                });
              });
            }}
          >
            TEST 2 (SOON)
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
