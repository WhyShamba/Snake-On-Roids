import { Box, Flex } from '@chakra-ui/layout';
import { useDisclosure, Text } from '@chakra-ui/react';
import Peer from 'peerjs';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { MultiplayerSettingsType } from '../../App';
import { AvatarBar } from '../../components/AvatarBar';
import { FoodCell } from '../../components/Cells/FoodCell';
import { HeadCell } from '../../components/Cells/HeadCell';
import { StandardCell } from '../../components/Cells/StandardCell';
import { TailCell } from '../../components/Cells/TailCell';
import { Controller } from '../../components/Controller';
import { GameOverModal } from '../../components/GameOverModal';
import { MenuModal } from '../../components/MenuModal';
import { GetReadyModal } from '../../components/Multiplayer/GetReadyModal';
import {
  CREATINE_EFFECT_DURATION,
  FOOD_DURATION,
  STEROID_EFFECT_DURATION,
} from '../../consts';
import { MainContext } from '../../context';
import { useCountdown } from '../../custom-hooks/useCountdown';
import { useSetInterval } from '../../custom-hooks/useSetInterval';
import { useSnakeMovement } from '../../custom-hooks/useSnakeMovement';
import { generateRandomNum } from '../../utils/generateRandomNum';
import { Node, SingleLinkedList } from '../../utils/SingleLinkedList';
import {
  getSnakeSpeedOnCreatine,
  getSnakeSpeedOnRoids,
} from '../../utils/snake/calculateSnakeSpeed';
import {
  getFoodCell,
  getFoodType,
  getInitialSnakeCell,
} from '../../utils/snake/initializers';
import {
  changeDirection,
  getNextNodeForDirection,
  getOppositeDirection,
} from '../../utils/snake/snake-coordination';
import MultiplayerGame from './MultiplayerGame';

export type FoodType = 'protein' | 'meat' | 'steroid' | 'creatine';
export type CellData = {
  row: number;
  cell: number;
  value: number;
  direction: DIRECTION;
};

// values are 0, 1, 2, 3
export enum DIRECTION {
  LEFT,
  UP,
  RIGHT,
  DOWN,
}

const MultiplayerWrapper: React.FC<
  MultiplayerSettingsType & { cancelGame: () => any }
> = ({ peer, peerId, connectionPeerId, cancelGame }) => {
  const [connection, setConnection] = useState<null | Peer.DataConnection>(
    null
  );
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { count, resetCount } = useCountdown(3, onClose);

  console.log('Connection peer id: ', connectionPeerId);
  const isCreator = !connectionPeerId;
  // If he presses join game
  useEffect(() => {
    if (isCreator) {
      peer.on('connection', (conn) => {
        setConnection(conn);
        //   Open the modal
        activateInitialGetReadyModal();
      });
    } else {
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
