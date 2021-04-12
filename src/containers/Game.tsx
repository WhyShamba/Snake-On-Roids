/* eslint-disable react-hooks/exhaustive-deps */
import { useDisclosure } from '@chakra-ui/react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { AvatarBar } from '../components/AvatarBar';
import Board from '../components/Board';
import { Controller } from '../components/Controller';
import { GameOverModal } from '../components/GameOverModal';
import { MainContext } from '../context';
import { useCountdownInfinete } from '../custom-hooks/useCountdown';
import { useSetInterval } from '../custom-hooks/useSetInterval';
import { useSnakeMovementImproved } from '../custom-hooks/useSnakeMovement';
import { mainReducer } from '../store/reducers/snakeReducer';
import { initialState, timerReducer } from '../store/reducers/timerReducer';
import { DIRECTION, FoodType, SnakeReducerActionType } from '../types/types';
import { generateRandomNum } from '../utils/generateRandomNum';
import { isOutOfBounds } from '../utils/isOutOfBounds';
import { Node, SingleLinkedList } from '../utils/SingleLinkedList';
import {
  getSnakeSpeedOnCreatine,
  getSnakeSpeedOnRoids,
} from '../utils/snake/calculateSnakeSpeed';
import {
  getFoodCell,
  getFoodType,
  getInitialSnakeCell,
  getInitialSnakeProperties,
} from '../utils/snake/initializers';
import { getNextNodeForDirection } from '../utils/snake/snake-coordination';
import {
  growSnake,
  removeCells,
  reverseSnake,
} from '../utils/snake/snakeManipulationMethods';

const Game = () => {
  // Global game settings
  const {
    togglePlayGame,
    snakeSpeed: initialSnakeSpeed,
    disableController,
    board,
  } = useContext(MainContext);
  const [timerState, timerDispatch] = useReducer(timerReducer, initialState);
  const [snakeState, snakeDispatch] = useReducer(mainReducer, {
    ...getInitialSnakeProperties(board, false, false),
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
  // Game over modal
  const {
    isOpen: gameOver,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  // Snake speed
  let snakeSpeed = initialSnakeSpeed;
  if (timerState.currentFoodEffect === 'steroid') {
    snakeSpeed = getSnakeSpeedOnRoids(snakeSpeed);
  } else if (timerState.currentFoodEffect === 'creatine') {
    snakeSpeed = getSnakeSpeedOnCreatine(snakeSpeed);
  }

  useSetInterval(() => {
    if (!gameOver) onMove();
  }, snakeSpeed);

  const { startTicks, stopTicks } = useCountdownInfinete(
    () =>
      timerDispatch({
        type: 'TICK',
      }),
    true
  );

  useEffect(() => {
    if (gameOver) {
      stopTicks();
    } else {
      startTicks();
    }
  }, [gameOver]);

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
        !snakeState.snakeCells.includes(newNode.data!.value)
        // &&
        // !snakeState.enemy?.snakeCells.includes(newNode.data!.value)
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
        });
      } else {
        gameOverHandler();
      }
    } else {
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
    };
  };

  // Game over and play again methods
  function gameOverHandler() {
    // Turn off effects
    timerDispatch({ type: 'GAME_OVER' });

    openModal();
  }

  // Reset the game to initial state
  const playAgain = () => {
    snakeRef.current = new SingleLinkedList(
      new Node(getInitialSnakeCell(board))
    );

    timerDispatch({ type: 'PLAY_AGAIN' });
    snakeDispatch({ type: 'PLAY_AGAIN' });

    setDirection(generateRandomNum(0, 3));

    closeModal();
  };

  return (
    <>
      <AvatarBar
        effects={timerState.effectsCount}
        score={snakeState.score}
        untilNextFood={timerState.foodCount}
      />
      <Board
        board={board}
        foodCell={snakeState.foodCell}
        snakeCells={snakeState.snakeCells}
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
        score={snakeState.score}
        onPlayAgain={playAgain}
        onMenuClick={togglePlayGame}
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

export default Game;
