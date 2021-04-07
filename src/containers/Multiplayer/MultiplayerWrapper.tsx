/* eslint-disable react-hooks/exhaustive-deps */
import { Text, useDisclosure } from '@chakra-ui/react';
import Peer from 'peerjs';
import React, { useEffect, useState } from 'react';
import { MultiplayerSettingsType, SettingsType } from '../../App';
import { MenuModal } from '../../components/MenuModal';
import { GetReadyModal } from '../../components/Multiplayer/GetReadyModal';
import { useCountdown } from '../../custom-hooks/useCountdown';
import MultiplayerGame from './MultiplayerGame';

const MultiplayerWrapper: React.FC<
  MultiplayerSettingsType & {
    cancelGame: () => any;
    boardSettings: SettingsType;
  }
> = ({ peer, peerId, connectionPeerId, cancelGame, boardSettings }) => {
  const [connection, setConnection] = useState<null | Peer.DataConnection>(
    null
  );
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { count, resetCount } = useCountdown(3, onClose);

  const isCreator = !connectionPeerId;
  useEffect(() => {
    if (isCreator) {
      peer.on('connection', (conn) => {
        conn.on('open', () => {
          setConnection(conn);
          // Open the modal
          activateInitialGetReadyModal();

          // Send the board settings
          conn.send({ type: 'SET_SETTINGS', boardSettings });
        });
      });
    } else {
      // If user presses join game
      const conn = peer.connect(connectionPeerId!);
      conn.on('open', () => {
        setConnection(conn);
        activateInitialGetReadyModal();
      });
    }
  }, []);

  const activateInitialGetReadyModal = () => {
    onOpen();
    resetCount();
  };

  return connection ? (
    <>
      <MultiplayerGame
        connection={connection}
        startGame={!isOpen}
        activateInitialGetReadyModal={activateInitialGetReadyModal}
      />
      <GetReadyModal isOpen={isOpen} count={count} onClose={onClose} />
    </>
  ) : isCreator ? (
    <MenuModal
      headerText='Waiting for player to join...'
      isOpen={true}
      onClose={cancelGame}
    >
      <Text fontSize='xl' textAlign='center' mb={4}>
        Send this code to other player:
      </Text>
      <Text
        fontSize='xl'
        textAlign='center'
        fontWeight='bold'
        p={4}
        boxShadow='xl'
        border='1px solid white'
        borderColor='primary.borderColor'
        borderRadius='md'
        mb={4}
      >
        {peerId}
      </Text>
      <Text fontSize='sm' textAlign='center' mb={4} color='gray.500'>
        (Game starts as soon as other player joins)
      </Text>
    </MenuModal>
  ) : (
    <Text>Joining...</Text>
  );
};

export default MultiplayerWrapper;
