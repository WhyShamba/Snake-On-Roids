/* eslint-disable react-hooks/exhaustive-deps */
import { Flex, Text, useDisclosure, useToast } from '@chakra-ui/react';
import Peer from 'peerjs';
import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { MainContext } from '../../context';
import {
  useCountdown,
  useCountdownInfinete,
} from '../../custom-hooks/useCountdown';
import { useSetInterval } from '../../custom-hooks/useSetInterval';
import { useSnakeMovementImproved } from '../../custom-hooks/useSnakeMovement';
import { mainReducer } from '../../store/reducers/snakeReducer';
import { initialState, timerReducer } from '../../store/reducers/timerReducer';
import {
  CellData,
  DataType,
  DIRECTION,
  FoodCell,
  FoodType,
  MoveSnakeDataType,
  SnakeReducerActionType,
} from '../../types/types';
import { isOutOfBounds } from '../../utils/isOutOfBounds';
import { Node, SingleLinkedList } from '../../utils/SingleLinkedList';
import {
  getSnakeSpeedOnCreatine,
  getSnakeSpeedOnRoids,
} from '../../utils/snake/calculateSnakeSpeed';
import {
  generateDirectionMultiplayer,
  getFoodCell,
  getFoodType,
  getInitialSnakeCell,
  getInitialSnakeCellMultiplayer,
  getInitialSnakeProperties,
} from '../../utils/snake/initializers';
import { getNextNodeForDirection } from '../../utils/snake/snake-coordination';
import {
  growSnake,
  removeCells,
  reverseSnake,
} from '../../utils/snake/snakeManipulationMethods';
import { AvatarBar } from '../AvatarBar';
import { Controller } from '../Controller';
import { GameOverModalMultiplayer } from '../Multiplayer/GameOverModalMultiplayer';
import MultiplayerBoard from '../Multiplayer/MultiplayerBoard';

type MultiplayerGameProps = {
  connection: Peer.DataConnection;
  startGame: boolean;
  isGuest: boolean;
  activateInitialGetReadyModal: () => any;
  onConnectionLost: () => any;
  cancelGame: () => any;
};

const MultiplayerGameImproved: React.FC<MultiplayerGameProps> = ({
  connection,
  startGame,
  activateInitialGetReadyModal,
  isGuest,
  onConnectionLost,
  cancelGame,
}) => {
  // Global game settings
  const {
    disableController,
    multiplayer: {
      board,
      snakeSpeed: initialSnakeSpeed,
      gameDuration,
      withTimer,
    },
  } = useContext(MainContext);
  // Snake state
  const [timerState, timerDispatch] = useReducer(timerReducer, initialState);
  const [snakeState, snakeDispatch] = useReducer(mainReducer, {
    ...getInitialSnakeProperties(board, isGuest, true),
    foodCell: {
      value: getFoodCell(board),
      food: getFoodType(),
    },
    board,
    initialSnakeSpeed,
    isGuest: false,
    score: 0,
  });
  const snakeRef = useRef(
    new SingleLinkedList(new Node(getInitialSnakeCell(board)))
  );
  const { direction, setDirection } = useSnakeMovementImproved(
    snakeRef.current.head!.data!.direction,
    snakeState.snakeCells.length
  );
  const [gameOver, setGameOver] = useState(true);
  // Game over modal
  const { isOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  // Multiplayer
  const enemyCells = useRef<Set<number> | null>(null);
  const enemyFoodCell = useRef<typeof snakeState['foodCell'] | null>(null);
  const enemySnake = useRef<SingleLinkedList<CellData> | null>(null);
  const [playerWon, setPlayerWon] = useState(false);
  const playAgainWithPlayer = useRef({
    me: false,
    friend: false,
    scoreMe: 0,
    scoreEnemy: 0,
  });
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const toast = useToast();
  const {
    cancelCountdown: cancelGameCountdown,
    count: gameCountdown,
    startCount: startGameCountdown,
    resetCount: resetGameCountdown,
  } = useCountdown(gameDuration, false, sendTimeExpiredSignal);
  const { startTicks, stopTicks } = useCountdownInfinete(
    () =>
      timerDispatch({
        type: 'TICK',
      }),
    false
  );

  let snakeSpeed = initialSnakeSpeed;
  if (timerState.currentFoodEffect === 'steroid') {
    snakeSpeed = getSnakeSpeedOnRoids(snakeSpeed);
  } else if (timerState.currentFoodEffect === 'creatine') {
    snakeSpeed = getSnakeSpeedOnCreatine(snakeSpeed);
  }

  useSetInterval(() => {
    if (!gameOver) onMove();
  }, snakeSpeed);

  // Handling the multiplayer, on data recieve
  useEffect(() => {
    if (withTimer) {
      startGameCountdown();
    }
    connection.on('data', (data: DataType) => {
      if (data === 'LOST') {
        onPlayerWin();
      } else if (data === 'PLAY_AGAIN') {
        playAgainWithPlayer.current.friend = true;
        if (!playAgainWithPlayer.current.me) {
          toast({
            title: `Player wants to play again`,
            position: 'top',
            isClosable: true,
            duration: 5000,
            status: 'success',
          });
        }

        playAgain();
      } else {
        switch (data.type) {
          case 'MOVE_SNAKE':
            const dataObj: MoveSnakeDataType = JSON.parse(data.payload);
            // Set enemy data
            enemyCells.current = new Set(dataObj.cells);
            enemyFoodCell.current = dataObj.foodCell;
            enemySnake.current = dataObj.snake;
            break;

          default:
            break;
        }
      }
    });

    connection.on('close', () => {
      toast({
        title: `Player left the game...`,
        position: 'top',
        isClosable: true,
        duration: 2000,
        status: 'success',
      });
      setTimeout(() => {
        if (isGuest) {
          cancelGame();
        } else {
          onConnectionLost();
        }
      }, 2500);
    });
  }, []);

  // Used for handling counting model etc etc
  useEffect(() => {
    if (gameOver !== !startGame) {
      setGameOver(!startGame);
    }
    if (startGame) {
      startTicks();
    } else {
      stopTicks();
    }
  }, [startGame]);

  // Handle timer
  useEffect(() => {
    const foodDuration = timerState.foodCount;
    const { creatine, steroid } = timerState.effectsCount;

    if (foodDuration === 0 && !gameOver) {
      // generateFoodCell();
      snakeDispatch({ type: 'GENERATE_FOOD_CELL' });
    }

    if (creatine === 0) {
      onCreatineEffectOver();
    }

    if (steroid === 0) {
      onSteroidEffectOver();
    }
  }, [timerState.foodCount, timerState.effectsCount]);

  const snake = snakeRef.current;

  const onMove = () => {
    if (!isOutOfBounds(direction, snake, board)) {
      const newNode = getNextNodeForDirection(snake.head!, direction, board);

      // If it's not colliding
      if (
        !snakeState.snakeCells.includes(newNode.data!.value) &&
        !snakeState.enemy?.snakeCells?.includes(newNode.data!.value)
      ) {
        // remove tail
        let newSnakeCells = snakeState.snakeCells.filter(
          (cellValue) => cellValue !== snake.tail?.data.value
        );

        // add new head
        newSnakeCells.push(newNode.data.value);

        // fix links in snake
        snake.moveList(newNode);

        const foodConsumed = newNode.data.value === snakeState.foodCell.value;
        if (foodConsumed) {
          // Consume food
          snakeDispatch(onFoodConsumption(newSnakeCells));
          return;
        }
        snakeDispatch({
          type: 'MOVE_SNAKE',
          newSnakeCells,
          newScore: newSnakeCells.length - 1,
          foodEaten: null,
          sendMoveData,
        });
      } else {
        onPlayerLoss();
      }
    } else {
      onPlayerLoss();
      gameOverHandler();
    }
  };

  const onFoodConsumption = (
    newSnakeCells: number[]
  ): SnakeReducerActionType => {
    let foodEaten: FoodType | null = null;

    // Consume food
    if (
      snakeState.foodCell.food === 'protein' ||
      snakeState.foodCell.food === 'meat'
    ) {
      newSnakeCells = growSnake(snake, board, newSnakeCells);
    } else if (snakeState.foodCell.food === 'creatine') {
      newSnakeCells = growSnake(snake, board, newSnakeCells);

      // Add the effects
      if (timerState.currentFoodEffect !== 'steroid') {
        reverseSnake(snake);

        setDirection(snake.head?.data.direction!, false);
      }
    } else if (snakeState.foodCell.food === 'steroid') {
      for (let index = 0; index < 2; index++) {
        newSnakeCells = growSnake(snake, board, newSnakeCells);
      }
    }
    foodEaten = snakeState.foodCell.food;

    //   Reset timer for that food and global timer since food was confused
    timerDispatch({
      type: 'CONSUME_FOOD',
      food: snakeState.foodCell.food,
    });

    return {
      type: 'MOVE_SNAKE',
      foodEaten,
      newSnakeCells,
      newScore: newSnakeCells.length - 1,
      sendMoveData,
    };
  };

  const onPlayerWin = () => {
    playAgainWithPlayer.current.scoreMe += 1;
    setPlayerWon(true);
    gameOverHandler();
  };

  const onPlayerLoss = () => {
    sendLostSignal();
    setPlayerWon(false);
    gameOverHandler();
  };

  // Multiplayer methods
  const sendMoveData = (cells: Array<number>, foodCell: FoodCell) => {
    connection.send({
      type: 'MOVE_SNAKE',
      payload: JSON.stringify({
        cells: Array.from(cells),
        foodCell,
        snake: snakeRef.current,
      }),
    });
  };

  const sendLostSignal = () => {
    playAgainWithPlayer.current.scoreEnemy += 1;
    connection.send('LOST');
  };

  const sendPlayAgainSignal = () => {
    connection.send('PLAY_AGAIN');
  };

  function sendTimeExpiredSignal() {
    connection.send({
      type: 'TIME_EXPIRED',
      score: snakeState.snakeCells.length - 1,
    });
  }

  function gameOverHandler() {
    playAgainWithPlayer.current = {
      ...playAgainWithPlayer.current,
      me: false,
      friend: false,
    };

    // Turn off effects
    timerDispatch({ type: 'GAME_OVER' });

    if (withTimer) {
      cancelGameCountdown();
    }

    setGameOver(true);
    openModal();
  }

  // Reset the game to initial state
  const playAgain = () => {
    const iWantToPlay = playAgainWithPlayer.current.me;
    const friendWantsToPlay = playAgainWithPlayer.current.friend;
    // If both players agree to play
    if (iWantToPlay && friendWantsToPlay) {
      toast.closeAll();
      setPlayerWon(false);

      // Reset states
      playAgainWithPlayer.current = {
        ...playAgainWithPlayer.current,
        me: false,
        friend: false,
      };

      snakeRef.current = new SingleLinkedList(
        new Node(getInitialSnakeCellMultiplayer(board, isGuest))
      );

      timerDispatch({ type: 'PLAY_AGAIN' });
      snakeDispatch({ type: 'PLAY_AGAIN' });

      if (withTimer) {
        resetGameCountdown();
      }

      setDirection(generateDirectionMultiplayer(isGuest));

      setWaitingForPlayer(false);

      closeModal();

      // This will refresh and activate the initial modal
      activateInitialGetReadyModal();
    }
  };

  return (
    <>
      <AvatarBar
        effects={timerState.effectsCount}
        score={snakeState.score}
        untilNextFood={timerState.foodCount}
      />
      {/* Need to add multiplayer, enemy cell */}
      <Flex
        direction='column'
        align='center'
        boxShadow='lg'
        borderRadius='md'
        border='1px solid #ffffff0a'
        p={{ base: 2, lg: 10 }}
        w={{ base: '95%', lg: 'auto' }}
        bg='primary.main'
        zIndex={1}
        className='parent-board'
        pos='relative'
      >
        {withTimer && (
          <Text top={-16} pos='absolute' fontSize='lg'>
            Game Ends In: {gameCountdown}
          </Text>
        )}
        <Text top={-8} pos='absolute' fontSize='lg'>
          Score:{' '}
          <b>
            {playAgainWithPlayer.current.scoreMe} -{' '}
            {playAgainWithPlayer.current.scoreEnemy}
          </b>
        </Text>
        <Text top={-8} pos='absolute' fontSize='lg'>
          Score:{' '}
          <b>
            {playAgainWithPlayer.current.scoreMe} -{' '}
            {playAgainWithPlayer.current.scoreEnemy}
          </b>
        </Text>
        <MultiplayerBoard
          board={board}
          foodCell={snakeState.foodCell}
          // enemyFoodCell={enemyFoodCell.current}
          snakeCells={snakeState.snakeCells}
          // enemyCells={enemyCells.current}
          snake={snake}
          // enemySnakeRef={enemySnake}
        />
      </Flex>
      <Controller
        changeDirection={useCallback(
          (_direction: DIRECTION) => setDirection(_direction),
          []
        )}
        currentDirection={direction}
        disable={disableController}
      />
      <GameOverModalMultiplayer
        isOpen={isOpen}
        onClose={closeModal}
        score={snakeState.score}
        onPlayAgain={() => {
          playAgainWithPlayer.current.me = true;

          setWaitingForPlayer(true);

          // Notify other peer
          sendPlayAgainSignal();

          playAgain();
        }}
        onMenuClick={cancelGame}
        playerWon={playerWon}
        loading={waitingForPlayer}
      />
    </>
  );

  // Side effects that can happen
  function onCreatineEffectOver() {
    if (timerState.currentFoodEffect !== 'steroid' && !gameOver) {
      // Side effects for creatine
      reverseSnake(snake);
      setDirection(snake.head!.data.direction);
    }
  }

  function onSteroidEffectOver() {
    if (!gameOver) {
      if (snakeState.snakeCells.length > 1) {
        const newSnakeCells = removeCells(snakeState.snakeCells, snake, 3);
        snakeDispatch({ type: 'STEROID_SIDE_EFFECT', newSnakeCells });
      }
    }
  }
};

export default MultiplayerGameImproved;
