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
import { AvatarBar } from '../../components/AvatarBar';
import { Controller } from '../../components/Controller';
import { GameOverModalMultiplayer } from '../../components/Multiplayer/GameOverModalMultiplayer';
import MultiplayerBoard from '../../components/Multiplayer/MultiplayerBoard';
import { MainContext } from '../../context';
import {
  useCountdown,
  useCountdownInfinete,
} from '../../custom-hooks/useCountdown';
import { useSetInterval } from '../../custom-hooks/useSetInterval';
import { useSnakeMovementImproved } from '../../custom-hooks/useSnakeMovement';
import {
  gameReducer,
  gameStoreInitialState,
} from '../../store/reducers/gameReducer';
import { mainReducer } from '../../store/reducers/snakeReducer';
import { initialState, timerReducer } from '../../store/reducers/timerReducer';
import {
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
  getInitialSnakeCellMultiplayer,
  getInitialSnakeProperties,
} from '../../utils/snake/initializers';
import { getNextNodeForDirection } from '../../utils/snake/snake-coordination';
import {
  growSnake,
  removeCells,
  reverseSnake,
} from '../../utils/snake/snakeManipulationMethods';

type MultiplayerGameProps = {
  connection: Peer.DataConnection;
  startGame: boolean;
  isGuest: boolean;
  activateInitialGetReadyModal: () => any;
  onConnectionLost: () => any;
  cancelGame: () => any;
};

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
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
  const [{ gameOver, ...gameState }, gameDispatch] = useReducer(
    gameReducer,
    gameStoreInitialState
  );
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
    new SingleLinkedList(
      new Node(getInitialSnakeCellMultiplayer(board, isGuest))
    )
  );
  const { direction, setDirection } = useSnakeMovementImproved(
    snakeRef.current.head!.data!.direction,
    snakeState.snakeCells.length
  );
  // Game over modal
  const { isOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  // Multiplayer
  const toast = useToast();
  // Handle the gameCountdown
  const {
    cancelCountdown: cancelGameCountdown,
    count: gameCountdown,
    startCount: startGameCountdown,
    resetCount: resetGameCountdown,
  } = useCountdown(gameDuration, false, sendTimeExpiredSignal);
  // Timer for TICKs
  const { startTicks, stopTicks } = useCountdownInfinete(
    () =>
      timerDispatch({
        type: 'TICK',
      }),
    false
  );
  const showMessage = useRef(true);

  let snakeSpeed = initialSnakeSpeed;
  if (timerState.currentFoodEffect === 'steroid') {
    snakeSpeed = getSnakeSpeedOnRoids(snakeSpeed);
  } else if (timerState.currentFoodEffect === 'creatine') {
    snakeSpeed = getSnakeSpeedOnCreatine(snakeSpeed);
  }

  useSetInterval(() => {
    if (!gameOver) onMove();
  }, snakeSpeed);

  // Used for handling counting model etc etc
  useEffect(() => {
    if (gameOver !== !startGame) {
      gameDispatch({ type: 'SET_GAME_OVER', gameOver: !startGame });
    }

    if (!startGame && isOpen) closeModal();
  }, [startGame]);

  useEffect(() => {
    if (!gameOver) {
      startTicks();
      toast.closeAll();
    } else {
      stopTicks();
    }
  }, [gameOver]);

  // Wait for play again approval
  useEffect(() => {
    if (gameState.multiplayerStats.playAgain.approved) playAgain();
  }, [gameState.multiplayerStats.playAgain.approved]);

  // Handling the multiplayer, on data recieve
  useEffect(() => {
    if (withTimer) {
      startGameCountdown();
    }
    connection.on('data', (data: DataType) => {
      if (data === 'LOST') {
        onPlayerWin();
      } else if (data === 'PLAY_AGAIN') {
        toast({
          title: `Player wants to play again`,
          position: 'top',
          isClosable: true,
          duration: 5000,
          status: 'success',
        });
        gameDispatch({
          type: 'PLAY_AGAIN_REQUEST',
          byMe: false,
          // Causes warning
          // notifyPlayer: () =>
          //   toast({
          // ......
          //   }),
        });
      } else {
        switch (data.type) {
          case 'MOVE_SNAKE':
            const {
              cells,
              foodCell,
              snake: _enemySnake,
            }: MoveSnakeDataType = JSON.parse(data.payload);
            snakeDispatch({
              type: 'SET_ENEMY_INFO',
              enemyCells: cells,
              enemySnake: _enemySnake,
              enemyFoodCell: foodCell,
            });
            break;

          case 'TIME_EXPIRED':
            if (data.score >= snakeState.score) {
              onPlayerWin();
            } else {
              onPlayerLoss();
            }
            break;

          default:
            break;
        }
      }
    });

    connection.on('close', () => {
      if (showMessage.current) {
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
      }
    });

    // Cleanup
    const cleanUp = () => {
      showMessage.current = false;
      // Close the webRtc connection, so other peer gets notified
      connection.close();
    };

    window.addEventListener('beforeunload', cleanUp);

    return () => {
      // This might cause memory leaks
      toast.closeAll();

      cleanUp();
      window.removeEventListener('beforeunload', cleanUp);
    };
  }, []);

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
    gameDispatch({ type: 'ON_PLAYER_WIN' });
    gameOverHandler();
  };

  const onPlayerLoss = () => {
    gameDispatch({ type: 'ON_PLAYER_LOSS' });
    sendLostSignal();
    gameOverHandler();
  };

  function gameOverHandler() {
    gameDispatch({ type: 'GAME_OVER' });

    // Turn off effects
    timerDispatch({ type: 'GAME_OVER' });

    if (withTimer) {
      cancelGameCountdown();
    }

    // setGameOver(true);
    openModal();
  }

  // Reset the game to initial state
  const playAgain = () => {
    toast.closeAll();
    // If both players agree to play

    snakeRef.current = new SingleLinkedList(
      new Node(getInitialSnakeCellMultiplayer(board, isGuest))
    );

    gameDispatch({ type: 'PLAY_AGAIN' });
    timerDispatch({ type: 'PLAY_AGAIN' });
    snakeDispatch({ type: 'PLAY_AGAIN', sendInitialSnakePosition });

    if (withTimer) {
      resetGameCountdown();
    }

    setDirection(generateDirectionMultiplayer(isGuest));

    closeModal();

    // This will refresh and activate the initial modal
    activateInitialGetReadyModal();
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
            {gameState.multiplayerStats.scores.scoreMe} -{' '}
            {gameState.multiplayerStats.scores.scoreEnemy}
          </b>
        </Text>
        <MultiplayerBoard
          board={board}
          foodCell={snakeState.foodCell}
          snakeCells={snakeState.snakeCells}
          snake={snake}
          enemySnakeRef={snakeState.enemy?.snake}
          enemyFoodCell={snakeState.enemy?.foodCell}
          enemyCells={snakeState.enemy?.snakeCells}
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
        onPlayAgain={() =>
          gameDispatch({
            type: 'PLAY_AGAIN_REQUEST',
            byMe: true,
            sendPlayAgainSignal,
          })
        }
        onMenuClick={cancelGame}
        playerWon={gameState.playerWon}
        loading={gameState.multiplayerStats.playAgain.loading}
      />
    </>
  );

  // WebRTC, Multiplayer methods (good idea is to add them to new file)
  function sendMoveData(cells: Array<number>, foodCell: FoodCell) {
    connection.send({
      type: 'MOVE_SNAKE',
      payload: JSON.stringify({
        cells: cells,
        foodCell,
        snake: snakeRef.current,
      }),
    });
  }

  function sendInitialSnakePosition(foodCell: FoodCell) {
    connection.send({
      type: 'MOVE_SNAKE',
      payload: JSON.stringify({
        cells: [snakeState.snake.head!.data.value],
        foodCell,
        snake: snakeState.snake,
      }),
    });
  }

  function sendLostSignal() {
    connection.send('LOST');
  }

  function sendPlayAgainSignal() {
    connection.send('PLAY_AGAIN');
  }

  function sendTimeExpiredSignal() {
    connection.send({
      type: 'TIME_EXPIRED',
      score: snakeState.snakeCells.length - 1,
    });
  }
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

export default MultiplayerGame;
