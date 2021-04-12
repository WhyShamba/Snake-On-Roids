/* eslint-disable react-hooks/exhaustive-deps */
import { useDisclosure } from '@chakra-ui/react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  CREATINE_EFFECT_DURATION,
  FOOD_DURATION,
  STEROID_EFFECT_DURATION,
} from '../../consts';
import { MainContext } from '../../context';
import { useCountdown } from '../../custom-hooks/useCountdown';
import { useSetInterval } from '../../custom-hooks/useSetInterval';
import { useSnakeMovement } from '../../custom-hooks/useSnakeMovement';
import { DIRECTION, FoodType } from '../../types/types';
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
import { AvatarBar } from '../AvatarBar';
import Board from '../Board';
import { Controller } from '../Controller';
import { GameOverModal } from '../GameOverModal';
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
  } = useCountdown(0, false, onSteroidEffectOver);
  const {
    count: creatineEffectDuration,
    resetCount: resetCreatineEffectDuration,
    cancelCountdown: cancelCreatineEffectDuration,
  } = useCountdown(0, false, onCreatineEffectOver);
  const {
    isOpen: gameOver,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  const {
    count: foodDuration,
    resetCount: resetFoodDuration,
    cancelCountdown: cancelFoodDuration,
  } = useCountdown(FOOD_DURATION, true, () => {
    if (!gameOver) {
      generateFoodCell();
      resetFoodDuration();
    }
  });
  const snakeFoodConsumed = useRef<FoodType>();
  const effects = useRef<{ [food: string]: number | null }>({});

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
        // oncollision
        gameOverHandler();
      }
    } else {
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
    openModal();
    cancelFoodDuration();

    // Turn off effects
    if (steroidConsumedRef.current) {
      steroidConsumedRef.current = false;

      cancelSteroidEffectDuration();
    }
    if (creatineEffectDuration) {
      cancelCreatineEffectDuration();
    }

    // delete effects.current['steroid'];
    // delete effects.current['creatine'];
    // delete effects.current['meat'];
    // delete effects.current['protein'];
    effects.current = {};
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

    resetFoodDuration();

    closeModal();
  };

  // Side effects that can happen
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
      <Board
        board={board}
        foodCell={foodCell}
        snakeCells={snakeCells}
        snakeRef={snakeRef}
      />
      <Controller
        changeDirection={useCallback(
          (_direction: DIRECTION) => setDirection(_direction),
          []
        )}
        currentDirection={direction}
        disable={disableController}
      />
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
