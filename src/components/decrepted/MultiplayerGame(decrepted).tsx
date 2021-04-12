/* eslint-disable react-hooks/exhaustive-deps */
import { useDisclosure, useToast, Text, Flex } from '@chakra-ui/react';
import Peer from 'peerjs';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AvatarBar } from '../AvatarBar';
import { Controller } from '../Controller';
import { GameOverModalMultiplayer } from '../Multiplayer/GameOverModalMultiplayer';
import {
  CREATINE_EFFECT_DURATION,
  FOOD_DURATION,
  STEROID_EFFECT_DURATION,
} from '../../consts';
import { MainContext } from '../../context';
import { useCountdown } from '../../custom-hooks/useCountdown';
import { useSetInterval } from '../../custom-hooks/useSetInterval';
import { useSnakeMovement } from '../../custom-hooks/useSnakeMovement';
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
} from '../../utils/snake/initializers';
import {
  changeDirection,
  getNextNodeForDirection,
  getOppositeDirection,
} from '../../utils/snake/snake-coordination';
import MultiplayerBoard from '../Multiplayer/MultiplayerBoard(decrepted)';
import {
  CellData,
  DataType,
  DIRECTION,
  FoodType,
  MoveSnakeDataType,
} from '../../types/types';

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
      setMultiplayerBoardSettings,
      gameDuration,
      withTimer,
    },
  } = useContext(MainContext);
  const snakeRef = useRef(
    new SingleLinkedList(
      new Node(getInitialSnakeCellMultiplayer(board, isGuest))
    )
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snakeRef.current.head?.data?.value || 1])
  );
  const { direction, setDirection, snakeCellsSizeRef } = useSnakeMovement(
    snakeRef.current.head!.data!.direction
  );
  const [foodCell, setFoodCell] = useState({
    value: getFoodCell(board),
    food: getFoodType(),
  });
  const steroidConsumedRef = useRef(false);
  const {
    count: steroidEffectDuration,
    resetCount: resetSteroidEffectDuration,
    cancelCountdown: cancelSteroidEffectDuration,
  } = useCountdown(0, true, onSteroidEffectOver);
  const {
    count: creatineEffectDuration,
    resetCount: resetCreatineEffectDuration,
    cancelCountdown: cancelCreatineEffectDuration,
  } = useCountdown(0, true, onCreatineEffectOver);
  const [gameOver, setGameOver] = useState(true);
  const { isOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const {
    count: foodDuration,
    resetCount: resetFoodDuration,
    startCount: startFoodDuration,
    cancelCountdown: cancelFoodDuration,
  } = useCountdown(FOOD_DURATION, false, () => {
    if (!gameOver) {
      generateFoodCell();
      resetFoodDuration();
    }
  });
  const snakeFoodConsumed = useRef<FoodType>();
  const effects = useRef<{ [food: string]: number | null }>({});
  // Multiplayer
  const enemyCells = useRef<Set<number> | null>(null);
  const enemyFoodCell = useRef<typeof foodCell | null>(null);
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

  let snakeSpeed = initialSnakeSpeed;
  if (steroidConsumedRef.current) {
    snakeSpeed = getSnakeSpeedOnRoids(snakeSpeed);
  } else if (
    snakeFoodConsumed.current === 'creatine' ||
    creatineEffectDuration
  ) {
    snakeSpeed = getSnakeSpeedOnCreatine(snakeSpeed);
  }

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
            // case 'TIME_EXPIRED':
            if (data.score >= snakeCells.size - 1) {
              onPlayerWin();
            } else {
              onPlayerLose();
            }
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
    if (startGame) startFoodDuration();
  }, [startGame]);

  useEffect(() => {
    snakeRef.current = new SingleLinkedList(
      new Node(getInitialSnakeCellMultiplayer(board, isGuest))
    );
  }, [board]);

  useSetInterval(() => {
    if (!gameOver) moveSnake();
  }, snakeSpeed);

  useEffect(() => {
    if (
      steroidEffectDuration &&
      steroidEffectDuration !== effects.current['steroid']
    ) {
      effects.current['steroid'] = steroidEffectDuration;
    }
    if (
      creatineEffectDuration &&
      creatineEffectDuration !== effects.current['creatine']
    ) {
      effects.current['creatine'] = creatineEffectDuration;
    }
  }, [steroidEffectDuration, creatineEffectDuration]);

  const snake = snakeRef.current;

  const isOutOfBounds = () => {
    switch (direction) {
      case DIRECTION.RIGHT:
        if (snake.head!.data!.cell + 1 === board[0].length) {
          gameOverHandler();
          return true;
        }
        break;
      case DIRECTION.LEFT:
        if (snake.head!.data!.cell - 1 < 0) {
          gameOverHandler();
          return true;
        }
        break;
      case DIRECTION.UP:
        if (snake.head!.data!.row - 1 < 0) {
          gameOverHandler();
          return true;
        }
        break;
      default:
        // case DIRECTION.DOWN
        if (snake.head!.data!.row + 1 === board[0].length) {
          gameOverHandler();
          return true;
        }
        break;
    }
    return false;
  };

  const onPlayerWin = () => {
    playAgainWithPlayer.current.scoreMe += 1;
    setPlayerWon(true);
    gameOverHandler();
  };

  const onPlayerLose = () => {
    setPlayerWon(false);
    gameOverHandler();
  };

  // Multiplayer methods
  const sendData = (cells: Set<number>) => {
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
      score: snakeCells.size - 1,
    });
  }

  const moveSnake = () => {
    if (!isOutOfBounds()) {
      const newNode = getNextNodeForDirection(snake.head!, direction, board);

      // If it's not colliding
      if (
        !snakeCells.has(newNode.data!.value) &&
        !enemyCells.current?.has(newNode.data!.value)
      ) {
        const newSnakeCells = changeDirection(newNode, snake, snakeCells);

        const foodConsumed = newNode.data!.value === foodCell.value;
        if (foodConsumed) {
          consumeFood(newSnakeCells);
        }

        snakeCellsSizeRef.current = newSnakeCells.size;

        setSnakeCells(newSnakeCells);
        sendData(newSnakeCells);
      } else {
        sendLostSignal();
        gameOverHandler();
      }
    } else {
      sendLostSignal();
      gameOverHandler();
    }
  };

  const generateFoodCell = () => {
    // TODO: WRITE ALGORITHAM THAT REMOVES THE VALUES WHERE THE SNAKE IS FROM THE BOARD IT SELF, BECAUSE IF SNAKE GETS TOO BIG IT WILL BE IMPOSSIBLE, LAG TO GENERATE RANDDOM NUM, SINCE THE SNAKE WILL COVER EVERYTHING
    // Generate food cell at random position
    let value = getFoodCell(board);

    while (snakeCells.has(value) || value === foodCell.value) {
      value = getFoodCell(board);
    }

    let food: FoodType = getFoodType();

    setFoodCell({
      food,
      value,
    });
  };

  function gameOverHandler() {
    playAgainWithPlayer.current = {
      ...playAgainWithPlayer.current,
      me: false,
      friend: false,
    };

    cancelFoodDuration();

    // Turn off effects
    if (steroidConsumedRef.current) {
      steroidConsumedRef.current = false;

      cancelSteroidEffectDuration();
    }
    if (creatineEffectDuration) {
      cancelCreatineEffectDuration();
    }
    if (withTimer) {
      cancelGameCountdown();
    }

    effects.current = {};

    setGameOver(true);
    openModal();
  }

  function removeCells(count: number) {
    const newSnakeCells = new Set(snakeCells);

    const removeCellsNumber =
      newSnakeCells.size - count > 1 ? newSnakeCells.size - count : 1;
    while (newSnakeCells.size !== removeCellsNumber) {
      const removedTail = snake.deque();
      newSnakeCells.delete(removedTail!.data!.value);
    }

    steroidConsumedRef.current = false;
    setSnakeCells(newSnakeCells);
  }

  function growSnake(newSnakeCells: Set<number>) {
    const oppositeDirOfTail = getOppositeDirection(snake.tail!.data!.direction);
    const newTailNode = getNextNodeForDirection(
      snake.tail!,
      oppositeDirOfTail,
      board
    );

    // After creation of new node make sure the direction is set to the appropriate directiont
    newTailNode.data!.direction = snake.tail!.data!.direction;
    // Insertion at beginning of tail
    const temp = snake.tail;
    snake.tail = newTailNode;
    snake.tail.next = temp;

    newSnakeCells.add(newTailNode.data!.value);
  }

  // Grow the snake and do the effect
  const consumeFood = (newSnakeCells: Set<number>) => {
    if (foodCell.food === 'protein' || foodCell.food === 'meat') {
      growSnake(newSnakeCells);

      effects.current[foodCell.food] = Infinity;

      snakeFoodConsumed.current = 'protein';
    } else if (foodCell.food === 'creatine') {
      growSnake(newSnakeCells);

      // Add the effects
      if (!steroidConsumedRef.current) {
        reverseSnake();
        resetCreatineEffectDuration(CREATINE_EFFECT_DURATION);

        // Add the duration
        effects.current['creatine'] = CREATINE_EFFECT_DURATION;
      }

      snakeFoodConsumed.current = 'creatine';
    } else if (foodCell.food === 'steroid') {
      for (let index = 0; index < 2; index++) {
        growSnake(newSnakeCells);
      }

      snakeFoodConsumed.current = 'steroid';
      steroidConsumedRef.current = true;
      resetSteroidEffectDuration(STEROID_EFFECT_DURATION);
    }

    resetFoodDuration();
    // generate new food cell
    generateFoodCell();
  };

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

      enemyCells.current = null;
      enemySnake.current = null;
      enemyFoodCell.current = null;

      // setSnakeCells(new Set([snake.head!.data!.value]));
      setSnakeCells(new Set([snakeRef.current.head!.data!.value]));

      const newFoodCell = {
        value: getFoodCell(board),
        food: getFoodType(),
      };
      setFoodCell(newFoodCell);
      snakeFoodConsumed.current = undefined;

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

  function onCreatineEffectOver() {
    delete effects.current['creatine'];

    if (!steroidConsumedRef.current && !gameOver) {
      // Side effects for creatine
      reverseSnake();
    }
  }

  function onSteroidEffectOver() {
    if (!gameOver) {
      delete effects.current['steroid'];

      if (steroidConsumedRef.current && snakeCells.size > 1) {
        // console.log(
        //   `Mssg to display: You haven't consumed steroids in the last 30 sec, you will shrink`
        // );

        removeCells(3);
      }
    }
  }

  const score = snakeCells.size - 1;

  return (
    <>
      <AvatarBar
        effects={effects.current}
        score={score}
        untilNextFood={foodDuration}
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
          foodCell={foodCell}
          enemyFoodCell={enemyFoodCell.current}
          snakeCells={snakeCells}
          enemyCells={enemyCells.current}
          snakeRef={snakeRef}
          enemySnakeRef={enemySnake}
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
        score={score}
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

  function reverseSnake() {
    snake.reverse((reversedNode) => {
      // Algorithm for determining which node is transitional and adding the right direction to it. Check the SingleLinkedList test case for detailed explanation
      const nextNodeDirection = reversedNode.next?.data?.direction;
      const currentNodeDirection = reversedNode.data!.direction;
      const isTransitional = currentNodeDirection !== nextNodeDirection;

      if (isTransitional && nextNodeDirection !== undefined) {
        reversedNode.data!.direction = getOppositeDirection(nextNodeDirection);
      } else {
        reversedNode.data!.direction = getOppositeDirection(
          currentNodeDirection
        );
      }
    });

    setDirection(snake.head!.data!.direction, false);
  }
};

export default MultiplayerGame;
