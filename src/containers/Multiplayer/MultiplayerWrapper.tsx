/* eslint-disable react-hooks/exhaustive-deps */
import { Text, useDisclosure } from '@chakra-ui/react';
import Peer from 'peerjs';
import React, { useEffect, useState } from 'react';
import { MultiplayerSettingsType } from '../../App';
import { MenuModal } from '../../components/MenuModal';
import { GetReadyModal } from '../../components/Multiplayer/GetReadyModal';
import { imagesToPrecache } from '../../consts';
import { useCountdown } from '../../custom-hooks/useCountdown';
import { GameDataType } from '../../types/types';
import { cacheImages } from '../../utils/cacheImages';
import MultiplayerGame from './MultiplayerGame';

const MultiplayerWrapper: React.FC<
  MultiplayerSettingsType & {
    cancelGame: () => any;
    boardSettings: MultiplayerSettingsType['settings'];
    setMultiplayerBoardSettings: (
      _settings: MultiplayerSettingsType['settings']
    ) => void;
  }
> = ({
  peer,
  peerId,
  connectionPeerId,
  cancelGame,
  boardSettings,
  setMultiplayerBoardSettings,
}) => {
  const [connection, setConnection] = useState<null | Peer.DataConnection>(
    null
  );
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { count, resetCount, setCount } = useCountdown(0, false, onClose);

  const isCreator = !connectionPeerId;
  useEffect(() => {
    if (isCreator) {
      peer!.on('connection', (conn) => {
        cacheImages(imagesToPrecache).then(() => {
          conn.on('open', () => {
            setConnection(conn);
            // Send the board settings
            conn.send({ type: 'SET_SETTINGS', boardSettings });

            conn.on('data', (data: GameDataType) => {
              if (data.type === 'UPDATE_COUNTDOWN') {
                activateInitialGetReadyModal(); // open modal

                // Syncing counts
                setCount(data.count);
              }
            });
          });
        });
      });
    } else {
      // If user presses join game
      const conn = peer!.connect(connectionPeerId!);
      let stopTimeout = false;

      cacheImages(imagesToPrecache).then(() => {
        conn.on('open', () => {
          // Wait for settings. The creator might need to wait longer test
          conn.on('data', (data: GameDataType) => {
            // signal to join the game
            if (typeof data === 'object' && data.type === 'SET_SETTINGS') {
              stopTimeout = true;
              setMultiplayerBoardSettings(data.boardSettings);
              setConnection(conn);
              activateInitialGetReadyModal();
            }
          });
        });
      });

      // IF user is joining, after 5 sec if not successfully joined -> disconnect him
      const timeout = setTimeout(() => {
        console.log('TIMEOUT', stopTimeout);
        if (!stopTimeout) cancelGame();
      }, 5000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    // if peer is guest
    if (!isCreator && connection) {
      // Syncing counts
      connection.send({ type: 'UPDATE_COUNTDOWN', count });
    }
  }, [count]);

  const activateInitialGetReadyModal = () => {
    onOpen();

    // Syncing counts, only the guest peer when is ready send countdown
    if (!isCreator) {
      resetCount(3);
    } else {
      // Is creator, on playagain start from 3 at beginning and not 0
      setCount(3);
    }
  };

  return connection ? (
    <>
      <MultiplayerGame
        connection={connection}
        startGame={!isOpen}
        activateInitialGetReadyModal={activateInitialGetReadyModal}
        isGuest={!!connectionPeerId}
        onConnectionLost={() => setConnection(null)}
        cancelGame={cancelGame}
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
