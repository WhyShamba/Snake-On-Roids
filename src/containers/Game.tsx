import { Box, Flex } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AvatarBar } from '../components/AvatarBar';
import { FoodCell } from '../components/Cells/FoodCell';
import { HeadCell } from '../components/Cells/HeadCell';
import { StandardCell } from '../components/Cells/StandardCell';
import { TailCell } from '../components/Cells/TailCell';
import { Controller } from '../components/Controller';
import { GameOverModal } from '../components/GameOverModal';
import {
  CREATINE_EFFECT_DURATION,
  FOOD_DURATION,
  STEROID_EFFECT_DURATION,
} from '../consts';
import { MainContext } from '../context';
import { useCountdown } from '../custom-hooks/useCountdown';
import { useSetInterval } from '../custom-hooks/useSetInterval';
import { useSnakeMovement } from '../custom-hooks/useSnakeMovement';
import { generateRandomNum } from '../utils/generateRandomNum';
import { Node, SingleLinkedList } from '../utils/SingleLinkedList';
import {
  getSnakeSpeedOnCreatine,
  getSnakeSpeedOnRoids,
} from '../utils/snake/calculateSnakeSpeed';
import {
  getFoodCell,
  getFoodType,
  getInitialSnakeCell,
} from '../utils/snake/initializers';
import {
  changeDirection,
  getNextNodeForDirection,
  getOppositeDirection,
} from '../utils/snake/snake-coordination';

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

const Game = () => {
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
  // TODO: maybe remove setscore since this is equal to snakeCells.size - 1 and snakeCellsRef - 1, and it causes unecessery render
  const [score, setScore] = useState(0);
  const [foodCell, setFoodCell] = useState({
    value: getFoodCell(board),
    food: getFoodType(),
  });
  const steroidConsumedRef = useRef(false);
  const {
    count: steroidEffectDuration,
    resetCount: resetSteroidEffectDuration,
    cancelCountdown: cancelSteroidEffectDuration,
    // TODO: onSteroidEffectOver
  } = useCountdown(0, removeCells);
  const {
    count: creatineEffectDuration,
    resetCount: resetCreatineEffectDuration,
    cancelCountdown: cancelCreatineEffectDuration,
  } = useCountdown(0, () => {
    delete effects.current['creatine'];

    // TODO: onCreatineEffectOver
    if (!steroidConsumedRef.current && !gameOver) {
      // Side effects for creatine
      reverseSnake();
    }
  });
  const {
    isOpen: gameOver,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
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

  let snakeSpeed = initialSnakeSpeed;
  if (steroidConsumedRef.current) {
    snakeSpeed = getSnakeSpeedOnRoids(snakeSpeed);
  } else if (
    snakeFoodConsumed.current === 'creatine' ||
    creatineEffectDuration
  ) {
    snakeSpeed = getSnakeSpeedOnCreatine(snakeSpeed);
  }

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
      } else {
        openModal();
      }
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

  function removeCells() {
    if (!gameOver) {
      delete effects.current['steroid'];

      // For roid effect
      if (steroidConsumedRef.current && snakeCells.size > 1) {
        console.log(
          `Mssg to display: You haven't consumed steroids in the last 30 sec, you will shrink`
        );
        const newSnakeCells = new Set(snakeCells);

        const removeCellsNumber =
          newSnakeCells.size - 3 > 1 ? newSnakeCells.size - 3 : 1;
        while (newSnakeCells.size !== removeCellsNumber) {
          const removedTail = snake.deque();
          newSnakeCells.delete(removedTail!.data!.value);
        }

        setScore(newSnakeCells.size - 1);

        steroidConsumedRef.current = false;
        setSnakeCells(newSnakeCells);
      }
    }
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
      setScore(score + 1);
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
      setScore(score + 1);
    } else if (foodCell.food === 'steroid') {
      for (let index = 0; index < 2; index++) {
        growSnake(newSnakeCells);
      }

      snakeFoodConsumed.current = 'steroid';
      steroidConsumedRef.current = true;
      resetSteroidEffectDuration(STEROID_EFFECT_DURATION);

      setScore(score + 2);
    }

    resetFoodDuration();
    // generate new food cell
    generateFoodCell();
  };

  // Reset the game to initial state
  const playAgain = () => {
    snakeRef.current = new SingleLinkedList(
      new Node(getInitialSnakeCell(board))
    );

    // setSnakeCells(new Set([snake.head!.data!.value]));
    setSnakeCells(new Set([snakeRef.current.head!.data!.value]));

    const newFoodCell = {
      value: getFoodCell(board),
      food: getFoodType(),
    };
    setFoodCell(newFoodCell);
    snakeFoodConsumed.current = undefined;

    setDirection(generateRandomNum(0, 3));
    setScore(0);

    resetFoodDuration();

    closeModal();
  };

  const effectsArr: { duration: number | null; food: FoodType }[] = [];
  for (let effect in effects.current) {
    effectsArr.push({
      duration: (effects.current as any)[effect] as number | null,
      food: effect as FoodType,
    });
  }

  return (
    <>
      <Flex
        direction='column'
        align='center'
        boxShadow='lg'
        borderRadius='md'
        border='1px solid #ffffff0a'
        p={10}
        bg='primary.main'
        zIndex={1}
      >
        <AvatarBar
          effects={effectsArr}
          score={score}
          untilNextFood={foodDuration}
        />
        <Box outline='2px solid white' outlineColor='#2f2828' w='550px'>
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
                    h={cellRef.current?.clientWidth}
                    ref={cellRef}
                    flex={1}
                    outline='1px solid #2f2828'
                    key={cell}
                  >
                    {cellType}
                  </Box>
                );
              })}
            </Flex>
          ))}
        </Box>
        {!disableController && (
          <Controller
            changeDirection={(_direction: DIRECTION) =>
              setDirection(_direction)
            }
            currentDirection={direction}
          />
        )}
      </Flex>
      <GameOverModal
        isOpen={gameOver}
        onClose={closeModal}
        score={score}
        onPlayAgain={playAgain}
        onMenuClick={togglePlayGame}
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

export default Game;
