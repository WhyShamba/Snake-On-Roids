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
import { GameOverModalMultiplayer } from '../../components/Multiplayer/GameOverModalMultiplayer';
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

const MultiplayerGame: React.FC<{
  connection: Peer.DataConnection;
  startGame: boolean;
  activateInitialGetReadyModal: () => any;
}> = ({ connection, startGame, activateInitialGetReadyModal }) => {
  // Global game settings
  const {
    togglePlayGame,
    snakeSpeed: initialSnakeSpeed,
    disableController,
    board,
  } = useContext(MainContext);
  const snakeRef = useRef(
    new SingleLinkedList(new Node(getInitialSnakeCell(board)))
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snakeRef.current.head?.data?.value || 1])
  );
  const { direction, setDirection, snakeCellsSizeRef } = useSnakeMovement(
    snakeRef.current.head!.data!.direction,
    snakeRef.current
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
  } = useCountdown(0, onSteroidEffectOver);
  const {
    count: creatineEffectDuration,
    resetCount: resetCreatineEffectDuration,
    cancelCountdown: cancelCreatineEffectDuration,
  } = useCountdown(0, onCreatineEffectOver);
  const [gameOver, setGameOver] = useState(true);
  const { isOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const {
    count: foodDuration,
    resetCount: resetFoodDuration,
    cancelCountdown: cancelFoodDuration,
  } = useCountdown(FOOD_DURATION, () => {
    if (!gameOver) {
      generateFoodCell();
      resetFoodDuration();
    }
  });
  const snakeFoodConsumed = useRef<FoodType>();
  const effects = useRef<{ [food: string]: number | null }>({});
  const cellRef = useRef<HTMLDivElement | null>(null);
  // Multiplayer
  const enemyCells = useRef<Set<number> | null>(null);
  const [playerWon, setPlayerWon] = useState(false);
  const playAgainWithPlayer = useRef<{ me: boolean; friend: boolean }>({
    me: false,
    friend: false,
  });
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);

  let snakeSpeed = initialSnakeSpeed;
  if (steroidConsumedRef.current) {
    snakeSpeed = getSnakeSpeedOnRoids(snakeSpeed);
  } else if (
    snakeFoodConsumed.current === 'creatine' ||
    creatineEffectDuration
  ) {
    snakeSpeed = getSnakeSpeedOnCreatine(snakeSpeed);
  }

  // Handling the multiplayer
  useEffect(() => {
    connection.on('data', (data: [] | 'LOST' | 'PLAY_AGAIN') => {
      console.log('Data recieved: ', data);
      if (data === 'LOST') {
        enemyCells.current = null;
        setPlayerWon(true);
        gameOverHandler();
      } else if (data === 'PLAY_AGAIN') {
        playAgainWithPlayer.current.friend = true;

        playAgain();
      } else {
        enemyCells.current = new Set(data);
      }
    });
  }, []);

  // Used for handling counting model etc etc
  useEffect(() => {
    if (gameOver !== !startGame) {
      setGameOver(!startGame);
    }
  }, [startGame]);

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

  // Multiplayer methods
  const sendData = (cells: Set<number>) => {
    connection.send(Array.from(cells));
  };

  const sendLostSignal = () => {
    connection.send('LOST');
  };

  const sendPlayAgainSignal = () => {
    connection.send('PLAY_AGAIN');
  };

  const moveSnake = () => {
    if (!isOutOfBounds()) {
      const newNode = getNextNodeForDirection(snake.head!, direction, board);

      // If it's not colliding
      if (!snakeCells.has(newNode.data!.value)) {
        const newSnakeCells = changeDirection(newNode, snake, snakeCells);

        const foodConsumed = newNode.data!.value === foodCell.value;
        if (foodConsumed) {
          consumeFood(newSnakeCells);
        }

        snakeCellsSizeRef.current = newSnakeCells.size;

        setSnakeCells(newSnakeCells);
        sendData(newSnakeCells);
      } else {
        setGameOver(true);
        openModal();
      }
    } else {
      sendLostSignal();
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
    setGameOver(true);
    openModal();
    cancelFoodDuration();

    // Turn off effects
    if (steroidConsumedRef.current) {
      steroidConsumedRef.current = false;

      delete effects.current['steroid'];
      delete effects.current['creatine'];
      delete effects.current['meat'];
      delete effects.current['protein'];

      cancelCreatineEffectDuration();
      cancelSteroidEffectDuration();
    }
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
      playAgainWithPlayer.current = {
        me: false,
        friend: false,
      };
      snakeRef.current = new SingleLinkedList(
        new Node(getInitialSnakeCell(board))
      );
      // TODO: REFRESH ENEMY CELLS. Set em to null
      enemyCells.current = null;

      // setSnakeCells(new Set([snake.head!.data!.value]));
      setSnakeCells(new Set([snakeRef.current.head!.data!.value]));

      const newFoodCell = {
        value: getFoodCell(board),
        food: getFoodType(),
      };
      setFoodCell(newFoodCell);
      snakeFoodConsumed.current = undefined;

      setDirection(generateRandomNum(0, 3));

      resetFoodDuration();

      setWaitingForPlayer(false);

      closeModal();

      // This will refresh and activate the initial modal
      activateInitialGetReadyModal();
    }
  };

  function onCreatineEffectOver() {
    delete effects.current['creatine'];

    // TODO: onCreatineEffectOver
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

  const effectsArr: { duration: number | null; food: FoodType }[] = [];
  for (let effect in effects.current) {
    effectsArr.push({
      duration: (effects.current as any)[effect] as number | null,
      food: effect as FoodType,
    });
  }

  const score = snakeCells.size - 1;

  return (
    <>
      <AvatarBar
        effects={effectsArr}
        score={score}
        untilNextFood={foodDuration}
      />
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
      >
        <Box
          outline='2px solid white'
          outlineColor='#2f2828'
          w={{ base: '100%', lg: '550px' }}
          className='board'
        >
          {board.map((row, index) => (
            <Flex key={index}>
              {row.map((cell) => {
                // Let this be standard cell
                let cellType: any = null;
                if (cell === snakeRef.current.head!.data!.value) {
                  cellType = (
                    <HeadCell direction={snake.head!.data!.direction} />
                  );
                } else if (cell === foodCell.value ? 'violet' : undefined) {
                  cellType = <FoodCell food={foodCell.food} />;
                } else if (
                  snake.tail?.data?.value === cell &&
                  snake.tail.data.value !== snake.head?.data?.value
                ) {
                  const snakeTailDirection = snake.tail!.data!.direction;
                  const snakeTailNextDirection =
                    snake.tail?.next?.data?.direction;

                  cellType = (
                    <TailCell
                      direction={snakeTailDirection}
                      nextDirection={snakeTailNextDirection}
                      // If it will change direction in the next step
                      isTransitional={
                        snakeTailDirection !== snakeTailNextDirection
                      }
                    />
                  );
                } else if (snakeCells.has(cell)) {
                  const match = snake.find((node) => node.data?.value === cell);

                  const currentDirection = match?.currentNode.data?.direction;
                  const nextDirection = match?.nextNode?.data?.direction;

                  cellType = (
                    <StandardCell
                      direction={currentDirection}
                      nextDirection={nextDirection}
                      isTransitional={currentDirection !== nextDirection}
                    />
                  );
                }

                return (
                  <Box
                    h={`${cellRef.current?.clientWidth}px`}
                    ref={cellRef}
                    flex={1}
                    outline='1px solid #2f2828'
                    key={cell}
                    bg={enemyCells.current?.has(cell) ? 'red' : undefined}
                  >
                    {cellType}
                  </Box>
                );
              })}
            </Flex>
          ))}
        </Box>
      </Flex>
      {!disableController && (
        <Controller
          changeDirection={(_direction: DIRECTION) => setDirection(_direction)}
          currentDirection={direction}
        />
      )}
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
        onMenuClick={togglePlayGame}
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
